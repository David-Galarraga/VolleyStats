<?php

namespace App\Http\Controllers;

use App\Models\Fixture;
use App\Models\Game;
use App\Models\Team;
use App\Models\Tournament;
use App\Services\AvailabilityService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class GameController extends Controller
{
    public function create(Request $request)
    {
        $fixture = $request->filled('fixture')
            ? Fixture::with('tournament')->find($request->integer('fixture'))
            : null;

        if (! $fixture) {
            return redirect()->route('fixtures.index');
        }

        return Inertia::render('Games/Create', [
            'tournaments' => Tournament::with('categories')->get(),
            'teams' => Team::all(),
            'fixture' => $fixture,
            'availabilities' => $fixture->availabilities()->get(),
            'phases' => Game::PHASES,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate($this->gameRules($request));

        $game = Game::create([
            'id_tournament' => $request->input('id_tournament'),
            'id_category' => $request->input('id_category'),
            'id_fixture' => $request->input('id_fixture'),
            'id_team_local' => $request->input('id_team_local'),
            'id_team_visitor' => $request->input('id_team_visitor'),
            'phase' => $request->input('phase'),
            'phase_instance' => $request->input('phase') === 'playoff' ? trim((string) $request->input('phase_instance')) : null,
            'set_format' => $request->input('phase') === 'playoff' ? $request->input('set_format') : 'best_of_3',
            'date' => $request->input('date'),
            'time' => $request->input('time'),
            'status_game' => $request->input('status_game', 'pending'),
            'set_local' => $request->input('set_local'),
            'set_visitor' => $request->input('set_visitor'),
            'result' => $request->input('result', 'pending'),
        ]);

        return redirect()->route('fixtures.show', $game->id_fixture);
    }

    public function show(Game $game)
    {
        $game->load(['tournament', 'fixture', 'category', 'teamLocal', 'teamVisitor', 'matchResult', 'sheet.players']);
        $game->makeHidden(['id_referee', 'day']);

        return Inertia::render('Games/Show', [
            'game' => $game,
            'phaseLabel' => Game::PHASES[$game->phase] ?? $game->phase,
            'dayOfWeek' => $game->date?->locale('es')->translatedFormat('l'),
        ]);
    }

    public function edit(Game $game)
    {
        $fixture = $game->fixture?->load('tournament');

        if (! $fixture) {
            return redirect()->route('fixtures.index');
        }

        return Inertia::render('Games/Edit', [
            'game' => $game,
            'tournaments' => Tournament::with('categories')->get(),
            'teams' => Team::all(),
            'fixture' => $fixture,
            'availabilities' => $fixture->availabilities()->get(),
            'phases' => Game::PHASES,
        ]);
    }

    public function update(Request $request, Game $game)
    {
        $request->validate($this->gameRules($request, $game));

        $game->update([
            'id_tournament' => $request->input('id_tournament'),
            'id_category' => $request->input('id_category'),
            'id_fixture' => $request->input('id_fixture'),
            'id_team_local' => $request->input('id_team_local'),
            'id_team_visitor' => $request->input('id_team_visitor'),
            'phase' => $request->input('phase'),
            'phase_instance' => $request->input('phase') === 'playoff' ? trim((string) $request->input('phase_instance')) : null,
            'set_format' => $request->input('phase') === 'playoff' ? $request->input('set_format') : 'best_of_3',
            'date' => $request->input('date'),
            'time' => $request->input('time'),
            'status_game' => $request->input('status_game', 'pending'),
            'set_local' => $request->input('set_local'),
            'set_visitor' => $request->input('set_visitor'),
            'result' => $request->input('result', 'pending'),
        ]);

        return redirect()->route('fixtures.show', $game->id_fixture);
    }

    public function destroy(Game $game)
    {
        $fixtureId = $game->id_fixture;
        $game->delete();

        return $fixtureId
            ? redirect()->route('fixtures.show', $fixtureId)
            : redirect()->route('fixtures.index');
    }

    private function gameRules(Request $request, ?Game $game = null): array
    {
        $rules = [
            'id_tournament' => ['required', 'exists:tournaments,id'],
            'id_category' => ['required', 'exists:categories,id_category'],
            'id_fixture' => ['required', 'exists:fixtures,id'],
            'id_team_local' => ['required', 'exists:teams,id'],
            'id_team_visitor' => ['required', 'exists:teams,id', 'different:id_team_local'],
            'date' => ['required', 'date', 'after_or_equal:today'],
            'time' => ['required'],
            'status_game' => ['nullable', 'string', Rule::in(['pending', 'finished'])],
            'set_local' => ['nullable', 'integer'],
            'set_visitor' => ['nullable', 'integer'],
            'result' => ['nullable', 'string', 'max:255'],
            'phase' => ['required', 'string', Rule::in(array_keys(Game::PHASES))],
            'phase_instance' => [Rule::requiredIf($request->input('phase') === 'playoff'), 'nullable', 'string', 'max:255'],
            'set_format' => [Rule::requiredIf($request->input('phase') === 'playoff'), 'nullable', 'string', Rule::in(array_keys(Game::SET_FORMATS))],
        ];

        if ($request->input('phase') === 'regular') {
            $rules['phase_instance'][] = 'prohibited_unless:phase,playoff';
            $rules['set_format'][] = Rule::in(['best_of_3']);
        }

        $result = $game?->matchResult;
        if ($result) {
            $rules['phase'][] = function ($attribute, $value, $fail) use ($request, $result) {
                $format = $value === 'regular' ? 'best_of_3' : $request->input('set_format');
                if ($format && ! $result->isValidForFormat($format)) {
                    $fail('El resultado cargado no es válido para la fase o el formato seleccionado. Corregí o eliminá el resultado antes de guardar.');
                }
            };
        }

        $fixture = $request->filled('id_fixture')
            ? Fixture::find($request->input('id_fixture'))
            : null;

        if ($fixture) {
            $rules['id_tournament'][] = function ($attribute, $value, $fail) use ($fixture) {
                if ((int) $value !== (int) $fixture->id_tournament) {
                    $fail('El torneo debe coincidir con el del fixture.');
                }
            };

            $rules['id_category'][] = function ($attribute, $value, $fail) use ($fixture) {
                if (! $fixture->tournament->categories()->whereKey($value)->exists()) {
                    $fail('La categoría no pertenece al torneo del fixture.');
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

            $teamMatchesCategory = function (string $side) {
                return function ($attribute, $value, $fail) use ($side) {
                    if (! request()->filled('id_category')) {
                        return;
                    }

                    $team = Team::find($value);

                    if ($team && (int) $team->id_category !== (int) request('id_category')) {
                        $fail("El equipo {$side} no pertenece a la categoría seleccionada.");
                    }
                };
            };

            $rules['id_team_local'][] = $teamMatchesCategory('local');
            $rules['id_team_visitor'][] = $teamMatchesCategory('visitante');

            if ($fixture->availabilities()->exists()) {
                $rules['id_team_local'][] = function ($attribute, $value, $fail) use ($fixture) {
                    if (! AvailabilityService::teamHasWindow($fixture, (int) $value, request('date'), request('time'))) {
                        $fail('El equipo local no tiene disponibilidad en esa fecha y hora.');
                    }
                };

                $rules['id_team_visitor'][] = function ($attribute, $value, $fail) use ($fixture) {
                    if (! AvailabilityService::teamHasWindow($fixture, (int) $value, request('date'), request('time'))) {
                        $fail('El equipo visitante no tiene disponibilidad en esa fecha y hora.');
                    }
                };
            }
        }

        return $rules;
    }
}
