<?php

namespace App\Http\Controllers;

use App\Models\Fixture;
use App\Services\PlayoffBracketService;
use App\Services\StandingsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReaderController extends Controller
{
    public function index(
        Request $request,
        StandingsService $standingsService,
        PlayoffBracketService $playoffBracketService
    ) {
        $data = $standingsService->forRequestedCombination($request->query('combination'));
        $data['playoffBracket'] = $playoffBracketService->forCombination($data['selectedCombination']);

        return Inertia::render('Reader/Index', $data);
    }

    public function fixtures()
    {
        $fixtures = Fixture::with(['tournament', 'games.teamLocal', 'games.teamVisitor'])
            ->whereDate('start_date', '>=', now()->toDateString())
            ->whereIn('status_fixture', ['scheduled', 'in_progress'])
            ->orderBy('start_date')
            ->get();

        return Inertia::render('Reader/Fixtures', [
            'fixtures' => $fixtures,
        ]);
    }

    public function showFixture(Fixture $fixture)
    {
        return Inertia::render('Reader/FixtureShow', [
            'fixture' => $fixture->load(['tournament', 'games.teamLocal', 'games.teamVisitor', 'availabilities.team']),
        ]);
    }
}
