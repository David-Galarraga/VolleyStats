<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MatchRosterPlayer extends Model
{
    protected $fillable = [
        'match_roster_id',
        'player_id',
        'team_id',
        'name_player',
        'dni_player',
    ];

    protected $casts = [
        'match_roster_id' => 'integer',
        'player_id' => 'integer',
        'team_id' => 'integer',
        'dni_player' => 'string',
    ];

    public function roster(): BelongsTo
    {
        return $this->belongsTo(MatchRoster::class, 'match_roster_id', 'id');
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
