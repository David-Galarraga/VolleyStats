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
    ];

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class, 'game_id', 'id');
    }
}
