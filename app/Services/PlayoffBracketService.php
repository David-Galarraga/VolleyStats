<?php

namespace App\Services;

use App\Models\PlayoffBracket;
use App\Models\PlayoffMatch;

class PlayoffBracketService
{
    /**
     * Build the playoff bracket payload for a tournament/category combination.
     *
     * @param  array<string, int|string>|null  $selectedCombination
     * @return array{id: int, matches: array<int, array<string, mixed>>}|null
     */
    public function forCombination(?array $selectedCombination): ?array
    {
        if (! $selectedCombination) {
            return null;
        }

        $bracket = PlayoffBracket::query()
            ->where('tournament_id', $selectedCombination['tournament_id'])
            ->where('category_id', $selectedCombination['category_id'])
            ->with([
                'matches.game.matchResult',
                'matches.game.teamLocal',
                'matches.game.teamVisitor',
                'matches.teamA',
                'matches.teamB',
                'matches.sourceA.game.matchResult',
                'matches.sourceA.game.teamLocal',
                'matches.sourceA.game.teamVisitor',
                'matches.sourceB.game.matchResult',
                'matches.sourceB.game.teamLocal',
                'matches.sourceB.game.teamVisitor',
            ])
            ->first();

        if (! $bracket) {
            return null;
        }

        return [
            'id' => (int) $bracket->id,
            'matches' => $bracket->matches
                ->map(fn (PlayoffMatch $match) => [
                    'id' => $match->id,
                    'code' => $match->code,
                    'stage' => $match->stage,
                    'cup' => $match->cup,
                    'team_a_id' => $match->team_a_id,
                    'team_b_id' => $match->team_b_id,
                    'team_a' => $match->resolvedTeam('a')?->name_team,
                    'team_b' => $match->resolvedTeam('b')?->name_team,
                    'result' => $match->game?->forfeit_type === 'wo'
                        ? 'WO'
                        : ($match->game?->matchResult
                            ? $match->game->matchResult->sets_local.'–'.$match->game->matchResult->sets_visitor
                            : null),
                    'score_a' => $match->game?->matchResult?->sets_local,
                    'score_b' => $match->game?->matchResult?->sets_visitor,
                    'winner_side' => $this->winnerSide($match),
                    'source_a_type' => $match->source_a_type,
                    'source_a_match_id' => $match->source_a_match_id,
                    'source_a_code' => $match->sourceA?->code,
                    'source_b_type' => $match->source_b_type,
                    'source_b_match_id' => $match->source_b_match_id,
                    'source_b_code' => $match->sourceB?->code,
                ])
                ->values()
                ->all(),
        ];
    }

    private function winnerSide(PlayoffMatch $match): ?string
    {
        if (! $match->game) {
            return null;
        }

        if ($match->game->suspended) {
            return null;
        }

        if ($match->game->forfeit_team_id) {
            return (int) $match->game->forfeit_team_id === (int) $match->game->id_team_local ? 'b' : 'a';
        }

        $result = $match->game->matchResult;

        if (! $result || (int) $result->sets_local === (int) $result->sets_visitor) {
            return null;
        }

        return (int) $result->sets_local > (int) $result->sets_visitor ? 'a' : 'b';
    }
}
