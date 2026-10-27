<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlayoffMatch extends Model
{
    public const STAGES = [
        '32avos' => '32avos', '16avos' => '16avos', 'Octavos' => 'Octavos',
        'Cuartos de final' => 'Cuartos', 'Semifinal' => 'Semifinal', 'Final' => 'Final',
    ];

    protected $fillable = [
        'bracket_id', 'tournament_id', 'code', 'stage', 'cup', 'team_a_id', 'team_b_id',
        'source_a_type', 'source_a_match_id', 'source_b_type', 'source_b_match_id', 'game_id',
    ];

    public function bracket(): BelongsTo
    {
        return $this->belongsTo(PlayoffBracket::class, 'bracket_id');
    }

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class, 'game_id');
    }

    public function teamA(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'team_a_id');
    }

    public function teamB(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'team_b_id');
    }

    public function sourceA(): BelongsTo
    {
        return $this->belongsTo(self::class, 'source_a_match_id');
    }

    public function sourceB(): BelongsTo
    {
        return $this->belongsTo(self::class, 'source_b_match_id');
    }

    public function resolvedTeam(string $slot): ?Team
    {
        $direct = $slot === 'a' ? $this->teamA : $this->teamB;
        if ($direct) return $direct;

        $type = $slot === 'a' ? $this->source_a_type : $this->source_b_type;
        $source = $slot === 'a' ? $this->sourceA : $this->sourceB;
        if (! $type || ! $source?->game || $source->game->suspended) return null;

        $game = $source->game;
        $result = $game->matchResult;
        if ($game->forfeit_team_id) {
            $absentTeam = (int) $game->forfeit_team_id === (int) $game->id_team_local ? $game->teamLocal : $game->teamVisitor;
            $opponent = (int) $game->forfeit_team_id === (int) $game->id_team_local ? $game->teamVisitor : $game->teamLocal;
            return $type === 'winner' ? $opponent : $absentTeam;
        }
        if (! $result) return null;
        $localWon = (int) $result->sets_local > (int) $result->sets_visitor;
        $winner = $localWon ? $game->teamLocal : $game->teamVisitor;
        $loser = $localWon ? $game->teamVisitor : $game->teamLocal;

        return $type === 'winner' ? $winner : $loser;
    }
}
