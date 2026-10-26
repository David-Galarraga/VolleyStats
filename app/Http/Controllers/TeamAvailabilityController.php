<?php

namespace App\Http\Controllers;

use App\Models\Fixture;
use App\Models\Team;
use App\Models\TeamAvailability;
use App\Services\AvailabilityService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class TeamAvailabilityController extends Controller
{
    /**
     * Display the availability management screen for a fixture.
     */
    public function index(Fixture $fixture)
    {
        $fixture->load('tournament.categories');

        return Inertia::render('Fixtures/Availabilities', [
            'fixture' => $fixture,
            'categories' => $fixture->tournament?->categories ?? [],
            'teams' => Team::all(),
            'availabilities' => $fixture->availabilities()->with('team.category')->get(),
        ]);
    }

    /**
     * Store a newly created availability window.
     */
    public function store(Request $request, Fixture $fixture)
    {
        $validated = $request->validate([
            ...$this->commonRules($fixture),
            'dates' => ['required', 'array', 'min:1'],
            'dates.*' => [
                'required',
                'date',
                Rule::in($this->fixtureDates($fixture)),
                $this->overlapRule($fixture),
            ],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
        ]);

        $dates = array_values(array_unique($validated['dates']));

        DB::transaction(function () use ($fixture, $validated, $dates) {
            foreach ($dates as $date) {
                TeamAvailability::create([
                    'id_fixture' => $fixture->id,
                    'id_team' => $validated['id_team'],
                    'date' => $date,
                    'start_time' => $validated['start_time'],
                    'end_time' => $validated['end_time'],
                ]);
            }
        });

        return redirect()->route('fixtures.availabilities.index', $fixture);
    }

    /**
     * Update the specified availability window.
     */
    public function update(Request $request, TeamAvailability $availability)
    {
        $fixture = $availability->fixture;

        $validated = $request->validate([
            ...$this->commonRules($fixture),
            'date' => [
                'required',
                'date',
                Rule::in($this->fixtureDates($fixture)),
                $this->overlapRule($fixture, $availability->id),
            ],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
        ]);

        $availability->update([
            'id_team' => $validated['id_team'],
            'date' => $validated['date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
        ]);

        return redirect()->route('fixtures.availabilities.index', $fixture);
    }

    /**
     * Remove the specified availability window.
     */
    public function destroy(TeamAvailability $availability)
    {
        $fixture = $availability->fixture;

        $availability->delete();

        return redirect()->route('fixtures.availabilities.index', $fixture);
    }

    /**
     * Validation rules shared by store and update.
     */
    private function commonRules(Fixture $fixture): array
    {
        return [
            'id_category' => [
                'required',
                'exists:categories,id_category',
                function ($attribute, $value, $fail) use ($fixture) {
                    if (! $fixture->tournament->categories()->whereKey($value)->exists()) {
                        $fail('La categoría no pertenece al torneo del fixture.');
                    }
                },
            ],
            'id_team' => [
                'required',
                'exists:teams,id',
                function ($attribute, $value, $fail) {
                    if (! request()->filled('id_category')) {
                        return;
                    }

                    $team = Team::find($value);

                    if ($team && (int) $team->id_category !== (int) request('id_category')) {
                        $fail('El equipo no pertenece a la categoría seleccionada.');
                    }
                },
            ],
        ];
    }

    /**
     * Dates allowed by the fixture.
     */
    private function fixtureDates(Fixture $fixture): array
    {
        return [
            $fixture->start_date->format('Y-m-d'),
            $fixture->end_date->format('Y-m-d'),
        ];
    }

    /**
     * Reject a window when it overlaps another window of the same team and date.
     */
    private function overlapRule(Fixture $fixture, ?int $ignoreId = null): \Closure
    {
        return function ($attribute, $value, $fail) use ($fixture, $ignoreId) {
            $teamId = request()->input('id_team');
            $start = request()->input('start_time');
            $end = request()->input('end_time');

            if (! $value || ! $teamId || ! $start || ! $end) {
                return;
            }

            // Saltar si los formatos base ya son inválidos; las reglas
            // date_format se encargan de esos casos.
            if (! preg_match('/^\d{2}:\d{2}$/', (string) $start)
                || ! preg_match('/^\d{2}:\d{2}$/', (string) $end)) {
                return;
            }

            $query = TeamAvailability::where('id_fixture', $fixture->id)
                ->where('id_team', $teamId)
                ->where('date', $value);

            if ($ignoreId) {
                $query->where('id', '!=', $ignoreId);
            }

            $overlaps = $query->get()->contains(
                fn (TeamAvailability $existing) => AvailabilityService::overlaps(
                    $existing->start_time,
                    $existing->end_time,
                    (string) $start,
                    (string) $end
                )
            );

            if ($overlaps) {
                $fail('El equipo ya tiene una franja que se solapa en esa fecha.');
            }
        };
    }
}
