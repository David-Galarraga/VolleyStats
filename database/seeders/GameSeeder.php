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
     * Partidos que se generan por cada fecha (fixture).
     */
    private const GAMES_PER_FIXTURE = 16;

    /**
     * Partidos que se generan por día (sábado y domingo).
     */
    private const GAMES_PER_DAY = 8;

    /**
     * Franjas horarias disponibles para cada día.
     */
    private const TIMES = [
        '09:00:00',
        '10:00:00',
        '11:00:00',
        '12:00:00',
        '14:00:00',
        '15:00:00',
        '16:00:00',
        '17:00:00',
    ];

    public function run(): void
    {
        $fixtures = Fixture::with('tournament.categories')->orderBy('start_date')->get();
        $referees = Referee::all();
        $teamsByCategory = Team::orderBy('id')->get()->groupBy('id_category');

        if ($fixtures->isEmpty()) {
            $this->command->warn('GameSeeder omitido: no hay fixtures.');

            return;
        }

        // Se usa un cursor por categoría para no repetir los mismos cruces
        // entre fechas distintas.
        $roundCursor = [];
        $gameCounter = 0;

        foreach ($fixtures as $fixtureIndex => $fixture) {
            $categories = $fixture->tournament?->categories ?? collect();

            $categoryIds = [];
            $caps = [];

            foreach ($categories as $category) {
                $teamIds = $teamsByCategory
                    ->get($category->id_category, collect())
                    ->pluck('id')
                    ->all();

                if (count($teamIds) < 2) {
                    continue;
                }

                $categoryIds[] = $category->id_category;
                // Como máximo puede jugar la mitad de los equipos por fecha
                // sin que un equipo repita partido.
                $caps[$category->id_category] = intdiv(count($teamIds), 2);
            }

            if ($categoryIds === []) {
                continue;
            }

            $order = $this->rotate($categoryIds, $fixtureIndex);
            $counts = $this->distributeCounts($categoryIds, $caps, self::GAMES_PER_FIXTURE, $order);
            $total = array_sum($counts);
            $saturdayCounts = $this->splitByDay($counts, $order, min(self::GAMES_PER_DAY, $total));

            $matchesByDay = ['saturday' => [], 'sunday' => []];

            foreach ($counts as $categoryId => $count) {
                if ($count === 0) {
                    continue;
                }

                $teamIds = $teamsByCategory
                    ->get($categoryId, collect())
                    ->pluck('id')
                    ->all();

                $rounds = $this->roundRobinRounds($teamIds);
                $cursor = ($roundCursor[$categoryId] ?? 0) % count($rounds);
                $roundCursor[$categoryId] = ($roundCursor[$categoryId] ?? 0) + 1;

                $matches = array_slice($rounds[$cursor], 0, $count);
                $saturdayCount = $saturdayCounts[$categoryId];

                foreach ($matches as $matchIndex => [$local, $visitor]) {
                    $day = $matchIndex < $saturdayCount ? 'saturday' : 'sunday';
                    $matchesByDay[$day][] = [$categoryId, $local, $visitor];
                }
            }

            foreach (['saturday' => $fixture->start_date, 'sunday' => $fixture->end_date] as $day => $date) {
                foreach ($matchesByDay[$day] as $slot => [$categoryId, $local, $visitor]) {
                    // Árbitro rotativo, dejando algunos partidos sin árbitro
                    // para conservar el caso opcional en los datos de prueba.
                    $refereeId = null;
                    if ($referees->isNotEmpty() && $gameCounter % 7 !== 6) {
                        $refereeId = $referees[$gameCounter % $referees->count()]->id;
                    }

                    Game::firstOrCreate(
                        [
                            'id_tournament' => $fixture->id_tournament,
                            'id_category' => $categoryId,
                            'id_fixture' => $fixture->id,
                            'id_team_local' => $local,
                            'id_team_visitor' => $visitor,
                        ],
                        [
                            'id_referee' => $refereeId,
                            'date' => $date->format('Y-m-d'),
                            'time' => self::TIMES[$slot] ?? self::TIMES[array_key_last(self::TIMES)],
                            'status_game' => 'pending',
                            'set_local' => null,
                            'set_visitor' => null,
                            'result' => 'pending',
                        ]
                    );

                    $gameCounter++;
                }
            }
        }
    }

    /**
     * Reparte la cantidad de partidos entre las categorías de forma rotativa.
     * Con 5 categorías y 16 partidos devuelve 4, 3, 3, 3, 3, cambiando cuál
     * categoría tiene 4 en cada fecha.
     */
    private function distributeCounts(array $categoryIds, array $caps, int $total, array $order): array
    {
        $counts = array_fill_keys($categoryIds, 0);
        $remaining = $total;

        while ($remaining > 0) {
            $assigned = false;

            foreach ($order as $categoryId) {
                if ($remaining === 0) {
                    break;
                }

                if ($counts[$categoryId] >= $caps[$categoryId]) {
                    continue;
                }

                $counts[$categoryId]++;
                $remaining--;
                $assigned = true;
            }

            if (! $assigned) {
                break;
            }
        }

        return $counts;
    }

    /**
     * Determina cuántos partidos de cada categoría van al sábado,
     * garantizando el total diario solicitado.
     */
    private function splitByDay(array $counts, array $order, int $saturdayTotal): array
    {
        $saturdayCounts = [];

        foreach ($counts as $categoryId => $count) {
            $saturdayCounts[$categoryId] = intdiv($count, 2);
        }

        $remaining = $saturdayTotal - array_sum($saturdayCounts);

        // Se priorizan las categorías con cantidad impar para que queden
        // repartidas de la forma más pareja posible entre sábado y domingo.
        foreach ($order as $categoryId) {
            if ($remaining <= 0) {
                break;
            }

            if ($counts[$categoryId] % 2 === 1 && $saturdayCounts[$categoryId] < $counts[$categoryId]) {
                $saturdayCounts[$categoryId]++;
                $remaining--;
            }
        }

        while ($remaining > 0) {
            $assigned = false;

            foreach ($order as $categoryId) {
                if ($remaining === 0) {
                    break;
                }

                if ($saturdayCounts[$categoryId] < $counts[$categoryId]) {
                    $saturdayCounts[$categoryId]++;
                    $remaining--;
                    $assigned = true;
                }
            }

            if (! $assigned) {
                break;
            }
        }

        return $saturdayCounts;
    }

    /**
     * Arma el calendario round-robin de una categoría. Cada ronda tiene
     * cruces en los que ningún equipo se repite.
     */
    private function roundRobinRounds(array $teamIds): array
    {
        $ids = array_values($teamIds);

        if (count($ids) % 2 === 1) {
            $ids[] = null; // Equipo libre (bye).
        }

        $count = count($ids);
        $rounds = [];

        for ($round = 0; $round < $count - 1; $round++) {
            $matches = [];

            for ($i = 0; $i < intdiv($count, 2); $i++) {
                $local = $ids[$i];
                $visitor = $ids[$count - 1 - $i];

                if ($local !== null && $visitor !== null) {
                    $matches[] = [$local, $visitor];
                }
            }

            $rounds[] = $matches;

            // Se fija el primer equipo y se rota el resto.
            $fixed = array_shift($ids);
            $last = array_pop($ids);
            array_unshift($ids, $last);
            array_unshift($ids, $fixed);
        }

        return $rounds;
    }

    /**
     * Rota un arreglo para variar el orden de las categorías en cada fecha.
     */
    private function rotate(array $items, int $offset): array
    {
        if ($items === []) {
            return [];
        }

        $offset %= count($items);

        return array_merge(
            array_slice($items, $offset),
            array_slice($items, 0, $offset)
        );
    }
}
