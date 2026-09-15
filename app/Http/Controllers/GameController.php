<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\Team;
use App\Models\Referee;
use App\Models\Fixture;
use App\Models\Tournament;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GameController extends Controller
{
    public function index()
    {
        $games = Game::with(['tournament', 'fixture', 'teamLocal', 'teamVisitor', 'referee'])->get();

        return Inertia::render('Games/Index', [
            'games' => $games,
        ]);
    }

    public function create(Request $request)
    {
        $fixture = null;
        if ($request->filled('fixture')) {
            $fixture = Fixture::with('tournament')->find($request->integer('fixture'));
        }

        return Inertia::render('Games/Create', [
            'tournaments' => Tournament::all(),
            'teams' => Team::all(),
            'referees' => Referee::all(),
            'fixture' => $fixture,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate($this->gameRules($request));

        $game = Game::create([
            'id_tournament' => $request->input('id_tournament'),
            'id_fixture' => $request->input('id_fixture'),
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

        return $game->id_fixture
            ? redirect()->route('fixtures.show', $game->id_fixture)
            : redirect()->route('games.index');
    }

    public function show(Game $game)
    {
        return Inertia::render('Games/Show', [
            'game' => $game->load(['tournament', 'fixture', 'teamLocal', 'teamVisitor', 'referee']),
        ]);
    }

    public function edit(Game $game)
    {
        return Inertia::render('Games/Edit', [
            'game' => $game,
            'tournaments' => Tournament::all(),
            'teams' => Team::all(),
            'referees' => Referee::all(),
            'fixture' => $game->fixture?->load('tournament'),
        ]);
    }

    public function update(Request $request, Game $game)
    {
        $request->validate($this->gameRules($request));

        $game->update([
            'id_tournament' => $request->input('id_tournament'),
            'id_fixture' => $request->input('id_fixture'),
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

    /**
     * Validation rules, enforcing consistency with the fixture when present.
     */
    private function gameRules(Request $request): array
    {
        $rules = [
            'id_tournament' => ['required', 'exists:tournaments,id'],
            'id_fixture' => ['nullable', 'exists:fixtures,id'],
            'id_team_local' => ['required', 'exists:teams,id'],
            'id_team_visitor' => ['required', 'exists:teams,id', 'different:id_team_local'],
            'id_referee' => ['required', 'exists:referees,id'],
            'date' => ['required', 'date', 'after_or_equal:today'],
            'time' => ['required'],
            'status_game' => ['nullable', 'string', 'max:255'],
            'set_local' => ['nullable', 'integer'],
            'set_visitor' => ['nullable', 'integer'],
            'result' => ['nullable', 'string', 'max:255'],
        ];

        $fixture = $request->filled('id_fixture')
            ? Fixture::find($request->input('id_fixture'))
            : null;

        if ($fixture) {
            $rules['id_tournament'][] = function ($attribute, $value, $fail) use ($fixture) {
                if ((int) $value !== (int) $fixture->id_tournament) {
                    $fail('El torneo debe coincidir con el del fixture.');
                }
            };

            $rules['date'][] = function ($attribute, $value, $fail) use ($fixture) {
                $allowed = [
                    $fixture->start_date->format('Y-m-d'),
                    $fixture->end_date->format('Y-m-d'),
                ];

                if (! in_array($value, $allowed, true)) {
                    $fail('La fecha debe ser el sábado o el domingo del fixture.');
                }
            };
        }

        return $rules;
    }
}
