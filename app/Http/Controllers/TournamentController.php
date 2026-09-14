<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Tournament;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TournamentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tournaments = Tournament::with('category')->get();

        return Inertia::render('Tournaments/Index', [
            'tournaments' => $tournaments,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Tournaments/Create', [
            'categories' => Category::all(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_category' => 'required|exists:categories,id_category',
            'name_tournament' => 'required|string|max:100',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'number_matches' => 'nullable|integer|min:0',
            'number_teams' => 'nullable|integer|min:0',
            'status_tournament' => 'nullable|string|max:50',
        ]);

        Tournament::create([
            'id_category' => $request->input('id_category'),
            'name_tournament' => $request->input('name_tournament'),
            'start_date' => $request->input('start_date'),
            'end_date' => $request->input('end_date'),
            'number_matches' => $request->input('number_matches'),
            'number_teams' => $request->input('number_teams'),
            'status_tournament' => $request->input('status_tournament'),
        ]);

        return redirect()->route('tournaments.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Tournament $tournament)
    {
        return Inertia::render('Tournaments/Edit', [
            'tournament' => $tournament,
            'categories' => Category::all(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Tournament $tournament)
    {
        $request->validate([
            'id_category' => 'required|exists:categories,id_category',
            'name_tournament' => 'required|string|max:100',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'number_matches' => 'nullable|integer|min:0',
            'number_teams' => 'nullable|integer|min:0',
            'status_tournament' => 'nullable|string|max:50',
        ]);

        $tournament->update([
            'id_category' => $request->input('id_category'),
            'name_tournament' => $request->input('name_tournament'),
            'start_date' => $request->input('start_date'),
            'end_date' => $request->input('end_date'),
            'number_matches' => $request->input('number_matches'),
            'number_teams' => $request->input('number_teams'),
            'status_tournament' => $request->input('status_tournament'),
        ]);

        return redirect()->route('tournaments.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tournament $tournament)
    {
        $tournament->delete();

        return redirect()->route('tournaments.index');
    }
}
