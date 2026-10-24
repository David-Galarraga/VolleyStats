<?php

namespace App\Http\Controllers;

use App\Models\Game;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MyGameSheetController extends Controller
{
    public function index(Request $request): Response
    {
        $games = $request->user()
            ->assignedGames()
            ->with([
                'tournament:id,name_tournament',
                'fixture:id,name_fixture',
                'category:id_category,name_category,genero_category',
                'teamLocal:id,name_team',
                'teamVisitor:id,name_team',
                'matchResult',
                'sheet',
            ])
            ->orderBy('date')
            ->orderBy('time')
            ->get()
            ->map(fn (Game $game) => [
                'id' => $game->id,
                'date' => $game->date?->format('Y-m-d'),
                'time' => $game->time,
                'day' => $game->day,
                'status_game' => $game->status_game,
                'phase' => $game->phase,
                'phase_label' => Game::PHASES[$game->phase] ?? $game->phase,
                'tournament' => $game->tournament?->only(['id', 'name_tournament']),
                'fixture' => $game->fixture?->only(['id', 'name_fixture']),
                'category' => $game->category?->only(['id_category', 'name_category', 'genero_category']),
                'team_local' => $game->teamLocal?->only(['id', 'name_team']),
                'team_visitor' => $game->teamVisitor?->only(['id', 'name_team']),
                'sheet' => $game->sheet ? $game->sheet->only(['id', 'status_sheet', 'closed_at']) : null,
                'match_result' => $game->matchResult?->only(['sets_local', 'sets_visitor']),
            ]);

        return Inertia::render('Games/Mine', [
            'games' => $games,
        ]);
    }
}
