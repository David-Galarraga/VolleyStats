<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Delegate;
use App\Models\Fixture;
use App\Models\Team;
use App\Models\TeamAvailability;
use App\Models\Tournament;
use App\Models\Trainer;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TeamAvailabilityTest extends TestCase
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

    private function createTeam(string $name = 'Equipo Test'): Team
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

    public function test_index_renders_availability_page(): void
    {
        $fixture = $this->createFixture();

        $this->get("/fixtures/{$fixture->id}/availabilities")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Fixtures/Availabilities')
                ->has('teams')
                ->has('availabilities'));
    }

    public function test_store_creates_an_availability(): void
    {
        $fixture = $this->createFixture();
        $team = $this->createTeam();

        $this->post("/fixtures/{$fixture->id}/availabilities", [
            'id_team' => $team->id,
            'date' => $this->saturday,
            'start_time' => '14:00',
            'end_time' => '17:00',
        ])->assertRedirect(route('fixtures.availabilities.index', $fixture));

        $this->assertDatabaseHas('team_availabilities', [
            'id_fixture' => $fixture->id,
            'id_team' => $team->id,
            'start_time' => '14:00',
            'end_time' => '17:00',
        ]);
    }

    public function test_store_rejects_date_outside_fixture(): void
    {
        $fixture = $this->createFixture();
        $team = $this->createTeam();

        $this->post("/fixtures/{$fixture->id}/availabilities", [
            'id_team' => $team->id,
            'date' => Carbon::parse('next saturday')->addDays(3)->toDateString(),
            'start_time' => '14:00',
            'end_time' => '17:00',
        ])->assertSessionHasErrors('date');
    }

    public function test_store_rejects_end_time_before_start(): void
    {
        $fixture = $this->createFixture();
        $team = $this->createTeam();

        $this->post("/fixtures/{$fixture->id}/availabilities", [
            'id_team' => $team->id,
            'date' => $this->saturday,
            'start_time' => '17:00',
            'end_time' => '14:00',
        ])->assertSessionHasErrors('end_time');
    }

    public function test_store_rejects_duplicate_window(): void
    {
        $fixture = $this->createFixture();
        $team = $this->createTeam();

        $payload = [
            'id_team' => $team->id,
            'date' => $this->saturday,
            'start_time' => '14:00',
            'end_time' => '17:00',
        ];

        $this->post("/fixtures/{$fixture->id}/availabilities", $payload)
            ->assertRedirect();

        $this->post("/fixtures/{$fixture->id}/availabilities", $payload)
            ->assertSessionHasErrors('id_team');
    }

    public function test_update_modifies_availability(): void
    {
        $fixture = $this->createFixture();
        $team = $this->createTeam();

        $availability = TeamAvailability::create([
            'id_fixture' => $fixture->id,
            'id_team' => $team->id,
            'date' => $this->saturday,
            'start_time' => '14:00',
            'end_time' => '17:00',
        ]);

        $this->put("/availabilities/{$availability->id}", [
            'id_team' => $team->id,
            'date' => $this->saturday,
            'start_time' => '15:00',
            'end_time' => '18:00',
        ])->assertRedirect(route('fixtures.availabilities.index', $fixture));

        $this->assertDatabaseHas('team_availabilities', [
            'id' => $availability->id,
            'start_time' => '15:00',
            'end_time' => '18:00',
        ]);
    }

    public function test_destroy_deletes_availability(): void
    {
        $fixture = $this->createFixture();
        $team = $this->createTeam();

        $availability = TeamAvailability::create([
            'id_fixture' => $fixture->id,
            'id_team' => $team->id,
            'date' => $this->saturday,
            'start_time' => '14:00',
            'end_time' => '17:00',
        ]);

        $this->delete("/availabilities/{$availability->id}")
            ->assertRedirect(route('fixtures.availabilities.index', $fixture));

        $this->assertDatabaseMissing('team_availabilities', [
            'id' => $availability->id,
        ]);
    }
}
