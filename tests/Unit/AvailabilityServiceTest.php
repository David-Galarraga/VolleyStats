<?php

namespace Tests\Unit;

use App\Services\AvailabilityService;
use PHPUnit\Framework\TestCase;

class AvailabilityServiceTest extends TestCase
{
    public function test_overlaps_returns_true_when_windows_share_time(): void
    {
        $this->assertTrue(AvailabilityService::overlaps('14:00', '17:00', '12:00', '19:00'));
        $this->assertTrue(AvailabilityService::overlaps('14:00', '17:00', '16:00', '18:00'));
    }

    public function test_overlaps_returns_false_when_windows_do_not_share_time(): void
    {
        $this->assertFalse(AvailabilityService::overlaps('10:00', '14:00', '14:00', '18:00'));
        $this->assertFalse(AvailabilityService::overlaps('14:00', '17:00', '17:00', '19:00'));
    }

    public function test_intersection_returns_shared_window(): void
    {
        $result = AvailabilityService::intersection('14:00', '17:00', '12:00', '19:00');

        $this->assertSame(['start' => '14:00', 'end' => '17:00'], $result);
    }

    public function test_intersection_returns_null_without_overlap(): void
    {
        $this->assertNull(AvailabilityService::intersection('10:00', '14:00', '14:00', '18:00'));
    }

    public function test_window_contains_time(): void
    {
        $this->assertTrue(AvailabilityService::windowContainsTime('14:00', '17:00', '14:00'));
        $this->assertTrue(AvailabilityService::windowContainsTime('14:00', '17:00', '16:59'));
        $this->assertFalse(AvailabilityService::windowContainsTime('14:00', '17:00', '17:01'));
    }

    public function test_time_conversion_round_trips(): void
    {
        $this->assertSame(0, AvailabilityService::toMinutes('00:00'));
        $this->assertSame(14 * 60 + 30, AvailabilityService::toMinutes('14:30'));
        $this->assertSame('14:30', AvailabilityService::fromMinutes(14 * 60 + 30));
    }
}
