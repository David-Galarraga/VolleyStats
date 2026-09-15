<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Game extends Model
{
    protected $fillable = [
        'id_tournament',
        'id_fixture',
        'id_team_local',
        'id_team_visitor',
        'id_referee',
        'date',
        'time',
        'status_game',
        'set_local',
        'set_visitor',
        'result',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
        'set_local' => 'integer',
        'set_visitor' => 'integer',
    ];

    protected $appends = [
        'day',
    ];

    public function getDayAttribute(): ?string
    {
        if (! $this->id_fixture || ! $this->date) {
            return null;
        }

        $fixture = $this->relationLoaded('fixture')
            ? $this->fixture
            : $this->fixture()->first();

        if (! $fixture) {
            return null;
        }

        if ($this->date->isSameDay($fixture->start_date)) {
            return 'sábado';
        }

        if ($this->date->isSameDay($fixture->end_date)) {
            return 'domingo';
        }

        return null;
    }

    public function tournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class, 'id_tournament', 'id');
    }

    public function fixture(): BelongsTo
    {
        return $this->belongsTo(Fixture::class, 'id_fixture', 'id');
    }

    public function teamLocal(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'id_team_local', 'id');
    }

    public function teamVisitor(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'id_team_visitor', 'id');
    }

    public function referee(): BelongsTo
    {
        return $this->belongsTo(Referee::class, 'id_referee', 'id');
    }
}
