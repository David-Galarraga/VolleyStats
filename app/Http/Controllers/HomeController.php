<?php

namespace App\Http\Controllers;

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
        return Inertia::render(
            'Dashboard',
            $standingsService->forRequestedCombination($request->query('combination'))
        );
    }
}
