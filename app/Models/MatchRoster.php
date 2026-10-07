<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MatchRoster extends Model
{
    protected $fillable = [
        'game_id',
        'team_id',
        'submitted_by',
        'submitted_at',
    ];

    protected $casts = [
        'game_id' => 'integer',
        'team_id' => 'integer',
        'submitted_by' => 'integer',
        'submitted_at' => 'datetime',
    ];

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class, 'game_id', 'id');
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'team_id', 'id');
    }

    public function players(): HasMany
    {
        return $this->hasMany(MatchRosterPlayer::class, 'match_roster_id', 'id');
    }

    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by', 'id_user');
    }

    public function isSubmitted(): bool
    {
        return $this->submitted_at !== null;
    }
}
