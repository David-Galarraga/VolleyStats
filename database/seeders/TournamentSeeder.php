<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Tournament;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TournamentSeeder extends Seeder
{
    /**
     * Crea torneos y sus vínculos lógicos con categorías.
     * Como tournament_categories usa enteros sin FK, el vínculo se
     * arma solo con IDs reales ya existentes.
     */
    public function run(): void
    {
        $tournaments = [
            [
                'name_tournament' => 'Apertura 2026',
                'start_date' => '2026-03-01',
                'end_date' => '2026-06-30',
                'status_tournament' => 'finished',
                'categories' => ['Sub-14', 'Sub-16'],
            ],
            [
                'name_tournament' => 'Clausura 2026',
                'start_date' => '2026-08-01',
                'end_date' => '2026-11-30',
                'status_tournament' => 'active',
                'categories' => ['Sub-18', 'Mayores'],
            ],
        ];

        // Mapa nombre -> id_category real (PK no estándar: id_category).
        $categoryIds = Category::all()->pluck('id_category', 'name_category');

        foreach ($tournaments as $data) {
            $tournament = Tournament::firstOrCreate(
                ['name_tournament' => $data['name_tournament']],
                [
                    'start_date' => $data['start_date'],
                    'end_date' => $data['end_date'],
                    'status_tournament' => $data['status_tournament'],
                ]
            );

            foreach ($data['categories'] as $categoryName) {
                if (! $categoryIds->has($categoryName)) {
                    continue;
                }

                DB::table('tournament_categories')->updateOrInsert(
                    [
                        'id_tournament' => $tournament->id,
                        'id_category' => $categoryIds->get($categoryName),
                    ],
                    [
                        'number_matches' => 6,
                        'number_teams' => 4,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
        }
    }
}
