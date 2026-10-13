<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Tournament;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TournamentSeeder extends Seeder
{
    public function run(): void
    {
        $tournament = Tournament::updateOrCreate(
            ['name_tournament' => 'Torneo de Prueba 2026'],
            [
                'start_date' => '2026-11-01',
                'end_date' => '2027-02-28',
                'status_tournament' => 'scheduled',
            ]
        );

        $categoryTeamCounts = collect(VolleyballTestDataset::teams())
            ->countBy(fn (array $team) => $team['category'].'|'.$team['gender']);

        foreach (Category::all() as $category) {
            $teamCount = $categoryTeamCounts->get($category->name_category.'|'.$category->genero_category);
            if (! $teamCount) {
                continue;
            }

            DB::table('tournament_categories')->updateOrInsert(
                [
                    'id_tournament' => $tournament->id,
                    'id_category' => $category->id_category,
                ],
                [
                    'number_matches' => null,
                    'number_teams' => $teamCount,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
