<?php

namespace App\Http\Controllers;

use App\Models\PlayoffMatch;
use App\Models\Team;
use App\Services\PlayoffBracketService;
use App\Services\StandingsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StandingController extends Controller
{
    public function index(
        Request $request,
        StandingsService $standingsService,
        PlayoffBracketService $playoffBracketService
    ) {
        $data = $standingsService->forRequestedCombination($request->query('combination'));
        $selected = $data['selectedCombination'];

        $data['playoffBracket'] = $playoffBracketService->forCombination($selected);
        $data['bracketTeams'] = $selected ? Team::query()->where('id_category', $selected['category_id'])->orderBy('name_team')->get(['id', 'name_team']) : [];
        $data['playoffStages'] = PlayoffMatch::STAGES;
        $data['canManagePlayoff'] = $request->user()->hasRole('Administrador');

        return Inertia::render(
            'Standings/Index',
            $data
        );
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
