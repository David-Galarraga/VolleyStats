<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserType extends Model
{

    public $timestamps = false;

    protected $primaryKey = 'id_user_type';
    
    protected $fillable = [
        'name_user_type',
        'description_user_type',
    ];
}
