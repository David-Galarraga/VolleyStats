<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\Category;
use App\Models\Trainer;
use App\Models\Delegate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeamController extends Controller
{
    public function index()
    {
        $teams = Team::with(['category', 'trainer', 'delegate'])->get();

        return Inertia::render('Teams/Index', [
            'teams' => $teams,
        ]);
    }

    public function create()
    {
        return Inertia::render('Teams/Create', [
            'categories' => Category::all(),
            'trainers' => Trainer::all(),
            'delegates' => Delegate::all(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name_team' => 'required|string|max:50',
            'city_team' => 'required|string|max:50',
            'id_category' => 'required|exists:categories,id_category',
            'id_trainer' => 'required|exists:trainers,id_trainer',
            'id_delegate' => 'required|exists:delegates,id_delegate',
        ]);

        Team::create([
            'name_team' => $request->input('name_team'),
            'city_team' => $request->input('city_team'),
            'id_category' => $request->input('id_category'),
            'id_trainer' => $request->input('id_trainer'),
            'id_delegate' => $request->input('id_delegate'),
        ]);

        return redirect()->route('teams.index');
    }

    public function show(Team $team)
    {
        return Inertia::render('Teams/Show', [
            'team' => $team->load(['category', 'trainer', 'delegate']),
        ]);
    }

    public function edit(Team $team)
    {
        return Inertia::render('Teams/Edit', [
            'team' => $team,
            'categories' => Category::all(),
            'trainers' => Trainer::all(),
            'delegates' => Delegate::all(),
        ]);
    }

    public function update(Request $request, Team $team)
    {
        $request->validate([
            'name_team' => 'required|string|max:50',
            'city_team' => 'required|string|max:50',
            'id_category' => 'required|exists:categories,id_category',
            'id_trainer' => 'required|exists:trainers,id_trainer',
            'id_delegate' => 'required|exists:delegates,id_delegate',
        ]);

        $team->update([
            'name_team' => $request->input('name_team'),
            'city_team' => $request->input('city_team'),
            'id_category' => $request->input('id_category'),
            'id_trainer' => $request->input('id_trainer'),
            'id_delegate' => $request->input('id_delegate'),
        ]);

        return redirect()->route('teams.index');
    }

    public function destroy(Team $team)
    {
        $team->delete();

        return redirect()->route('teams.index');
    }
}

