<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::all();
        return Inertia('Users/Index', [
            'users' => $users
        ]);
    }


    public function create()
    {
        return Inertia('Users/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name_user' => 'required|string|max:50',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name_user' => $request->input('name_user'),
            'email' => $request->input('email'),
            'password' => bcrypt($request->input('password')),
        ]);

        return redirect()->route('users.index');
    }

    public function show(User $user)
    {
        return Inertia('Users/Show', [
            'user' => $user,
        ]);
    }

    public function edit(User $user)
    {
        return Inertia('Users/Edit', [
            'user' => $user,
        ]);
    }

    public function update(Request $request, User $user)
    {

        $request->validate([
            'name_user' => 'required|string|max:50',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id_user. ',id_user',
            'password' => 'nullable|string|min:8',
        ]);

        $user->update([
            'name_user' => $request->input('name_user'),
            'email' => $request->input('email'),
            'password' => $request->filled('password') 
                ? bcrypt($request->input('password')) 
                : $user->password,
        ]);

        return redirect()->route('users.index');
    }

    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('users.index');
    }
}
