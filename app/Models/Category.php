<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Category extends Model
{

    public $timestamps = false;

    protected $primaryKey = 'id_category';

    protected $fillable = [
        'name_category',
        'genero_category',
    ];

    public function tournaments()
    {
        return $this->belongsToMany(Tournament::class, 
                                    'tournament_categories', 
                                    'id_category', 
                                    'id_tournament'
                                    )->withPivot('number_matches',
                                                'number_teams');
    }
}
