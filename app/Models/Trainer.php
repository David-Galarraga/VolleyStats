<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Trainer extends Model
{
    public $timestamps = false;

    protected $primaryKey = 'id_trainer';

    protected $fillable = [
        'name_trainer',
        'dni_trainer',
        'birthdate_trainer',
    ];

    protected $casts = [
        'birthdate_trainer' => 'date:Y-m-d',
    ];

    public function teams()
    {
        return $this->hasMany(Team::class, 'id_trainer', 'id_trainer');
    }
}
