<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\Tournament;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TournamentTeamController extends Controller
{
    public function index(Tournament $tournament)
    {
        $tournament->load(['categories' => fn ($q) => $q->orderBy('name_category')]);

        $enrolled = $tournament->teams()
            ->with(['category', 'delegate'])
            ->orderBy('name_team')
            ->get();

        $availableTeams = Team::with('category')
            ->whereHas('category', fn ($q) => $q->whereIn('id_category', $tournament->categories->pluck('id_category')))
            ->whereNotIn('id', $tournament->teams()->pluck('teams.id'))
            ->orderBy('name_team')
            ->get();

        return Inertia::render('Tournaments/Teams', [
            'tournament' => $tournament->only(['id', 'name_tournament']),
            'categories' => $tournament->categories,
            'enrolled' => $enrolled,
            'availableTeams' => $availableTeams,
        ]);
    }

    public function store(Request $request, Tournament $tournament)
    {
        $data = $request->validate([
            'id_team' => 'required|integer|exists:teams,id',
        ]);

        $team = Team::findOrFail($data['id_team']);

        abort_unless(
            $tournament->categories()->where('categories.id_category', $team->id_category)->exists(),
            422,
            'El equipo no pertenece a una categoría vinculada a este torneo.'
        );

        if ($tournament->teams()->where('teams.id', $team->id)->exists()) {
            return back()->withErrors(['id_team' => 'El equipo ya está inscrito en este torneo.']);
        }

        $pivot = $tournament->categories()->where('categories.id_category', $team->id_category)->first()?->pivot;
        if ($pivot && $pivot->number_teams !== null) {
            $enrolledCount = $tournament->teams()->wherePivot('id_category', $team->id_category)->count();
            if ($enrolledCount >= $pivot->number_teams) {
                return back()->withErrors(['id_team' => 'Se alcanzó el cupo de equipos para esta categoría.']);
            }
        }

        $tournament->teams()->attach($team->id, [
            'id_category' => $team->id_category,
            'status' => 'enrolled',
        ]);

        return redirect()->route('tournaments.teams.index', $tournament);
    }

    public function destroy(Tournament $tournament, Team $team)
    {
        abort_unless($tournament->teams()->where('teams.id', $team->id)->exists(), 404);

        $tournament->teams()->detach($team->id);

        return redirect()->route('tournaments.teams.index', $tournament);
    }
}
