<?php

namespace App\Http\Controllers;

use App\Models\Delegate;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class DelegateController extends Controller
{

    public function showForTeam(Team $team)
    {
        return Inertia::render('Teams/Delegate', [
            'team' => $team->only(['id', 'name_team']),
            'delegate' => $team->delegate,
            'availableDelegates' => Delegate::query()
                ->where('id_delegate', '!=', $team->id_delegate)
                ->orderBy('name_delegate')
                ->get(),
        ]);
    }

    public function storeForTeam(Request $request, Team $team)
    {
        if ($team->delegate) {
            return back()->withErrors(['delegate' => 'Este equipo ya tiene un delegado asociado.']);
        }

        $data = $request->validate([
            'name_delegate' => 'required|string|max:50',
            'email_delegate' => 'required|email|max:50|unique:delegates,email_delegate',
            'phone_delegate' => 'required|string|max:15',
        ]);

        DB::transaction(function () use ($data, $team) {
            $delegate = Delegate::create($data);
            $team->update(['id_delegate' => $delegate->id_delegate]);
        });

        return redirect()->route('teams.delegate.show', $team);
    }

    public function updateForTeam(Request $request, Team $team)
    {
        $delegate = $team->delegate;
        abort_unless($delegate, 404);

        $data = $request->validate([
            'name_delegate' => 'required|string|max:50',
            'email_delegate' => 'required|email|max:50|unique:delegates,email_delegate,'.$delegate->id_delegate.',id_delegate',
            'phone_delegate' => 'required|string|max:15',
        ]);

        $delegate->update($data);

        return redirect()->route('teams.delegate.show', $team);
    }

    public function destroyForTeam(Request $request, Team $team)
    {
        $delegate = $team->delegate;
        abort_unless($delegate, 404);

        $data = $request->validate([
            'replacement_delegate_id' => [
                'required',
                'integer',
                'exists:delegates,id_delegate',
                Rule::notIn([$delegate->id_delegate]),
            ],
        ]);

        DB::transaction(function () use ($team, $delegate, $data) {
            $team->update(['id_delegate' => $data['replacement_delegate_id']]);

            if (! Team::where('id_delegate', $delegate->id_delegate)->exists()) {
                $delegate->delete();
            }
        });

        return redirect()->route('teams.delegate.show', $team);
    }

    public function index()
    {
        $delegates = Delegate::all();

        return Inertia::render('Delegates/Index', [
            'delegates' => $delegates,
        ]);
    }

    public function create()
    {
        return Inertia::render('Delegates/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name_delegate' => 'required|string|max:50',
            'email_delegate' => 'required|email|unique:delegates,email_delegate',
            'phone_delegate' => 'required|string|max:15',
        ]);

        $delegate = Delegate::create([
            'name_delegate' => $request->input('name_delegate'),
            'email_delegate' => $request->input('email_delegate'),
            'phone_delegate' => $request->input('phone_delegate'),
        ]);

        return redirect()->route('delegates.index');
    }

    public function show(Delegate $delegate)
    {
        return Inertia::render('Delegates/Show', [
            'delegate' => $delegate,
        ]);
    }

    public function edit(Delegate $delegate)
    {
        return Inertia::render('Delegates/Edit', [
            'delegate' => $delegate,
        ]);
    }

    public function update(Request $request, Delegate $delegate)
    {
        $request->validate([
            'name_delegate' => 'required|string|max:50',
            'email_delegate' => 'required|email|unique:delegates,email_delegate,' . $delegate->id_delegate.',id_delegate',
            'phone_delegate' => 'required|string|max:15',
        ]);

        $delegate->update([
            'name_delegate' => $request->input('name_delegate'),
            'email_delegate' => $request->input('email_delegate'),
            'phone_delegate' => $request->input('phone_delegate'),
        ]);

        return redirect()->route('delegates.index');
    }

    public function destroy(Delegate $delegate)
    {
        if (Team::where('id_delegate', $delegate->id_delegate)->exists()) {
            return back()->withErrors([
                'delegate' => 'No se puede eliminar este delegado mientras esté asociado a un equipo.',
            ]);
        }

        $delegate->delete();
        return redirect()->route('delegates.index');
    }
}
