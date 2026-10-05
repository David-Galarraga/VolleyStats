<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Referee extends Model
{
    protected $fillable = [
        'name_referee',
        'phone_referee',
    ];

    public function games(): HasMany
    {
        return $this->hasMany(Game::class, 'id_referee', 'id');
    }
}
