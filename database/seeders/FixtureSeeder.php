<?php

namespace Database\Seeders;

use App\Models\Fixture;
use App\Models\Tournament;
use Illuminate\Database\Seeder;

class FixtureSeeder extends Seeder
{
    /**
     * fixtures.id_tournament es entero sin FK: se usa el id real del torneo.
     * Las fechas del fixture quedan contenidas en el rango del torneo.
     */
    public function run(): void
    {
        $tournaments = Tournament::all();

        if ($tournaments->isEmpty()) {
            $this->command->warn('FixtureSeeder omitido: sin tournaments.');
            return;
        }

        foreach ($tournaments as $tournament) {
            Fixture::firstOrCreate(
                [
                    'id_tournament' => $tournament->id,
                    'name_fixture' => 'Fecha 1 - '.$tournament->name_tournament,
                ],
                [
                    'start_date' => $tournament->start_date,
                    'end_date' => $tournament->end_date,
                    'status_fixture' => 'scheduled',
                ]
            );

            Fixture::firstOrCreate(
                [
                    'id_tournament' => $tournament->id,
                    'name_fixture' => 'Fecha 2 - '.$tournament->name_tournament,
                ],
                [
                    'start_date' => $tournament->start_date,
                    'end_date' => $tournament->end_date,
                    'status_fixture' => 'scheduled',
                ]
            );
        }
    }
}
