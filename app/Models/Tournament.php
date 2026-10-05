<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tournament extends Model
{
    protected $fillable = [
        'name_tournament',
        'start_date',
        'end_date',
        'status_tournament',
    ];

    protected $casts = [
        'start_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
    ];

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 
                                            'tournament_categories', 
                                            'id_tournament', 
                                            'id_category'
                                            )->withPivot('number_matches',
                                                        'number_teams');
    }

    public function games(): HasMany
    {
        return $this->hasMany(Game::class, 'id_tournament', 'id');
    }
}
