<?php

namespace Tests\Unit;

use App\Models\Result;
use PHPUnit\Framework\TestCase;

class ResultFormatTest extends TestCase
{
    public function test_best_of_three_accepts_two_zero_and_two_one(): void
    {
        $this->assertTrue($this->buildResult(2, 0, [25, 20], [25, 18])->isValidForFormat('best_of_3'));
        $this->assertTrue($this->buildResult(2, 1, [25, 20], [20, 25], [25, 23])->isValidForFormat('best_of_3'));
    }

    public function test_best_of_five_accepts_three_two_and_rejects_nonplayed_or_inconsistent_sets(): void
    {
        $valid = $this->buildResult(3, 2, [25, 20], [20, 25], [25, 18], [22, 25], [15, 13]);
        $this->assertTrue($valid->isValidForFormat('best_of_5'));

        $valid->set_5_points_visitor = 18;
        $this->assertFalse($valid->isValidForFormat('best_of_5'));

        $nonPlayed = $this->buildResult(3, 0, [25, 20], [25, 18], [25, 19]);
        $nonPlayed->set_4_points_local = 1;
        $nonPlayed->set_4_points_visitor = 0;
        $this->assertFalse($nonPlayed->isValidForFormat('best_of_5'));
    }

    private function buildResult(int $local, int $visitor, array ...$sets): Result
    {
        $attributes = ['sets_local' => $local, 'sets_visitor' => $visitor];
        foreach ($sets as $index => [$localPoints, $visitorPoints]) {
            $set = $index + 1;
            $attributes["set_{$set}_points_local"] = $localPoints;
            $attributes["set_{$set}_points_visitor"] = $visitorPoints;
        }

        return new Result($attributes);
    }
}
