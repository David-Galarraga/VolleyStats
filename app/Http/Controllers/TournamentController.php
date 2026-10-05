<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Tournament;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TournamentController extends Controller
{

    public function index()
    {
        $tournaments = Tournament::with('categories')->get();

        return Inertia::render('Tournaments/Index', [
            'tournaments' => $tournaments,
        ]);
    }

    public function create()
    {
        return Inertia::render('Tournaments/Create', [
            'categories' => Category::all(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name_tournament' => 'required|string|max:100',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status_tournament' => 'nullable|string|max:50',

            'categories' => 'required|array|min:1',
            'categories.*.id_category' => 'required|exists:categories,id_category',
            'categories.*.number_matches' => 'nullable|integer|min:0',
            'categories.*.number_teams' => 'nullable|integer|min:0',
        ]);

        $tournament = Tournament::create([
            'name_tournament' => $request->input('name_tournament'),
            'start_date' => $request->input('start_date'),
            'end_date' => $request->input('end_date'),
            'status_tournament' => $request->input('status_tournament'),
        ]);

        foreach ($request->input('categories') as $category) {
            $tournament->categories()->attach($category['id_category'], [
                'number_matches' => $category['number_matches'] ?? null ,
                'number_teams' => $category['number_teams'] ?? null,
            ]);
        }

        return redirect()->route('tournaments.index');
    }

    public function edit(Tournament $tournament)
    {
        return Inertia::render('Tournaments/Edit', [
            'tournament' => $tournament->load('categories'),
            'categories' => Category::all(),
        ]);
    }

    public function update(Request $request, Tournament $tournament)
    {
        $request->validate([
            'name_tournament' => 'required|string|max:100',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status_tournament' => 'nullable|string|max:50',

            'categories' => 'required|array|min:1',
            'categories.*.id_category' => 'required|exists:categories,id_category',
            'categories.*.number_matches' => 'nullable|integer|min:0',
            'categories.*.number_teams' => 'nullable|integer|min:0',
        ]);

        $tournament->update([
            'name_tournament' => $request->input('name_tournament'),
            'start_date' => $request->input('start_date'),
            'end_date' => $request->input('end_date'),
            'status_tournament' => $request->input('status_tournament'),
        ]);

        $tournament->categories()->sync(
            collect($request->input('categories'))->mapWithKeys(function ($category) {
                return [
                    $category['id_category'] => [
                        'number_matches' => $category['number_matches'] ?? null,
                        'number_teams' => $category['number_teams'] ?? null,
                    ],
                ];
            })->all()
            );

        return redirect()->route('tournaments.index');
    }

    public function destroy(Tournament $tournament)
    {

        $tournament->categories()->detach();
        $tournament->delete();

        return redirect()->route('tournaments.index');
    }
}
