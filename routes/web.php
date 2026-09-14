<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserTypeController;
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

//[rutas de user-types]
Route::get('/user-types', [\App\Http\Controllers\UserTypeController::class, 'index'])->name('user-types.index');
Route::get('/user-types/create', [\App\Http\Controllers\UserTypeController::class, 'create'])->name('user-types.create');
Route::post('/user-types', [\App\Http\Controllers\UserTypeController::class, 'store'])->name('user-types.store');
Route::get('/user-types/{userType}/edit', [\App\Http\Controllers\UserTypeController::class, 'edit'])->name('user-types.edit');
Route::put('/user-types/{userType}', [\App\Http\Controllers\UserTypeController::class, 'update'])->name('user-types.update');
Route::delete('/user-types/{userType}', [\App\Http\Controllers\UserTypeController::class, 'destroy'])->name('user-types.destroy');

//[rutas de users]
Route::get('/users', [\App\Http\Controllers\UserController::class, 'index'])->name('users.index');
Route::get('/users/create', [\App\Http\Controllers\UserController::class, 'create'])->name('users.create');
Route::post('/users', [\App\Http\Controllers\UserController::class, 'store'])->name('users.store');
Route::get('/users/{user}/edit', [\App\Http\Controllers\UserController::class, 'edit'])->name('users.edit');
Route::put('/users/{user}', [\App\Http\Controllers\UserController::class, 'update'])->name('users.update');
Route::delete('/users/{user}', [\App\Http\Controllers\UserController::class, 'destroy'])->name('users.destroy');


require __DIR__.'/auth.php';
