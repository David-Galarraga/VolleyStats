<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Game extends Model
{
    protected $fillable = [
        'id_tournament',
        'id_category',
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
        'id_referee' => 'integer',
        'id_category' => 'integer',
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

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'id_category', 'id_category');
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

    public function matchResult(): HasOne
    {
        return $this->hasOne(Result::class, 'game_id', 'id');
    }

    public function sheet(): HasOne
    {
        return $this->hasOne(GameSheet::class, 'game_id', 'id');
    }

    public function rosters(): HasMany
    {
        return $this->hasMany(MatchRoster::class, 'game_id', 'id');
    }

    public function rosterForTeam(int $teamId): ?MatchRoster
    {
        return $this->rosters()->where('team_id', $teamId)->first();
    }

    public function hasStarted(): bool
    {
        if (! $this->date || ! $this->time) {
            return false;
        }

        $kickoff = Carbon::parse(
            $this->date->format('Y-m-d').' '.$this->time
        );

        return now()->greaterThanOrEqualTo($kickoff);
    }
}
