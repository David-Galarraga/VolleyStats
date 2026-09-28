<?php

namespace App\Services;

use App\Models\Fixture;
use App\Models\TeamAvailability;

class AvailabilityService
{
    /**
     * Convert a "HH:MM" or "HH:MM:SS" time string to minutes since midnight.
     */
    public static function toMinutes(string $time): int
    {
        $parts = array_pad(explode(':', $time), 2, 0);

        return (int) $parts[0] * 60 + (int) $parts[1];
    }

    /**
     * Convert minutes since midnight back to a "HH:MM" string.
     */
    public static function fromMinutes(int $minutes): string
    {
        $minutes = max(0, min($minutes, 24 * 60 - 1));

        return sprintf('%02d:%02d', intdiv($minutes, 60), $minutes % 60);
    }

    /**
     * Whether two time windows overlap.
     */
    public static function overlaps(string $startA, string $endA, string $startB, string $endB): bool
    {
        return self::toMinutes($startA) < self::toMinutes($endB)
            && self::toMinutes($startB) < self::toMinutes($endA);
    }

    /**
     * Intersection of two time windows, or null if they don't overlap.
     *
     * @return array{start: string, end: string}|null
     */
    public static function intersection(string $startA, string $endA, string $startB, string $endB): ?array
    {
        if (! self::overlaps($startA, $endA, $startB, $endB)) {
            return null;
        }

        $start = max(self::toMinutes($startA), self::toMinutes($startB));
        $end = min(self::toMinutes($endA), self::toMinutes($endB));

        return [
            'start' => self::fromMinutes($start),
            'end' => self::fromMinutes($end),
        ];
    }

    /**
     * Whether a time falls within a window (inclusive).
     */
    public static function windowContainsTime(string $start, string $end, string $time): bool
    {
        $minutes = self::toMinutes($time);

        return $minutes >= self::toMinutes($start) && $minutes <= self::toMinutes($end);
    }

    /**
     * Whether a team has at least one availability window on a given date
     * that contains the given time.
     */
    public static function teamHasWindow(Fixture $fixture, int $teamId, string $date, string $time): bool
    {
        return $fixture->availabilities()
            ->where('id_team', $teamId)
            ->where('date', $date)
            ->get()
            ->contains(fn (TeamAvailability $window) => self::windowContainsTime(
                $window->start_time,
                $window->end_time,
                $time
            ));
    }

    /**
     * IDs of teams (other than the local team) whose availability overlaps
     * with at least one window of the local team on the given date.
     *
     * @return array<int, int>
     */
    public static function compatibleOpponentIds(Fixture $fixture, int $localTeamId, string $date): array
    {
        $localWindows = $fixture->availabilities()
            ->where('id_team', $localTeamId)
            ->where('date', $date)
            ->get();

        if ($localWindows->isEmpty()) {
            return [];
        }

        $others = $fixture->availabilities()
            ->where('id_team', '!=', $localTeamId)
            ->where('date', $date)
            ->get();

        $compatible = [];

        foreach ($others as $window) {
            foreach ($localWindows as $localWindow) {
                if (self::overlaps(
                    $localWindow->start_time,
                    $localWindow->end_time,
                    $window->start_time,
                    $window->end_time
                )) {
                    $compatible[$window->id_team] = true;
                    break;
                }
            }
        }

        return array_keys($compatible);
    }
}
