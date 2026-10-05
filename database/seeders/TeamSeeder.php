<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Delegate;
use App\Models\Team;
use Illuminate\Database\Seeder;

class TeamSeeder extends Seeder
{
    /**
     * teams.id_category y teams.id_delegate son enteros sin FK.
     * Se resuelve tomando IDs reales de Category y Delegate ya sembrados.
     */
    public function run(): void
    {
        $categories = Category::all();
        $delegates = Delegate::all();

        // Si no hay padres, no se puede garantizar integridad: abortar.
        if ($categories->isEmpty() || $delegates->isEmpty()) {
            $this->command->warn('TeamSeeder omitido: sin categories o delegates.');
            return;
        }

        $teams = [
            ['name_team' => 'Lobos', 'city_team' => 'Montevideo', 'category' => 'Sub-14'],
            ['name_team' => 'Halcones', 'city_team' => 'Canelones', 'category' => 'Sub-14'],
            ['name_team' => 'Tigres', 'city_team' => 'Maldonado', 'category' => 'Sub-16'],
            ['name_team' => 'Pumas', 'city_team' => 'Colonia', 'category' => 'Sub-16'],
            ['name_team' => 'Cóndores', 'city_team' => 'Salto', 'category' => 'Sub-18'],
            ['name_team' => 'Jaguares', 'city_team' => 'Paysandú', 'category' => 'Mayores'],
        ];

        foreach ($teams as $index => $data) {
            $category = $categories->firstWhere('name_category', $data['category']) ?? $categories[$index % $categories->count()];
            $delegate = $delegates[$index % $delegates->count()];

            Team::firstOrCreate(
                ['name_team' => $data['name_team']],
                [
                    'city_team' => $data['city_team'],
                    // IDs reales, no números inventados:
                    'id_category' => $category->id_category,
                    'id_delegate' => $delegate->id_delegate,
                ]
            );
        }
    }
}
