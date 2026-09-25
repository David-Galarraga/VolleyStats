<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Delegate;
use App\Models\Fixture;
use App\Models\Referee;
use App\Models\Team;
use App\Models\TeamAvailability;
use App\Models\Tournament;
use App\Models\Trainer;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GameAvailabilityTest extends TestCase
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
            'name_category' => 'Sub-18',
            'genero_category' => 'Femenino',
        ]);

        $trainer = Trainer::create([
            'name_trainer' => 'Entrenador Test',
            'phone_trainer' => '1111111111',
            'email_trainer' => 'trainer@example.com',
        ]);

        $delegate = Delegate::create([
            'name_delegate' => 'Delegado Test',
            'phone_delegate' => '2222222222',
            'email_delegate' => 'delegate@example.com',
        ]);

        return Team::create([
            'name_team' => $name,
            'city_team' => 'Córdoba',
            'id_category' => $category->id_category,
            'id_trainer' => $trainer->id_trainer,
            'id_delegate' => $delegate->id_delegate,
        ]);
    }

    private function createReferee(): Referee
    {
        return Referee::create([
            'name_referee' => 'Árbitro Test',
            'email_referee' => 'referee@example.com',
            'phone_referee' => '3333333333',
        ]);
    }

    private function createFixture(): Fixture
    {
        $category = Category::create([
            'name_category' => 'Sub-18',
            'genero_category' => 'Femenino',
        ]);

        $tournament = Tournament::create([
            'id_category' => $category->id_category,
            'name_tournament' => 'Torneo Test',
            'start_date' => $this->saturday,
            'end_date' => $this->sunday,
        ]);

        return Fixture::create([
            'id_tournament' => $tournament->id,
            'name_fixture' => 'Fecha 1',
            'start_date' => $this->saturday,
            'end_date' => $this->sunday,
            'status_fixture' => 'scheduled',
        ]);
    }

    private function addAvailability(Fixture $fixture, Team $team, string $start, string $end, string $date): void
    {
        TeamAvailability::create([
            'id_fixture' => $fixture->id,
            'id_team' => $team->id,
            'date' => $date,
            'start_time' => $start,
            'end_time' => $end,
        ]);
    }

    private function postGame(Fixture $fixture, Team $local, Team $visitor, Referee $referee, string $time): \Illuminate\Testing\TestResponse
    {
        return $this->post('/games', [
            'id_tournament' => $fixture->id_tournament,
            'id_fixture' => $fixture->id,
            'id_team_local' => $local->id,
            'id_team_visitor' => $visitor->id,
            'id_referee' => $referee->id,
            'date' => $this->saturday,
            'time' => $time,
        ]);
    }

    public function test_store_rejects_visitor_without_overlap(): void
    {
        $fixture = $this->createFixture();
        $local = $this->createTeam('Equipo A');
        $visitor = $this->createTeam('Equipo B');
        $referee = $this->createReferee();

        $this->addAvailability($fixture, $local, '14:00', '17:00', $this->saturday);
        $this->addAvailability($fixture, $visitor, '10:00', '12:00', $this->saturday);

        $this->postGame($fixture, $local, $visitor, $referee, '15:00')
            ->assertSessionHasErrors('id_team_visitor');
    }

    public function test_store_rejects_local_without_availability(): void
    {
        $fixture = $this->createFixture();
        $local = $this->createTeam('Equipo A');
        $visitor = $this->createTeam('Equipo B');
        $referee = $this->createReferee();

        $this->addAvailability($fixture, $visitor, '10:00', '18:00', $this->saturday);

        $this->postGame($fixture, $local, $visitor, $referee, '15:00')
            ->assertSessionHasErrors('id_team_local');
    }

    public function test_store_rejects_time_outside_overlap(): void
    {
        $fixture = $this->createFixture();
        $local = $this->createTeam('Equipo A');
        $visitor = $this->createTeam('Equipo B');
        $referee = $this->createReferee();

        $this->addAvailability($fixture, $local, '14:00', '17:00', $this->saturday);
        $this->addAvailability($fixture, $visitor, '16:00', '19:00', $this->saturday);

        $this->postGame($fixture, $local, $visitor, $referee, '14:30')
            ->assertSessionHasErrors('id_team_visitor');
    }

    public function test_store_accepts_overlapping_teams(): void
    {
        $fixture = $this->createFixture();
        $local = $this->createTeam('Equipo A');
        $visitor = $this->createTeam('Equipo B');
        $referee = $this->createReferee();

        $this->addAvailability($fixture, $local, '14:00', '17:00', $this->saturday);
        $this->addAvailability($fixture, $visitor, '16:00', '19:00', $this->saturday);

        $this->postGame($fixture, $local, $visitor, $referee, '16:30')
            ->assertRedirect(route('fixtures.show', $fixture));

        $this->assertDatabaseHas('games', [
            'id_team_local' => $local->id,
            'id_team_visitor' => $visitor->id,
        ]);
    }
}
