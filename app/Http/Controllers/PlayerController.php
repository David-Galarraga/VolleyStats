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
            'phone_player' => 'nullable|string|max:255',
            'genre_player' => 'required|string',
            'position_player' => 'required|string',
            'birthdate_player' => 'required|date|before_or_equal:today',
            'number_player' => 'required|integer',
        ]);

        Player::create([
            'id_team' => $request->input('id_team'),
            'name_player' => $request->input('name_player'),
            'phone_player' => $request->input('phone_player'),
            'genre_player' => $request->input('genre_player'),
            'position_player' => $request->input('position_player'),
            'birthdate_player' => $request->input('birthdate_player'),
            'number_player' => $request->input('number_player'),
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
            'phone_player' => 'nullable|string|max:255',
            'genre_player' => 'required|string',
            'position_player' => 'required|string',
            'birthdate_player' => 'required|date|before_or_equal:today',
            'number_player' => 'required|integer',
        ]);

        $player->update([
            'id_team' => $request->input('id_team'),
            'name_player' => $request->input('name_player'),
            'phone_player' => $request->input('phone_player'),
            'genre_player' => $request->input('genre_player'),
            'position_player' => $request->input('position_player'),
            'birthdate_player' => $request->input('birthdate_player'),
            'number_player' => $request->input('number_player'),
        ]);

        return redirect()->route('players.index');
    }

    public function destroy(Player $player)
    {
        $player->delete();

        return redirect()->route('players.index');
    }
}
