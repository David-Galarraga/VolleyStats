<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\Team;
use App\Models\Referee;
use App\Models\Tournament;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GameController extends Controller
{
    public function index()
    {
        $games = Game::with(['tournament', 'teamLocal', 'teamVisitor', 'referee'])->get();

        return Inertia::render('Games/Index', [
            'games' => $games,
        ]);
    }

    public function create()
    {
        return Inertia::render('Games/Create', [
            'tournaments' => Tournament::all(),
            'teams' => Team::all(),
            'referees' => Referee::all(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_tournament' => 'required|exists:tournaments,id',
            'id_team_local' => 'required|exists:teams,id',
            'id_team_visitor' => 'required|exists:teams,id|different:id_team_local',
            'id_referee' => 'required|exists:referees,id',
            'date' => 'required|date',
            'time' => 'required',
            'status_game' => 'nullable|string|max:255',
            'set_local' => 'nullable|integer',
            'set_visitor' => 'nullable|integer',
            'result' => 'nullable|string|max:255',
        ]);

        Game::create([
            'id_tournament' => $request->input('id_tournament'),
            'id_team_local' => $request->input('id_team_local'),
            'id_team_visitor' => $request->input('id_team_visitor'),
            'id_referee' => $request->input('id_referee'),
            'date' => $request->input('date'),
            'time' => $request->input('time'),
            'status_game' => $request->input('status_game', 'pending'),
            'set_local' => $request->input('set_local'),
            'set_visitor' => $request->input('set_visitor'),
            'result' => $request->input('result', 'pending'),
        ]);

        return redirect()->route('games.index');
    }

    public function show(Game $game)
    {
        return Inertia::render('Games/Show', [
            'game' => $game->load(['tournament', 'teamLocal', 'teamVisitor', 'referee']),
        ]);
    }

    public function edit(Game $game)
    {
        return Inertia::render('Games/Edit', [
            'game' => $game,
            'tournaments' => Tournament::all(),
            'teams' => Team::all(),
            'referees' => Referee::all(),
        ]);
    }

    public function update(Request $request, Game $game)
    {
        $request->validate([
            'id_tournament' => 'required|exists:tournaments,id',
            'id_team_local' => 'required|exists:teams,id',
            'id_team_visitor' => 'required|exists:teams,id|different:id_team_local',
            'id_referee' => 'required|exists:referees,id',
            'date' => 'required|date',
            'time' => 'required',
            'status_game' => 'nullable|string|max:255',
            'set_local' => 'nullable|integer',
            'set_visitor' => 'nullable|integer',
            'result' => 'nullable|string|max:255',
        ]);

        $game->update([
            'id_tournament' => $request->input('id_tournament'),
            'id_team_local' => $request->input('id_team_local'),
            'id_team_visitor' => $request->input('id_team_visitor'),
            'id_referee' => $request->input('id_referee'),
            'date' => $request->input('date'),
            'time' => $request->input('time'),
            'status_game' => $request->input('status_game', 'pending'),
            'set_local' => $request->input('set_local'),
            'set_visitor' => $request->input('set_visitor'),
            'result' => $request->input('result', 'pending'),
        ]);

        return redirect()->route('games.index');
    }

    public function destroy(Game $game)
    {
        $game->delete();

        return redirect()->route('games.index');
    }
}
