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

    public function test_cannot_change_tournament_when_fixture_has_games(): void
    {
        $this->actingAs(User::factory()->create());

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
        $this->actingAs(User::factory()->create());

        $fixture = $this->createFixture($this->createTournament());
        $this->createGame($fixture, $this->createTeam('Equipo A'), $this->createTeam('Equipo B'));

        $this->delete("/fixtures/{$fixture->id}")->assertSessionHasErrors();

        $this->assertDatabaseHas('fixtures', ['id' => $fixture->id]);
    }

    public function test_cannot_delete_tournament_with_fixtures(): void
    {
        $this->actingAs(User::factory()->create());

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

        $this->assertCount(2, $fixtures);
        $this->assertNotSame($fixtures[0]->start_date->toDateString(), $fixtures[1]->start_date->toDateString());

        foreach ($fixtures as $fixture) {
            $this->assertSame(Carbon::SATURDAY, $fixture->start_date->dayOfWeek);
            $this->assertSame(Carbon::SUNDAY, $fixture->end_date->dayOfWeek);
            $this->assertTrue($fixture->start_date->copy()->addDay()->isSameDay($fixture->end_date));
        }
    }
}
