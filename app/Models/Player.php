<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Player extends Model
{
    protected $fillable = [
        'id_team',
        'name_player',
        'birthdate_player',
        'number_player',
    ];

    protected $casts = [
        'id_team' => 'integer',
        'birthdate_player' => 'date:Y-m-d',
        'number_player' => 'integer',
    ];

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'id_team', 'id');
    }
}
