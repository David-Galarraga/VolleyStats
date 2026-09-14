<?php

namespace App\Http\Controllers;

use App\Models\Trainer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TrainerController extends Controller
{
    public function index()
    {
        $trainers = Trainer::all();

        return Inertia::render('Trainers/Index', [
            'trainers' => $trainers,
        ]);
    }

    public function create()
    {
        return Inertia::render('Trainers/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name_trainer' => 'required|string|max:50',
            'phone_trainer' => 'required|string|max:15',
            'email_trainer' => 'required|email|max:50|unique:trainers,email_trainer',
        ]);

        Trainer::create([
            'name_trainer' => $request->input('name_trainer'),
            'phone_trainer' => $request->input('phone_trainer'),
            'email_trainer' => $request->input('email_trainer'),
        ]);

        return redirect()->route('trainers.index');
    }

    public function show(Trainer $trainer)
    {
        return Inertia::render('Trainers/Show', [
            'trainer' => $trainer,
        ]);
    }

    public function edit(Trainer $trainer)
    {
        return Inertia::render('Trainers/Edit', [
            'trainer' => $trainer,
        ]);
    }

    public function update(Request $request, Trainer $trainer)
    {
        $request->validate([
            'name_trainer' => 'required|string|max:50',
            'phone_trainer' => 'required|string|max:15',
            'email_trainer' => 'required|email|max:50|unique:trainers,email_trainer,' . $trainer->id_trainer . ',id_trainer',
        ]);

        $trainer->update([
            'name_trainer' => $request->input('name_trainer'),
            'phone_trainer' => $request->input('phone_trainer'),
            'email_trainer' => $request->input('email_trainer'),
        ]);

        return redirect()->route('trainers.index');
    }

    public function destroy(Trainer $trainer)
    {
        $trainer->delete();

        return redirect()->route('trainers.index');
    }
}

