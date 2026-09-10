<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    protected $fillable = [
        'name_team',
        'city_team',
        'id_category',
        'id_trainer',
        'id_delegate',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class, 'id_category', 'id_category');
    }

    public function trainer()
    {
        return $this->belongsTo(Trainer::class, 'id_trainer', 'id_trainer');
    }

    public function delegate()
    {
        return $this->belongsTo(Delegate::class, 'id_delegate', 'id_delegate');
    }
}
