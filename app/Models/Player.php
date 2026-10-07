<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Player extends Model
{
    protected $fillable = [
        'id_team',
        'name_player',
        'dni_player',
        'birthdate_player',
    ];

    protected $casts = [
        'id_team' => 'integer',
        'birthdate_player' => 'date:Y-m-d',
        'dni_player' => 'string',
    ];

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'id_team', 'id');
    }

    public function sheetEntries(): HasMany
    {
        return $this->hasMany(GameSheetPlayer::class, 'player_id', 'id');
    }
}
