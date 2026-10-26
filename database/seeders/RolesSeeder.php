<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        Role::findOrCreate('Administrador', 'web');
        Role::findOrCreate('Planillero', 'web');
    }
}
