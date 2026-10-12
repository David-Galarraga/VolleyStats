<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\Category;
use App\Models\Delegate;
use App\Models\Trainer;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeamController extends Controller
{
    public function index()
    {
        $teams = Team::with('category')->get();

        return Inertia::render('Teams/Index', [
            'teams' => $teams,
        ]);
    }

    public function create()
    {
        return Inertia::render('Teams/Create', [
            'categories' => Category::all(),
            'delegates' => Delegate::all(),
            'trainers' => Trainer::orderBy('name_trainer')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name_team' => 'required|string|max:50',
            'city_team' => 'required|string|max:50',
            'id_category' => 'required|exists:categories,id_category',
            'id_delegate' => 'required|exists:delegates,id_delegate',
            'id_trainer' => 'nullable|exists:trainers,id_trainer',
            'players' => 'required|array|min:6',
            'players.*.name_player' => 'required|string|max:255',
            'players.*.dni_player' => ['required', 'string', 'regex:/^(?:[0-9]{8}|[0-9]{2}\.[0-9]{3}\.[0-9]{3} -[0-9]{6})$/', 'distinct', 'unique:players,dni_player'],
            'players.*.birthdate_player' => 'required|date|before_or_equal:today',
        ]);

        DB::transaction(function () use ($data) {
            $team = Team::create([
                'name_team' => $data['name_team'],
                'city_team' => $data['city_team'],
                'id_category' => $data['id_category'],
                'id_delegate' => $data['id_delegate'],
                'id_trainer' => $data['id_trainer'] ?? null,
            ]);

            $team->players()->createMany($data['players']);
        });

        return redirect()->route('teams.index');
    }

    public function show(Team $team)
    {
        return Inertia::render('Teams/Show', [
            'team' => $team->load(['category', 'delegate', 'trainer']),
        ]);
    }

    public function edit(Team $team)
    {
        return Inertia::render('Teams/Edit', [
            'team' => $team,
            'categories' => Category::all(),
            'delegates' => Delegate::all(),
            'trainers' => Trainer::orderBy('name_trainer')->get(),
        ]);
    }

    public function update(Request $request, Team $team)
    {
        $request->validate([
            'name_team' => 'required|string|max:50',
            'city_team' => 'required|string|max:50',
            'id_category' => 'required|exists:categories,id_category',
            'id_delegate' => 'required|exists:delegates,id_delegate',
            'id_trainer' => 'nullable|exists:trainers,id_trainer',
        ]);

        $team->update([
            'name_team' => $request->input('name_team'),
            'city_team' => $request->input('city_team'),
            'id_category' => $request->input('id_category'),
            'id_delegate' => $request->input('id_delegate'),
            'id_trainer' => $request->input('id_trainer') ?: null,
        ]);

        return redirect()->route('teams.index');
    }

    public function destroy(Team $team)
    {
        $team->delete();

        return redirect()->route('teams.index');
    }
}
