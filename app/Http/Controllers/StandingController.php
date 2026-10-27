<?php

namespace App\Http\Controllers;

use App\Services\StandingsService;
use App\Models\PlayoffBracket;
use App\Models\Team;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StandingController extends Controller
{
    public function index(Request $request, StandingsService $standingsService)
    {
        $data = $standingsService->forRequestedCombination($request->query('combination'));
        $selected = $data['selectedCombination'];
        $bracket = $selected ? PlayoffBracket::query()
            ->where('tournament_id', $selected['tournament_id'])
            ->where('category_id', $selected['category_id'])
            ->with(['matches.game.matchResult', 'matches.game.teamLocal', 'matches.game.teamVisitor', 'matches.teamA', 'matches.teamB', 'matches.sourceA.game.matchResult', 'matches.sourceA.game.teamLocal', 'matches.sourceA.game.teamVisitor', 'matches.sourceB.game.matchResult', 'matches.sourceB.game.teamLocal', 'matches.sourceB.game.teamVisitor'])
            ->first() : null;

        $data['playoffBracket'] = $bracket ? [
            'id' => $bracket->id,
            'matches' => $bracket->matches->map(fn ($match) => [
                'id' => $match->id, 'code' => $match->code, 'stage' => $match->stage, 'cup' => $match->cup,
                'team_a' => $match->resolvedTeam('a')?->name_team,
                'team_b' => $match->resolvedTeam('b')?->name_team,
                'result' => $match->game?->forfeit_type === 'wo' ? 'WO' : ($match->game?->matchResult ? $match->game->matchResult->sets_local.'–'.$match->game->matchResult->sets_visitor : null),
                'score_a' => $match->game?->matchResult?->sets_local,
                'score_b' => $match->game?->matchResult?->sets_visitor,
                'winner_side' => $this->winnerSide($match),
                'source_a_type' => $match->source_a_type,
                'source_a_match_id' => $match->source_a_match_id,
                'source_a_code' => $match->sourceA?->code,
                'source_b_type' => $match->source_b_type,
                'source_b_match_id' => $match->source_b_match_id,
                'source_b_code' => $match->sourceB?->code,
            ])->values(),
        ] : null;
        $data['bracketTeams'] = $selected ? Team::query()->where('id_category', $selected['category_id'])->orderBy('name_team')->get(['id', 'name_team']) : [];
        $data['playoffStages'] = \App\Models\PlayoffMatch::STAGES;
        $data['canManagePlayoff'] = $request->user()->hasRole('Administrador');

        return Inertia::render(
            'Standings/Index',
            $data
        );
    }

    private function winnerSide($match): ?string
    {
        if (! $match->game) return null;
        if ($match->game->suspended) return null;
        if ($match->game->forfeit_team_id) {
            return (int) $match->game->forfeit_team_id === (int) $match->game->id_team_local ? 'b' : 'a';
        }
        $result = $match->game->matchResult;
        if (! $result || (int) $result->sets_local === (int) $result->sets_visitor) return null;
        return (int) $result->sets_local > (int) $result->sets_visitor ? 'a' : 'b';
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
