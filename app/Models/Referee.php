<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Referee extends Model
{
    protected $fillable = [
        'name_referee',
        'email_referee',
        'phone_referee',
    ];
}
