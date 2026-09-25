<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeamAvailability extends Model
{
    protected $fillable = [
        'id_fixture',
        'id_team',
        'date',
        'start_time',
        'end_time',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
    ];

    public function fixture(): BelongsTo
    {
        return $this->belongsTo(Fixture::class, 'id_fixture', 'id');
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'id_team', 'id');
    }
}
