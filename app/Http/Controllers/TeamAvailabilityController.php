<?php

namespace App\Http\Controllers;

use App\Models\Fixture;
use App\Models\Team;
use App\Models\TeamAvailability;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class TeamAvailabilityController extends Controller
{
    /**
     * Display the availability management screen for a fixture.
     */
    public function index(Fixture $fixture)
    {
        return Inertia::render('Fixtures/Availabilities', [
            'fixture' => $fixture->load('tournament'),
            'teams' => Team::all(),
            'availabilities' => $fixture->availabilities()->with('team')->get(),
        ]);
    }

    /**
     * Store a newly created availability window.
     */
    public function store(Request $request, Fixture $fixture)
    {
        $validated = $request->validate($this->rules($fixture));

        TeamAvailability::create([
            'id_fixture' => $fixture->id,
            'id_team' => $validated['id_team'],
            'date' => $validated['date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
        ]);

        return redirect()->route('fixtures.availabilities.index', $fixture);
    }

    /**
     * Update the specified availability window.
     */
    public function update(Request $request, TeamAvailability $availability)
    {
        $fixture = $availability->fixture;

        $validated = $request->validate($this->rules($fixture, $availability->id));

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
    private function rules(Fixture $fixture, ?int $ignoreId = null): array
    {
        $unique = Rule::unique('team_availabilities')
            ->where(function ($query) use ($fixture) {
                $query->where('id_fixture', $fixture->id)
                    ->where('date', request('date'))
                    ->where('start_time', request('start_time'))
                    ->where('end_time', request('end_time'));
            });

        if ($ignoreId) {
            $unique->ignore($ignoreId);
        }

        return [
            'id_team' => ['required', 'exists:teams,id', $unique],
            'date' => [
                'required',
                'date',
                Rule::in([
                    $fixture->start_date->format('Y-m-d'),
                    $fixture->end_date->format('Y-m-d'),
                ]),
            ],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
        ];
    }
}
