<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Delegate extends Model
{
    public $timestamps = false;

    protected $primaryKey = 'id_delegate';

    protected $fillable = [
        'id_tournament',
        'dni_delegate',
        'name_delegate',
        'email_delegate',
        'phone_delegate',
    ];
}
