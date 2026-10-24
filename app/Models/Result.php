<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Result extends Model
{
    protected $fillable = [
        'game_id',
        'sets_local',
        'sets_visitor',
        'set_1_points_local',
        'set_1_points_visitor',
        'set_2_points_local',
        'set_2_points_visitor',
        'set_3_points_local',
        'set_3_points_visitor',
        'set_4_points_local',
        'set_4_points_visitor',
        'set_5_points_local',
        'set_5_points_visitor',
    ];

    protected $casts = [
        'game_id' => 'integer',
        'sets_local' => 'integer',
        'sets_visitor' => 'integer',
        'set_1_points_local' => 'integer',
        'set_1_points_visitor' => 'integer',
        'set_2_points_local' => 'integer',
        'set_2_points_visitor' => 'integer',
        'set_3_points_local' => 'integer',
        'set_3_points_visitor' => 'integer',
        'set_4_points_local' => 'integer',
        'set_4_points_visitor' => 'integer',
        'set_5_points_local' => 'integer',
        'set_5_points_visitor' => 'integer',
    ];

    public function isValidForFormat(string $format): bool
    {
        $target = $format === 'best_of_5' ? 3 : 2;
        $localSets = (int) $this->sets_local;
        $visitorSets = (int) $this->sets_visitor;

        if (($localSets !== $target && $visitorSets !== $target)
            || $localSets > $target || $visitorSets > $target
            || $localSets + $visitorSets < $target
            || $localSets + $visitorSets > ($target * 2) - 1) {
            return false;
        }

        $winnerSetCount = 0;
        $playedSets = $localSets + $visitorSets;

        for ($set = 1; $set <= 5; $set++) {
            $local = $this->{'set_'.$set.'_points_local'};
            $visitor = $this->{'set_'.$set.'_points_visitor'};

            if ($set > $playedSets) {
                if ($local !== null || $visitor !== null) return false;
                continue;
            }

            if ($local === null || $visitor === null || abs((int) $local - (int) $visitor) < 2) return false;
            if ($local > $visitor) $winnerSetCount++;
        }

        return $winnerSetCount === $localSets;
    }

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class, 'game_id', 'id');
    }
}
