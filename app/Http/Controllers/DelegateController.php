<?php

namespace App\Http\Controllers;

use App\Models\Delegate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DelegateController extends Controller
{

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
        $delegate->delete();
        return redirect()->route('delegates.index');
    }
}
