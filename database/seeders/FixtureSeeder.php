<?php

namespace Database\Seeders;

use App\Models\Fixture;
use App\Models\Tournament;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class FixtureSeeder extends Seeder
{
    /**
     * Cantidad de fechas (fines de semana) que se generan por torneo.
     */
    private const FIXTURES_PER_TOURNAMENT = 5;

    /**
     */
    public function run(): void
    {
        $tournaments = Tournament::all();

        if ($tournaments->isEmpty()) {
            $this->command->warn('FixtureSeeder omitido: sin tournaments.');
            return;
        }

        foreach ($tournaments as $index => $tournament) {
            $start = Carbon::parse($tournament->start_date);
            $firstSaturday = $start->isSaturday() ? $start->copy() : $start->copy()->next(Carbon::SATURDAY);
            $firstSaturday->addWeeks($index * 2);

            for ($i = 0; $i < self::FIXTURES_PER_TOURNAMENT; $i++) {
                $saturday = $firstSaturday->copy()->addWeeks($i);
                $sunday = $saturday->copy()->addDay();

                Fixture::updateOrCreate(
                    [
                        'id_tournament' => $tournament->id,
                        'name_fixture' => 'Fecha '.($i + 1),
                    ],
                    [
                        'phase' => 'regular',
                        'start_date' => $saturday->toDateString(),
                        'end_date' => $sunday->toDateString(),
                        'status_fixture' => 'scheduled',
                    ]
                );
            }
        }
    }
}
