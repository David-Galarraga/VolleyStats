<?php

namespace App\Services;

use App\Models\Game;
use App\Models\Result;
use App\Models\Team;
use App\Models\Tournament;
use Illuminate\Support\Collection;

class StandingsService
{
    /**
     * List every tournament/category combination that can have a standings table.
     *
     * @return Collection<int, array<string, int|string>>
     */
    public function combinations(): Collection
    {
        return Tournament::query()
            ->whereHas('categories')
            ->with(['categories' => fn ($query) => $query->orderBy('name_category')])
            ->orderByDesc('start_date')
            ->get()
            ->flatMap(fn (Tournament $tournament) => $tournament->categories->map(fn ($category) => [
                'value' => $tournament->id.':'.$category->id_category,
                'tournament_id' => (int) $tournament->id,
                'tournament_name' => $tournament->name_tournament,
                'category_id' => (int) $category->id_category,
                'category_name' => $category->name_category,
                'category_gender' => $category->genero_category,
            ]))
            ->values();
    }

    /**
     * Resolve the requested tournament/category combination and its standings.
     *
     * @return array{combinations: Collection, selectedCombination: array<string, int|string>|null, standings: Collection}
     */
    public function forRequestedCombination(?string $requested): array
    {
        $combinations = $this->combinations();

        $selected = $combinations->firstWhere('value', $requested)
            ?? $combinations->first();

        $standings = $selected
            ? $this->calculate($selected['tournament_id'], $selected['category_id'])
            : collect();

        return [
            'combinations' => $combinations,
            'selectedCombination' => $selected,
            'standings' => $standings,
        ];
    }

    /**
     * Calculate standings from completed game results for one tournament category.
     *
     * @return Collection<int, array<string, int|string>>
     */
    public function calculate(int $tournamentId, int $categoryId): Collection
    {
        $teams = Team::query()
            ->where('id_category', $categoryId)
            ->orderBy('name_team')
            ->get(['id', 'name_team']);

        $standings = $teams->mapWithKeys(fn (Team $team) => [
            $team->id => [
                'team_id' => (int) $team->id,
                'team_name' => $team->name_team,
                'matches_played' => 0,
                'matches_won' => 0,
                'matches_lost' => 0,
                'sets_for' => 0,
                'sets_against' => 0,
                'classification_points' => 0,
                'points_scored' => 0,
            ],
        ]);

        if ($teams->isEmpty()) {
            return collect();
        }

        $teamIds = $teams->modelKeys();
        $games = Game::query()
            ->where('id_tournament', $tournamentId)
            ->where('id_category', $categoryId)
            ->where('status_game', 'finished')
            ->whereIn('id_team_local', $teamIds)
            ->whereIn('id_team_visitor', $teamIds)
            ->whereHas('matchResult')
            ->with('matchResult')
            ->get();

        foreach ($games as $game) {
            $result = $game->matchResult;

            if (! $result instanceof Result || ! $this->isCompleteAndValid($result)) {
                continue;
            }

            $localId = (int) $game->id_team_local;
            $visitorId = (int) $game->id_team_visitor;

            if ($localId === $visitorId || ! $standings->has($localId) || ! $standings->has($visitorId)) {
                continue;
            }

            $localStats = $standings->get($localId);
            $visitorStats = $standings->get($visitorId);
            $localSets = (int) $result->sets_local;
            $visitorSets = (int) $result->sets_visitor;

            $localStats['matches_played']++;
            $visitorStats['matches_played']++;
            $localStats['sets_for'] += $localSets;
            $localStats['sets_against'] += $visitorSets;
            $visitorStats['sets_for'] += $visitorSets;
            $visitorStats['sets_against'] += $localSets;

            $localStats['points_scored'] += $this->pointsScoredByLocal($result);
            $visitorStats['points_scored'] += $this->pointsScoredByVisitor($result);

            if ($localSets === 2) {
                $localStats['matches_won']++;
                $visitorStats['matches_lost']++;
                $localStats['classification_points'] += $visitorSets === 0 ? 3 : 2;
                $visitorStats['classification_points'] += $visitorSets === 1 ? 1 : 0;
            } else {
                $visitorStats['matches_won']++;
                $localStats['matches_lost']++;
                $visitorStats['classification_points'] += $localSets === 0 ? 3 : 2;
                $localStats['classification_points'] += $localSets === 1 ? 1 : 0;
            }

            $standings->put($localId, $localStats);
            $standings->put($visitorId, $visitorStats);
        }

        return $standings
            ->sort(function (array $left, array $right) {
                return ($right['classification_points'] <=> $left['classification_points'])
                    ?: ($right['points_scored'] <=> $left['points_scored'])
                    ?: ($right['matches_won'] <=> $left['matches_won'])
                    ?: strcasecmp($left['team_name'], $right['team_name']);
            })
            ->values()
            ->map(fn (array $standing, int $index) => ['position' => $index + 1] + $standing);
    }

    private function isCompleteAndValid(Result $result): bool
    {
        $localSets = (int) $result->sets_local;
        $visitorSets = (int) $result->sets_visitor;
        $validOverallScore = ($localSets === 2 && in_array($visitorSets, [0, 1], true))
            || ($visitorSets === 2 && in_array($localSets, [0, 1], true));

        if (! $validOverallScore) {
            return false;
        }

        $scores = [
            [$result->set_1_points_local, $result->set_1_points_visitor],
            [$result->set_2_points_local, $result->set_2_points_visitor],
        ];

        if (in_array(null, $scores[0], true) || in_array(null, $scores[1], true)) {
            return false;
        }

        $thirdSetWasPlayed = $localSets + $visitorSets === 3;
        $thirdLocal = $result->set_3_points_local;
        $thirdVisitor = $result->set_3_points_visitor;

        if ($thirdSetWasPlayed) {
            if ($thirdLocal === null || $thirdVisitor === null) {
                return false;
            }

            $scores[] = [$thirdLocal, $thirdVisitor];
        } elseif ($thirdLocal !== null || $thirdVisitor !== null) {
            return false;
        }

        $setWinners = [];

        foreach ($scores as [$localPoints, $visitorPoints]) {
            if ($localPoints === null || $visitorPoints === null) {
                return false;
            }

            $localPoints = (int) $localPoints;
            $visitorPoints = (int) $visitorPoints;

            if ($localPoints < 0 || $visitorPoints < 0 || abs($localPoints - $visitorPoints) < 2) {
                return false;
            }

            $setWinners[] = $localPoints > $visitorPoints ? 'local' : 'visitor';
        }

        if ($thirdSetWasPlayed && $setWinners[0] === $setWinners[1]) {
            return false;
        }

        return count(array_filter($setWinners, fn (string $winner) => $winner === 'local')) === $localSets
            && count(array_filter($setWinners, fn (string $winner) => $winner === 'visitor')) === $visitorSets;
    }

    private function pointsScoredByLocal(Result $result): int
    {
        return (int) $result->set_1_points_local
            + (int) $result->set_2_points_local
            + (int) ($result->set_3_points_local ?? 0);
    }

    private function pointsScoredByVisitor(Result $result): int
    {
        return (int) $result->set_1_points_visitor
            + (int) $result->set_2_points_visitor
            + (int) ($result->set_3_points_visitor ?? 0);
    }
}
