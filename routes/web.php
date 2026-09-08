<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DelegateController;
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


require __DIR__.'/auth.php';
