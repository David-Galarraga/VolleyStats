<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Trainer extends Model
{
    public $timestamps = false;

    protected $primaryKey = 'id_trainer';

    protected $fillable = [
        'name_trainer',
        'phone_trainer',
        'email_trainer',
    ];
}
