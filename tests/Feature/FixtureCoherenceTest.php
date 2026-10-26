<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Delegate;
use App\Models\Fixture;
use App\Models\Game;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\User;
use Carbon\Carbon;
use Database\Seeders\FixtureSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FixtureCoherenceTest extends TestCase
{
    use RefreshDatabase;

    private string $saturday;
    private string $sunday;

    protected function setUp(): void
    {
        parent::setUp();

        $this->saturday = Carbon::parse('next saturday')->toDateString();
        $this->sunday = Carbon::parse('next saturday')->addDay()->toDateString();
    }

    private function createTeam(string $name): Team
    {
        $category = Category::create([
            'name_category' => 'Sub-18 '.$name,
            'genero_category' => 'Femenino',
        ]);

        $delegate = Delegate::create([
            'name_delegate' => 'Delegado '.$name,
            'phone_delegate' => '2222222222',
            'email_delegate' => strtolower(preg_replace('/\s+/', '', $name)).'@example.com',
        ]);

        return Team::create([
            'name_team' => $name,
            'city_team' => 'Córdoba',
            'id_category' => $category->id_category,
            'id_delegate' => $delegate->id_delegate,
        ]);
    }

    private function createTournament(): Tournament
    {
        return Tournament::create([
            'name_tournament' => 'Torneo Test',
            'start_date' => $this->saturday,
            'end_date' => $this->sunday,
        ]);
    }

    private function createFixture(Tournament $tournament): Fixture
    {
        return Fixture::create([
            'id_tournament' => $tournament->id,
            'name_fixture' => 'Fecha 1',
            'start_date' => $this->saturday,
            'end_date' => $this->sunday,
            'status_fixture' => 'scheduled',
        ]);
    }

    private function createGame(Fixture $fixture, Team $local, Team $visitor): Game
    {
        return Game::create([
            'id_tournament' => $fixture->id_tournament,
            'id_fixture' => $fixture->id,
            'id_team_local' => $local->id,
            'id_team_visitor' => $visitor->id,
            'date' => $this->saturday,
            'time' => '16:00:00',
        ]);
    }

    public function test_guests_cannot_access_fixtures(): void
    {
        $this->get('/fixtures')->assertRedirect('/login');
        $this->post('/fixtures', [])->assertRedirect('/login');
    }

    public function test_fixture_name_is_generated_sequentially(): void
    {
        $this->actingAs(User::factory()->admin()->create());

        $tournament = $this->createTournament();
        $this->createFixture($tournament); // existing "Fecha 1"

        $payload = [
            'id_tournament' => $tournament->id,
            'name_fixture' => 'Nombre manual ignorado',
            'start_date' => $this->saturday,
            'end_date' => $this->sunday,
            'status_fixture' => 'scheduled',
        ];

        $this->post('/fixtures', $payload)->assertRedirect(route('fixtures.index'));
        $this->assertDatabaseHas('fixtures', [
            'id_tournament' => $tournament->id,
            'name_fixture' => 'Fecha 2',
        ]);

        $this->post('/fixtures', $payload)->assertRedirect(route('fixtures.index'));
        $this->assertDatabaseHas('fixtures', [
            'id_tournament' => $tournament->id,
            'name_fixture' => 'Fecha 3',
        ]);

        $other = Tournament::create([
            'name_tournament' => 'Otro Torneo',
            'start_date' => $this->saturday,
            'end_date' => $this->sunday,
        ]);

        $this->post('/fixtures', [
            'id_tournament' => $other->id,
            'start_date' => $this->saturday,
            'end_date' => $this->sunday,
            'status_fixture' => 'scheduled',
        ])->assertRedirect(route('fixtures.index'));

        $this->assertDatabaseHas('fixtures', [
            'id_tournament' => $other->id,
            'name_fixture' => 'Fecha 1',
        ]);
    }

    public function test_cannot_change_tournament_when_fixture_has_games(): void
    {
        $this->actingAs(User::factory()->admin()->create());

        $tournament = $this->createTournament();
        $other = Tournament::create([
            'name_tournament' => 'Otro Torneo',
            'start_date' => $this->saturday,
            'end_date' => $this->sunday,
        ]);
        $fixture = $this->createFixture($tournament);
        $this->createGame($fixture, $this->createTeam('Equipo A'), $this->createTeam('Equipo B'));

        $this->put("/fixtures/{$fixture->id}", [
            'id_tournament' => $other->id,
            'name_fixture' => 'Fecha 1',
            'start_date' => $this->saturday,
            'end_date' => $this->sunday,
        ])->assertSessionHasErrors('id_tournament');

        $this->assertSame($tournament->id, $fixture->fresh()->id_tournament);
    }

    public function test_cannot_delete_fixture_with_games(): void
    {
        $this->actingAs(User::factory()->admin()->create());

        $fixture = $this->createFixture($this->createTournament());
        $this->createGame($fixture, $this->createTeam('Equipo A'), $this->createTeam('Equipo B'));

        $this->delete("/fixtures/{$fixture->id}")->assertSessionHasErrors();

        $this->assertDatabaseHas('fixtures', ['id' => $fixture->id]);
    }

    public function test_cannot_delete_tournament_with_fixtures(): void
    {
        $this->actingAs(User::factory()->admin()->create());

        $tournament = $this->createTournament();
        $this->createFixture($tournament);

        $this->delete("/tournaments/{$tournament->id}")->assertSessionHasErrors();

        $this->assertDatabaseHas('tournaments', ['id' => $tournament->id]);
    }

    public function test_fixture_seeder_generates_valid_weekends(): void
    {
        $tournament = Tournament::create([
            'name_tournament' => 'Apertura 2026',
            'start_date' => '2026-03-01',
            'end_date' => '2026-06-30',
        ]);

        (new FixtureSeeder)->run();

        $fixtures = Fixture::where('id_tournament', $tournament->id)->orderBy('start_date')->get();

        $this->assertCount(5, $fixtures);
        $this->assertSame(
            ['Fecha 1', 'Fecha 2', 'Fecha 3', 'Fecha 4', 'Fecha 5'],
            $fixtures->pluck('name_fixture')->all()
        );

        foreach ($fixtures as $fixture) {
            $this->assertSame(Carbon::SATURDAY, $fixture->start_date->dayOfWeek);
            $this->assertSame(Carbon::SUNDAY, $fixture->end_date->dayOfWeek);
            $this->assertTrue($fixture->start_date->copy()->addDay()->isSameDay($fixture->end_date));
        }

        for ($i = 1; $i < $fixtures->count(); $i++) {
            $this->assertTrue(
                $fixtures[$i - 1]->start_date->copy()->addWeek()->isSameDay($fixtures[$i]->start_date),
                'Las fechas deben ser sábados consecutivos.'
            );
        }
    }

    public function test_game_seeder_generates_sixteen_games_per_fixture(): void
    {
        $this->seed();

        $fixtures = Fixture::orderBy('start_date')->get();

        $this->assertCount(5, $fixtures);

        $totalGames = 0;
        $featuredCategories = [];

        foreach ($fixtures as $fixture) {
            $games = $fixture->games()->get();

            $this->assertCount(16, $games);

            $saturday = $games->filter(
                fn (Game $game) => $game->date->isSameDay($fixture->start_date)
            );
            $sunday = $games->filter(
                fn (Game $game) => $game->date->isSameDay($fixture->end_date)
            );

            $this->assertCount(8, $saturday, 'La fecha debe tener 8 partidos el sábado.');
            $this->assertCount(8, $sunday, 'La fecha debe tener 8 partidos el domingo.');

            // Ningún equipo debe jugar dos veces en la misma fecha.
            $teamIds = $games->flatMap(
                fn (Game $game) => [$game->id_team_local, $game->id_team_visitor]
            );
            $this->assertCount(
                $teamIds->count(),
                $teamIds->unique(),
                'Un equipo no debe repetir partido en la misma fecha.'
            );

            // Tampoco se debe repetir el mismo cruce dentro de la fecha.
            $pairings = $games->map(
                fn (Game $game) => implode('-', [
                    $game->id_category,
                    min($game->id_team_local, $game->id_team_visitor),
                    max($game->id_team_local, $game->id_team_visitor),
                ])
            );
            $this->assertCount(
                $pairings->count(),
                $pairings->unique(),
                'No se debe repetir un cruce dentro de la misma fecha.'
            );

            // Cada fecha debe usar las 5 categorías repartidas 4/3/3/3/3.
            $perCategory = $games->groupBy('id_category')->map->count();

            $this->assertCount(5, $perCategory, 'Todas las categorías deben jugar en cada fecha.');
            $this->assertSame(
                [3, 3, 3, 3, 4],
                $perCategory->sort()->values()->all(),
                'La fecha debe repartir 16 partidos como 4/3/3/3/3 entre las categorías.'
            );

            $featuredCategories[] = $perCategory
                ->filter(fn (int $count) => $count === 4)
                ->keys()
                ->first();

            $totalGames += $games->count();
        }

        $this->assertSame(80, $totalGames);

        $this->assertCount(
            5,
            array_unique($featuredCategories),
            'La categoría con 4 partidos debe rotar en cada fecha.'
        );
    }
}
