<?php

namespace App\Http\Controllers;

use App\Models\Tournament;
use App\Services\StandingsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function welcome(): Response
    {
        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
        ]);
    }

    public function dashboard(Request $request, StandingsService $standingsService): Response
    {
        return Inertia::render('Dashboard', $this->standingsData($request, $standingsService));
    }

    private function standingsData(Request $request, StandingsService $standingsService): array
    {
        $combinations = Tournament::query()
            ->whereHas('categories')
            ->with(['categories' => fn ($query) => $query->orderBy('name_category')])
            ->orderByDesc('start_date')
            ->get()
            ->flatMap(fn (Tournament $tournament) => $tournament->categories->map(fn ($category) => [
                'value' => $tournament->id.':'.$category->id_category,
                'tournament_id' => (int) $tournament->id,
                'tournament_name' => $tournament->name_tournament,
                'category_id' => (int) $category->id_category,
                'category_name' => $category->name_category,
                'category_gender' => $category->genero_category,
            ]))
            ->values();

        $requestedCombination = $request->query('combination');
        $selectedCombination = $combinations->firstWhere('value', $requestedCombination)
            ?? $combinations->first();

        $standings = $selectedCombination
            ? $standingsService->calculate(
                $selectedCombination['tournament_id'],
                $selectedCombination['category_id']
            )
            : collect();

        return [
            'combinations' => $combinations,
            'selectedCombination' => $selectedCombination,
            'standings' => $standings,
        ];
    }
}
