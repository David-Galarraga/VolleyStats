<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Fixture extends Model
{
    protected $fillable = [
        'id_tournament',
        'name_fixture',
        'start_date',
        'end_date',
        'status_fixture',
    ];

    protected $casts = [
        'start_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
    ];

    public function tournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class, 'id_tournament', 'id');
    }

    public function games(): HasMany
    {
        return $this->hasMany(Game::class, 'id_fixture', 'id');
    }
}
