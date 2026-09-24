<?php

namespace App\Http\Controllers;

use App\Models\Fixture;
use App\Models\Tournament;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FixtureController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $fixtures = Fixture::with('tournament')->withCount('games')->get();

        return Inertia::render('Fixtures/Index', [
            'fixtures' => $fixtures,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Fixtures/Create', [
            'tournaments' => Tournament::all(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate($this->rules());

        Fixture::create([
            'id_tournament' => $request->input('id_tournament'),
            'name_fixture' => $request->input('name_fixture'),
            'start_date' => $request->input('start_date'),
            'end_date' => $request->input('end_date'),
            'status_fixture' => $request->input('status_fixture', 'scheduled'),
        ]);

        return redirect()->route('fixtures.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Fixture $fixture)
    {
        return Inertia::render('Fixtures/Show', [
            'fixture' => $fixture->load(['tournament', 'games.fixture', 'games.teamLocal', 'games.teamVisitor', 'games.referee', 'availabilities.team']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Fixture $fixture)
    {
        return Inertia::render('Fixtures/Edit', [
            'fixture' => $fixture,
            'tournaments' => Tournament::all(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Fixture $fixture)
    {
        $request->validate($this->rules());

        $fixture->update([
            'id_tournament' => $request->input('id_tournament'),
            'name_fixture' => $request->input('name_fixture'),
            'start_date' => $request->input('start_date'),
            'end_date' => $request->input('end_date'),
            'status_fixture' => $request->input('status_fixture', 'scheduled'),
        ]);

        return redirect()->route('fixtures.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Fixture $fixture)
    {
        $fixture->delete();

        return redirect()->route('fixtures.index');
    }

    /**
     * Validation rules shared by store and update.
     */
    private function rules(): array
    {
        return [
            'id_tournament' => 'required|exists:tournaments,id',
            'name_fixture' => 'required|string|max:100',
            'start_date' => [
                'required',
                'date',
                function ($attribute, $value, $fail) {
                    if (Carbon::parse($value)->dayOfWeek !== Carbon::SATURDAY) {
                        $fail('La fecha de inicio debe ser un sábado.');
                    }
                },
            ],
            'end_date' => [
                'required',
                'date',
                'after:start_date',
                function ($attribute, $value, $fail) {
                    $start = Carbon::parse(request()->input('start_date'));
                    $end = Carbon::parse($value);
                    if ($end->dayOfWeek !== Carbon::SUNDAY) {
                        $fail('La fecha de fin debe ser un domingo.');
                    }
                    if (! $start->copy()->addDay()->isSameDay($end)) {
                        $fail('El fixture debe abarcar solo sábado y domingo.');
                    }
                },
            ],
            'status_fixture' => 'nullable|string|max:50',
        ];
    }
}
