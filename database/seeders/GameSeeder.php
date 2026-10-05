<?php

namespace Database\Seeders;

use App\Models\Fixture;
use App\Models\Game;
use App\Models\Referee;
use App\Models\Team;
use Illuminate\Database\Seeder;

class GameSeeder extends Seeder
{
    /**
     */
    public function run(): void
    {
        $teams = Team::all();
        $fixtures = Fixture::with('tournament')->get();
        $referees = Referee::all();

        if ($teams->count() < 2 || $fixtures->isEmpty()) {
            $this->command->warn('GameSeeder omitido: se necesitan al menos 2 teams y 1 fixture.');
            return;
        }

        foreach ($fixtures as $index => $fixture) {
            // Dos equipos distintos tomados de los reales, no IDs al azar.
            $pair = $teams->shuffle()->take(2);
            if ($pair->count() < 2) {
                continue;
            }

            // Árbitro real o null (columna nullable): alternado para tener
            // ambos casos en los datos de prueba.
            $refereeId = $referees->isNotEmpty() && $index % 2 === 0
                ? $referees[$index % $referees->count()]->id
                : null;

            Game::firstOrCreate(
                [
                    'id_tournament' => $fixture->id_tournament,
                    'id_fixture' => $fixture->id,
                    'id_team_local' => $pair[0]->id,
                    'id_team_visitor' => $pair[1]->id,
                ],
                [
                    'id_referee' => $refereeId,
                    'date' => $fixture->start_date->format('Y-m-d'),
                    'time' => '16:00:00',
                    'status_game' => 'pending',
                    'set_local' => null,
                    'set_visitor' => null,
                    'result' => 'pending',
                ]
            );
        }
    }
}
