<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Standing extends Model
{
    protected $fillable = [
        'id_team',
        'id_category',
        'matches_played',
        'matches_won',
        'matches_lost',
        'sets_for',
        'sets_against',
        'points',
    ];

    public function team()
    {
        return $this->belongsTo(Team::class, 'id_team', 'id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'id_category', 'id_category');
    }

}

