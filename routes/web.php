<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DelegateController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\TrainerController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

//[rutas de categories]
Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
Route::get('/categories/create', [CategoryController::class, 'create'])->name('categories.create');
Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
Route::get('/categories/{category}/edit', [CategoryController::class, 'edit'])->name('categories.edit');

//[rutas de delegates]
Route::get('/delegates', [DelegateController::class, 'index'])->name('delegates.index');
Route::get('/delegates/create', [DelegateController::class, 'create'])->name('delegates.create');
Route::post('/delegates', [DelegateController::class, 'store'])->name('delegates.store');
Route::get('/delegates/{delegate}/edit', [DelegateController::class, 'edit'])->name('delegates.edit');
Route::put('/delegates/{delegate}', [DelegateController::class, 'update'])->name('delegates.update');
Route::delete('/delegates/{delegate}', [DelegateController::class, 'destroy'])->name('delegates.destroy');

//[rutas de teams]
Route::get('/teams', [TeamController::class, 'index'])->name('teams.index');
Route::get('/teams/create', [TeamController::class, 'create'])->name('teams.create');
Route::post('/teams', [TeamController::class, 'store'])->name('teams.store');
Route::get('/teams/{team}/edit', [TeamController::class, 'edit'])->name('teams.edit');
Route::put('/teams/{team}', [TeamController::class, 'update'])->name('teams.update');
Route::delete('/teams/{team}', [TeamController::class, 'destroy'])->name('teams.destroy');

//[rutas de trainers]
Route::get('/trainers', [TrainerController::class, 'index'])->name('trainers.index');
Route::get('/trainers/create', [TrainerController::class, 'create'])->name('trainers.create');
Route::post('/trainers', [TrainerController::class, 'store'])->name('trainers.store');
Route::get('/trainers/{trainer}/edit', [TrainerController::class, 'edit'])->name('trainers.edit');
Route::put('/trainers/{trainer}', [TrainerController::class, 'update'])->name('trainers.update');
Route::delete('/trainers/{trainer}', [TrainerController::class, 'destroy'])->name('trainers.destroy');

//[rutas de players]
Route::get('/players', [PlayerController::class, 'index'])->name('players.index');
Route::get('/players/create', [PlayerController::class, 'create'])->name('players.create');
Route::post('/players', [PlayerController::class, 'store'])->name('players.store');
Route::get('/players/{player}/edit', [PlayerController::class, 'edit'])->name('players.edit');
Route::put('/players/{player}', [PlayerController::class, 'update'])->name('players.update');
Route::delete('/players/{player}', [PlayerController::class, 'destroy'])->name('players.destroy');


require __DIR__.'/auth.php';
