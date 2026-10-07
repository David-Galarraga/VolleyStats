<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GameSheet extends Model
{
    protected $fillable = [
        'game_id',
        'status_sheet',
        'venue',
        'observations',
        'opened_by',
        'closed_by',
        'closed_at',
    ];

    protected $casts = [
        'game_id' => 'integer',
        'opened_by' => 'integer',
        'closed_by' => 'integer',
        'closed_at' => 'datetime',
    ];

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class, 'game_id', 'id');
    }

    public function players(): HasMany
    {
        return $this->hasMany(GameSheetPlayer::class, 'game_sheet_id', 'id');
    }

    public function openedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'opened_by', 'id_user');
    }

    public function closedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'closed_by', 'id_user');
    }

    public function isClosed(): bool
    {
        return $this->status_sheet !== 'draft';
    }
}
