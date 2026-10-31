<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DelegateController;
use App\Http\Controllers\FixtureController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\GameSheetController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MatchReportController;
use App\Http\Controllers\MatchRosterController;
use App\Http\Controllers\MyGameSheetController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\PlayoffMatchController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RefereeController;
use App\Http\Controllers\ResultController;
use App\Http\Controllers\StandingController;
use App\Http\Controllers\TeamAvailabilityController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\TournamentController;
use App\Http\Controllers\TrainerController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'welcome'])->name('home');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/standings', [StandingController::class, 'index'])->name('standings.index');
});

Route::middleware(['auth', 'role:Administrador'])->group(function () {
    Route::put('/tournaments/{tournament}/categories/{category}/playoff-matches/{match}', [PlayoffMatchController::class, 'update']);
    Route::delete('/tournaments/{tournament}/categories/{category}/playoff-matches/{match}', [PlayoffMatchController::class, 'destroy']);
    Route::post('/tournaments/{tournament}/categories/{category}/playoff-matches', [PlayoffMatchController::class, 'store'])->name('playoff-matches.store');

    Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::get('/categories/create', [CategoryController::class, 'create'])->name('categories.create');
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
    Route::get('/categories/{category}/edit', [CategoryController::class, 'edit'])->name('categories.edit');

    Route::get('/delegates', [DelegateController::class, 'index'])->name('delegates.index');
    Route::get('/delegates/create', [DelegateController::class, 'create'])->name('delegates.create');
    Route::post('/delegates', [DelegateController::class, 'store'])->name('delegates.store');
    Route::get('/delegates/{delegate}/edit', [DelegateController::class, 'edit'])->name('delegates.edit');
    Route::put('/delegates/{delegate}', [DelegateController::class, 'update'])->name('delegates.update');
    Route::delete('/delegates/{delegate}', [DelegateController::class, 'destroy'])->name('delegates.destroy');

    Route::get('/teams', [TeamController::class, 'index'])->name('teams.index');
    Route::get('/teams/create', [TeamController::class, 'create'])->name('teams.create');
    Route::post('/teams', [TeamController::class, 'store'])->name('teams.store');
    Route::get('/teams/{team}', [TeamController::class, 'show'])->name('teams.show');
    Route::get('/teams/{team}/players', [PlayerController::class, 'byTeam'])->name('teams.players.index');
    Route::get('/teams/{team}/players/create', [PlayerController::class, 'createForTeam'])->name('teams.players.create');
    Route::post('/teams/{team}/players', [PlayerController::class, 'storeForTeam'])->name('teams.players.store');
    Route::get('/teams/{team}/players/{player}/edit', [PlayerController::class, 'editForTeam'])->name('teams.players.edit');
    Route::put('/teams/{team}/players/{player}', [PlayerController::class, 'updateForTeam'])->name('teams.players.update');
    Route::delete('/teams/{team}/players/{player}', [PlayerController::class, 'destroyForTeam'])->name('teams.players.destroy');
    Route::get('/teams/{team}/delegate', [DelegateController::class, 'showForTeam'])->name('teams.delegate.show');
    Route::post('/teams/{team}/delegate', [DelegateController::class, 'storeForTeam'])->name('teams.delegate.store');
    Route::put('/teams/{team}/delegate', [DelegateController::class, 'updateForTeam'])->name('teams.delegate.update');
    Route::delete('/teams/{team}/delegate', [DelegateController::class, 'destroyForTeam'])->name('teams.delegate.destroy');
    Route::get('/teams/{team}/edit', [TeamController::class, 'edit'])->name('teams.edit');
    Route::put('/teams/{team}', [TeamController::class, 'update'])->name('teams.update');
    Route::delete('/teams/{team}', [TeamController::class, 'destroy'])->name('teams.destroy');

    Route::get('/trainers', [TrainerController::class, 'index'])->name('trainers.index');
    Route::get('/trainers/create', [TrainerController::class, 'create'])->name('trainers.create');
    Route::post('/trainers', [TrainerController::class, 'store'])->name('trainers.store');
    Route::get('/trainers/{trainer}/edit', [TrainerController::class, 'edit'])->name('trainers.edit');
    Route::put('/trainers/{trainer}', [TrainerController::class, 'update'])->name('trainers.update');
    Route::delete('/trainers/{trainer}', [TrainerController::class, 'destroy'])->name('trainers.destroy');

    Route::get('/players', [PlayerController::class, 'index'])->name('players.index');
    Route::get('/players/create', [PlayerController::class, 'create'])->name('players.create');
    Route::post('/players', [PlayerController::class, 'store'])->name('players.store');
    Route::get('/players/{player}/edit', [PlayerController::class, 'edit'])->name('players.edit');
    Route::put('/players/{player}', [PlayerController::class, 'update'])->name('players.update');
    Route::delete('/players/{player}', [PlayerController::class, 'destroy'])->name('players.destroy');

    Route::get('/referees', [RefereeController::class, 'index'])->name('referees.index');
    Route::get('/referees/create', [RefereeController::class, 'create'])->name('referees.create');
    Route::post('/referees', [RefereeController::class, 'store'])->name('referees.store');
    Route::get('/referees/{referee}/edit', [RefereeController::class, 'edit'])->name('referees.edit');
    Route::put('/referees/{referee}', [RefereeController::class, 'update'])->name('referees.update');
    Route::delete('/referees/{referee}', [RefereeController::class, 'destroy'])->name('referees.destroy');

    Route::get('/games/create', [GameController::class, 'create'])->name('games.create');
    Route::post('/games', [GameController::class, 'store'])->name('games.store');
    Route::get('/games/{game}', [GameController::class, 'show'])->name('games.show');
    Route::get('/games/{game}/edit', [GameController::class, 'edit'])->name('games.edit');
    Route::put('/games/{game}', [GameController::class, 'update'])->name('games.update');
    Route::delete('/games/{game}', [GameController::class, 'destroy'])->name('games.destroy');
    Route::get('/games/{game}/lista/{team}', [MatchRosterController::class, 'edit'])->name('games.roster.edit');
    Route::put('/games/{game}/lista/{team}', [MatchRosterController::class, 'update'])->name('games.roster.update');

    Route::get('/tournaments', [TournamentController::class, 'index'])->name('tournaments.index');
    Route::get('/tournaments/create', [TournamentController::class, 'create'])->name('tournaments.create');
    Route::post('/tournaments', [TournamentController::class, 'store'])->name('tournaments.store');
    Route::get('/tournaments/{tournament}', [TournamentController::class, 'show'])->name('tournaments.show');
    Route::get('/tournaments/{tournament}/categories', [TournamentController::class, 'categories'])->name('tournaments.categories.index');
    Route::post('/tournaments/{tournament}/categories', [TournamentController::class, 'storeCategory'])->name('tournaments.categories.store');
    Route::put('/tournaments/{tournament}/categories/{category}', [TournamentController::class, 'updateCategory'])->name('tournaments.categories.update');
    Route::delete('/tournaments/{tournament}/categories/{category}', [TournamentController::class, 'detachCategory'])->name('tournaments.categories.destroy');
    Route::get('/tournaments/{tournament}/edit', [TournamentController::class, 'edit'])->name('tournaments.edit');
    Route::put('/tournaments/{tournament}', [TournamentController::class, 'update'])->name('tournaments.update');
    Route::delete('/tournaments/{tournament}', [TournamentController::class, 'destroy'])->name('tournaments.destroy');

    Route::get('/fixtures', [FixtureController::class, 'index'])->name('fixtures.index');
    Route::get('/fixtures/create', [FixtureController::class, 'create'])->name('fixtures.create');
    Route::post('/fixtures', [FixtureController::class, 'store'])->name('fixtures.store');
    Route::get('/fixtures/{fixture}', [FixtureController::class, 'show'])->name('fixtures.show');
    Route::get('/fixtures/{fixture}/edit', [FixtureController::class, 'edit'])->name('fixtures.edit');
    Route::put('/fixtures/{fixture}', [FixtureController::class, 'update'])->name('fixtures.update');
    Route::delete('/fixtures/{fixture}', [FixtureController::class, 'destroy'])->name('fixtures.destroy');

    Route::get('/match-reports', [MatchReportController::class, 'index'])->name('match-reports.index');

    Route::get('/fixtures/{fixture}/availabilities', [TeamAvailabilityController::class, 'index'])->name('fixtures.availabilities.index');
    Route::post('/fixtures/{fixture}/availabilities', [TeamAvailabilityController::class, 'store'])->name('fixtures.availabilities.store');
    Route::put('/availabilities/{availability}', [TeamAvailabilityController::class, 'update'])->name('availabilities.update');
    Route::delete('/availabilities/{availability}', [TeamAvailabilityController::class, 'destroy'])->name('availabilities.destroy');

    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::get('/users/create', [UserController::class, 'create'])->name('users.create');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::get('/users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
});

Route::middleware(['auth', 'role:Administrador|Planillero'])->group(function () {
    Route::get('/games/{game}/planilla', [GameSheetController::class, 'show'])->name('games.sheet.show');
    Route::put('/games/{game}/planilla', [GameSheetController::class, 'update'])->name('games.sheet.update');
    Route::post('/games/{game}/planilla/close', [GameSheetController::class, 'close'])->name('games.sheet.close');
    Route::put('/games/{game}/result', [ResultController::class, 'update'])->name('games.result.update');
});

Route::middleware(['auth', 'role:Planillero'])->group(function () {
    Route::get('/mis-planillas', [MyGameSheetController::class, 'index'])->name('my-sheets.index');
});

require __DIR__.'/auth.php';
