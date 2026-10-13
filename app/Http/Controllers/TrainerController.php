<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\Trainer;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class TrainerController extends Controller
{
    public function index()
    {
        return Inertia::render('Trainers/Index', [
            'trainers' => Trainer::orderBy('name_trainer')->get()->map(fn (Trainer $trainer) => [
                'id_trainer' => $trainer->id_trainer,
                'name_trainer' => $trainer->name_trainer,
                'dni_trainer' => $trainer->dni_trainer,
                'birthdate_trainer' => $trainer->birthdate_trainer?->format('d/m/Y'),
            ]),
        ]);
    }

    public function create()
    {
        return Inertia::render('Trainers/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name_trainer' => ['required', 'string', 'max:50'],
            'dni_trainer' => [
                'required', 'string',
                'regex:/^(?:[0-9]{8}|[0-9]{2}\.[0-9]{3}\.[0-9]{3})$/',
                'unique:trainers,dni_trainer',
            ],
            'birthdate_trainer' => ['required', 'date', 'before_or_equal:today'],
        ]);

        Trainer::create($data);

        return redirect()->route('trainers.index');
    }

    public function show(Trainer $trainer)
    {
        return Inertia::render('Trainers/Show', ['trainer' => $trainer]);
    }

    public function edit(Trainer $trainer)
    {
        return Inertia::render('Trainers/Edit', ['trainer' => $trainer]);
    }

    public function update(Request $request, Trainer $trainer)
    {
        $data = $request->validate([
            'name_trainer' => ['required', 'string', 'max:50'],
            'dni_trainer' => [
                'required', 'string',
                'regex:/^(?:[0-9]{8}|[0-9]{2}\.[0-9]{3}\.[0-9]{3})$/',
                Rule::unique('trainers', 'dni_trainer')->ignore($trainer->id_trainer, 'id_trainer'),
            ],
            'birthdate_trainer' => ['required', 'date', 'before_or_equal:today'],
        ]);

        $trainer->update($data);

        return redirect()->route('trainers.index');
    }

    public function destroy(Trainer $trainer)
    {
        if (Team::where('id_trainer', $trainer->id_trainer)->exists()) {
            return back()->withErrors([
                'trainer' => 'No se puede eliminar este entrenador mientras esté asociado a un equipo.',
            ]);
        }

        $trainer->delete();

        return redirect()->route('trainers.index');
    }
}
