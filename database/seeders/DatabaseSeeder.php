<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        \Illuminate\Support\Facades\DB::table('user_types')->insertOrIgnore([
            [
                'id_user_type' => 1,
                'name_user_type' => 'Usuario',
                'description_user_type' => 'Usuario registrado general',
            ],
            [
                'id_user_type' => 2,
                'name_user_type' => 'Administrador',
                'description_user_type' => 'Administrador del sistema',
            ],
        ]);

        User::factory()->create([
            'name_user' => 'Test User',
            'email' => 'test@example.com',
            'id_user_type' => 1,
            'fecha_creation_user' => now(),
        ]);
    }
}
