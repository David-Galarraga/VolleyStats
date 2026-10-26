<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    public function up(): void
    {
        $admin = Role::findOrCreate('Administrador', 'web');
        Role::findOrCreate('Planillero', 'web');

        User::query()
            ->where('id_user_type', 2)
            ->get()
            ->each
            ->assignRole($admin);

        if (! User::role('Administrador')->exists()) {
            User::query()->orderBy('id_user')->first()?->assignRole($admin);
        }
    }

    public function down(): void
    {
        $roles = Role::query()
            ->whereIn('name', ['Administrador', 'Planillero'])
            ->get();

        $roles->each->delete();
    }
};
