<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class UserController extends Controller
{
    private const ROLES = ['Administrador', 'Planillero'];

    public function index()
    {
        $users = User::query()
            ->with('roles')
            ->orderBy('name_user')
            ->get()
            ->map(fn (User $user) => [
                'id_user' => $user->id_user,
                'name_user' => $user->name_user,
                'email' => $user->email,
                'is_active' => $user->is_active,
                'role' => $user->getRoleNames()->first(),
            ]);

        return Inertia::render('Users/Index', [
            'users' => $users,
        ]);
    }

    public function create()
    {
        return Inertia::render('Users/Create', [
            'roles' => self::ROLES,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->rules());

        $user = User::create([
            'name_user' => $data['name_user'],
            'email' => $data['email'],
            'email_verified_at' => now(),
            'password' => $data['password'],
            'is_active' => $data['is_active'] ?? true,
            'fecha_creation_user' => now(),
        ]);

        $user->assignRole($data['role']);

        return redirect()->route('users.index');
    }

    public function edit(User $user)
    {
        return Inertia::render('Users/Edit', [
            'user' => $user->only(['id_user', 'name_user', 'email', 'is_active']),
            'currentRole' => $user->getRoleNames()->first(),
            'roles' => self::ROLES,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate($this->rules($user));

        if ($user->is($request->user()) && $data['role'] !== 'Administrador') {
            throw ValidationException::withMessages([
                'role' => 'No podés quitarte el rol Administrador.',
            ]);
        }

        if ($user->is($request->user()) && ! ($data['is_active'] ?? true)) {
            throw ValidationException::withMessages([
                'is_active' => 'No podés desactivar tu propio usuario.',
            ]);
        }

        $user->update([
            'name_user' => $data['name_user'],
            'email' => $data['email'],
            'is_active' => $data['is_active'] ?? true,
            ...(filled($data['password'] ?? null) ? ['password' => $data['password']] : []),
        ]);

        $user->syncRoles([$data['role']]);

        return redirect()->route('users.index');
    }

    public function destroy(Request $request, User $user)
    {
        if ($user->is($request->user())) {
            throw ValidationException::withMessages([
                'user' => 'No podés eliminar tu propio usuario.',
            ]);
        }

        $user->syncRoles([]);
        $user->delete();

        return redirect()->route('users.index');
    }

    private function rules(?User $user = null): array
    {
        return [
            'name_user' => ['required', 'string', 'max:50'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:50',
                Rule::unique('users', 'email')->ignore($user?->id_user, 'id_user'),
            ],
            'password' => [
                $user ? 'nullable' : 'required',
                'confirmed',
                Rules\Password::defaults(),
            ],
            'role' => ['required', Rule::in(self::ROLES)],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
