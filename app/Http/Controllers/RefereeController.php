<?php

namespace App\Http\Controllers;

use App\Models\Referee;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RefereeController extends Controller
{
    public function index()
    {
        $referees = Referee::all();

        return Inertia::render('Referees/Index', [
            'referees' => $referees,
        ]);
    }

    public function create()
    {
        return Inertia::render('Referees/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name_referee' => 'required|string|max:50',
            'email_referee' => 'required|email|max:50|unique:referees,email_referee',
            'phone_referee' => 'nullable|string|max:15',
        ]);

        Referee::create([
            'name_referee' => $request->input('name_referee'),
            'email_referee' => $request->input('email_referee'),
            'phone_referee' => $request->input('phone_referee'),
        ]);

        return redirect()->route('referees.index');
    }

    public function show(Referee $referee)
    {
        return Inertia::render('Referees/Show', [
            'referee' => $referee,
        ]);
    }

    public function edit(Referee $referee)
    {
        return Inertia::render('Referees/Edit', [
            'referee' => $referee,
        ]);
    }

    public function update(Request $request, Referee $referee)
    {
        $request->validate([
            'name_referee' => 'required|string|max:50',
            'email_referee' => 'required|email|max:50|unique:referees,email_referee,' . $referee->id,
            'phone_referee' => 'nullable|string|max:15',
        ]);

        $referee->update([
            'name_referee' => $request->input('name_referee'),
            'email_referee' => $request->input('email_referee'),
            'phone_referee' => $request->input('phone_referee'),
        ]);

        return redirect()->route('referees.index');
    }

    public function destroy(Referee $referee)
    {
        $referee->delete();

        return redirect()->route('referees.index');
    }
}
