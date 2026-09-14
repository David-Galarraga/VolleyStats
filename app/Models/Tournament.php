<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tournament extends Model
{
    protected $fillable = [
        'id_category',
        'name_tournament',
        'start_date',
        'end_date',
        'number_matches',
        'number_teams',
        'status_tournament',
    ];

    protected $casts = [
        'start_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
        'number_matches' => 'integer',
        'number_teams' => 'integer',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'id_category', 'id_category');
    }

    public function games(): HasMany
    {
        return $this->hasMany(Game::class, 'id_tournament', 'id');
    }
}
