<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GameSheetPlayer extends Model
{
    protected $fillable = [
        'game_sheet_id',
        'player_id',
        'team_id',
        'name_player',
        'dni_player',
        'present',
    ];

    protected $casts = [
        'game_sheet_id' => 'integer',
        'player_id' => 'integer',
        'team_id' => 'integer',
        'present' => 'boolean',
    ];

    public function sheet(): BelongsTo
    {
        return $this->belongsTo(GameSheet::class, 'game_sheet_id', 'id');
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class, 'player_id', 'id');
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'team_id', 'id');
    }
}
