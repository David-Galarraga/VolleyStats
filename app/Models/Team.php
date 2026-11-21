<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    protected $fillable = [
        'id_tournament',
        'registration_status',
        'legacy_source_id',
        'name_team',
        'city_team',
        'id_category',
        'id_delegate',
        'id_trainer',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class, 'id_category', 'id_category');
    }

    public function tournament()
    {
        return $this->belongsTo(Tournament::class, 'id_tournament');
    }

    public function scopeForCompetition($query, int $tournament)
    {
        return $query->where('id_tournament', $tournament)->where('registration_status', 'confirmed');
    }

    public function delegate()
    {
        return $this->belongsTo(Delegate::class, 'id_delegate', 'id_delegate');
    }

    public function trainer()
    {
        return $this->belongsTo(Trainer::class, 'id_trainer', 'id_trainer');
    }

    public function players()
    {
        return $this->hasMany(Player::class, 'id_team', 'id');
    }

    public function availabilities()
    {
        return $this->hasMany(TeamAvailability::class, 'id_team', 'id');
    }
}
