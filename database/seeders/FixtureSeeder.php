<?php

namespace Database\Seeders;

use App\Models\Fixture;
use App\Models\Tournament;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class FixtureSeeder extends Seeder
{
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
            $weekends = [
                [$firstSaturday->copy(), $firstSaturday->copy()->addDay()],
                [$firstSaturday->copy()->addWeek(), $firstSaturday->copy()->addWeek()->addDay()],
            ];

            foreach (['Fecha 1', 'Fecha 2'] as $i => $name) {
                [$start, $end] = $weekends[$i];

                Fixture::firstOrCreate(
                    [
                        'id_tournament' => $tournament->id,
                        'name_fixture' => $name.' - '.$tournament->name_tournament,
                    ],
                    [
                        'start_date' => $start->toDateString(),
                        'end_date' => $end->toDateString(),
                        'status_fixture' => 'scheduled',
                    ]
                );
            }
        }
    }
}
