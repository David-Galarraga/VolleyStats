<?php

namespace App\Http\Controllers;

use App\Models\Player;
use App\Models\Team;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlayerController extends Controller
{
    public function index()
    {
        $players = Player::with('team')->get();

        return Inertia::render('Players/Index', [
            'players' => $players,
        ]);
    }

    public function byTeam(Team $team)
    {
        return Inertia::render('Players/Index', [
            'players' => $team->players()->orderBy('name_player')->get(),
            'team' => $team->only(['id', 'name_team']),
        ]);
    }

    public function createForTeam(Team $team)
    {
        return Inertia::render('Players/Create', [
            'team' => $team->only(['id', 'name_team']),
        ]);
    }

    public function storeForTeam(Request $request, Team $team)
    {
        $data = $request->validate([
            'name_player' => 'required|string|max:255',
            'dni_player' => 'required|string|regex:/^[0-9]{8}$/|unique:players,dni_player',
            'birthdate_player' => 'required|date|before_or_equal:today',
        ]);

        $team->players()->create($data);

        return redirect()->route('teams.players.index', $team);
    }

    public function editForTeam(Team $team, Player $player)
    {
        abort_unless((int) $player->id_team === (int) $team->id, 404);

        return Inertia::render('Players/Edit', [
            'player' => $player,
            'team' => $team->only(['id', 'name_team']),
        ]);
    }

    public function updateForTeam(Request $request, Team $team, Player $player)
    {
        abort_unless((int) $player->id_team === (int) $team->id, 404);

        $data = $request->validate([
            'name_player' => 'required|string|max:255',
            'dni_player' => 'required|string|regex:/^[0-9]{8}$/|unique:players,dni_player,'.$player->id,
            'birthdate_player' => 'required|date|before_or_equal:today',
        ]);

        $player->update($data);

        return redirect()->route('teams.players.index', $team);
    }

    public function destroyForTeam(Team $team, Player $player)
    {
        abort_unless((int) $player->id_team === (int) $team->id, 404);

        $player->delete();

        return redirect()->route('teams.players.index', $team);
    }

    public function create()
    {
        return Inertia::render('Players/Create', [
            'teams' => Team::all(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_team' => 'required|exists:teams,id',
            'name_player' => 'required|string|max:255',
            'dni_player' => 'required|string|regex:/^[0-9]{8}$/|unique:players,dni_player',
            'birthdate_player' => 'required|date|before_or_equal:today',
        ]);

        Player::create([
            'id_team' => $request->input('id_team'),
            'name_player' => $request->input('name_player'),
            'dni_player' => $request->input('dni_player'),
            'birthdate_player' => $request->input('birthdate_player'),
        ]);

        return redirect()->route('players.index');
    }

    public function show(Player $player)
    {
        //
    }

    public function edit(Player $player)
    {
        return Inertia::render('Players/Edit', [
            'player' => $player,
            'teams' => Team::all(),
        ]);
    }

    public function update(Request $request, Player $player)
    {
        $request->validate([
            'id_team' => 'required|exists:teams,id',
            'name_player' => 'required|string|max:255',
            'dni_player' => 'required|string|regex:/^[0-9]{8}$/|unique:players,dni_player,'.$player->id,
            'birthdate_player' => 'required|date|before_or_equal:today',
        ]);

        $player->update([
            'id_team' => $request->input('id_team'),
            'name_player' => $request->input('name_player'),
            'dni_player' => $request->input('dni_player'),
            'birthdate_player' => $request->input('birthdate_player'),
        ]);

        return redirect()->route('players.index');
    }

    public function destroy(Player $player)
    {
        $player->delete();

        return redirect()->route('players.index');
    }
}
