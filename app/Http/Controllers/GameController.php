<?php

namespace App\Http\Controllers;

use App\Models\Fixture;
use App\Models\Game;
use App\Models\PlayoffBracket;
use App\Models\PlayoffMatch;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\User;
use App\Services\AvailabilityService;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
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
            'phaseInstances' => Game::PHASE_INSTANCES,
            'playoffMatches' => $this->playoffMatches($fixture->id_tournament),
            'planilleros' => $this->planilleros(),
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
            'phase_instance' => $request->input('phase') === 'playoff' ? $request->input('phase_instance') : null,
            'set_format' => $request->input('phase') === 'playoff' ? $request->input('set_format', 'best_of_3') : 'best_of_3',
            'date' => $request->input('date'),
            'time' => $request->input('time'),
            'status_game' => $request->input('status_game', 'pending'),
            'set_local' => $request->input('set_local'),
            'set_visitor' => $request->input('set_visitor'),
            'result' => $request->input('result', 'pending'),
        ]);

        $this->syncPlanilleros($game, $request);
        $this->syncPlayoffMatch($game, $request);

        return redirect()->route('fixtures.show', $game->id_fixture);
    }

    public function show(Game $game)
    {
        $game->load(['tournament', 'fixture', 'category', 'teamLocal', 'teamVisitor', 'matchResult', 'sheet.players', 'planilleros:id_user,name_user,email']);
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
            'phaseInstances' => Game::PHASE_INSTANCES,
            'playoffMatches' => $this->playoffMatches($fixture->id_tournament),
            'playoffMatchId' => PlayoffMatch::where('game_id', $game->id)->value('id'),
            'planilleros' => $this->planilleros(),
            'assignedPlanilleroIds' => $game->planilleros()->pluck('users.id_user')->all(),
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
            'phase_instance' => $request->input('phase') === 'playoff' ? $request->input('phase_instance') : null,
            'set_format' => $request->input('phase') === 'playoff' ? $request->input('set_format', 'best_of_3') : 'best_of_3',
            'date' => $request->input('date'),
            'time' => $request->input('time'),
            'status_game' => $request->input('status_game', 'pending'),
            'set_local' => $request->input('set_local'),
            'set_visitor' => $request->input('set_visitor'),
            'result' => $request->input('result', 'pending'),
        ]);

        $this->syncPlanilleros($game, $request);
        $this->syncPlayoffMatch($game, $request);

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

    private function gameRules(Request $request, ?Game $currentGame = null): array
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
            'phase_instance' => [Rule::requiredIf($request->input('phase') === 'playoff'), 'nullable', Rule::in(array_keys(Game::PHASE_INSTANCES))],
            'set_format' => ['nullable', Rule::in($request->input('phase') === 'regular' ? ['best_of_3'] : ['best_of_3', 'best_of_5'])],
            'playoff_match_id' => ['nullable', 'integer', 'exists:playoff_matches,id'],
            'planillero_ids' => ['nullable', 'array'],
            'planillero_ids.*' => [
                'integer',
                'distinct',
                'exists:users,id_user',
                function ($attribute, $value, $fail) {
                    if (! User::find($value)?->hasRole('Planillero')) {
                        $fail('El usuario seleccionado no tiene el rol Planillero.');
                    }
                },
            ],
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

        if ($request->filled('playoff_match_id')) {
            $rules['playoff_match_id'][] = function ($attribute, $value, $fail) use ($request, $currentGame) {
                $match = PlayoffMatch::with('bracket')->find($value);
                if (! $match || $match->bracket->tournament_id != $request->input('id_tournament') || $match->bracket->category_id != $request->input('id_category')) {
                    $fail('El cruce seleccionado no pertenece al torneo y categoría del partido.');
                } elseif ($request->input('phase') !== 'playoff' || $request->input('phase_instance') !== $match->stage) {
                    $fail('La fase y etapa deben coincidir con el cruce del prode.');
                } elseif ($match->game_id && $match->game_id !== $currentGame?->id) {
                    $fail('El cruce del prode ya está asociado a otro partido.');
                } else {
                    $teamA = $match->resolvedTeam('a');
                    $teamB = $match->resolvedTeam('b');
                    if (($teamA && (int) $teamA->id !== (int) $request->input('id_team_local'))
                        || ($teamB && (int) $teamB->id !== (int) $request->input('id_team_visitor'))) {
                        $fail('Los equipos del partido deben coincidir con los participantes del cruce.');
                    }
                }
            };
        }

        return $rules;
    }

    private function planilleros(): Collection
    {
        return User::role('Planillero')
            ->orderBy('name_user')
            ->get(['id_user', 'name_user', 'email']);
    }

    private function syncPlanilleros(Game $game, Request $request): void
    {
        $ids = collect($request->input('planillero_ids', []))
            ->map(fn ($id) => (int) $id)
            ->all();

        $game->planilleros()->syncWithPivotValues($ids, [
            'assigned_by' => $request->user()?->id_user,
        ]);
    }

    private function syncPlayoffMatch(Game $game, Request $request): void
    {
        PlayoffMatch::where('game_id', $game->id)->update(['game_id' => null]);
        if ($game->phase === 'playoff' && $request->filled('playoff_match_id')) {
            PlayoffMatch::where('id', $request->input('playoff_match_id'))->update(['game_id' => $game->id]);
        }
    }

    private function playoffMatches(int $tournamentId): array
    {
        return PlayoffBracket::where('tournament_id', $tournamentId)->with('matches.teamA', 'matches.teamB')
            ->get()->flatMap(fn ($bracket) => $bracket->matches->map(fn ($match) => [
                'id' => $match->id, 'category_id' => $bracket->category_id, 'code' => $match->code,
                'stage' => $match->stage, 'team_a_id' => $match->resolvedTeam('a')?->id,
                'team_b_id' => $match->resolvedTeam('b')?->id,
            ]))->values()->all();
    }
}
