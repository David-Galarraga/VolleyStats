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
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ReaderTest extends TestCase
{
    use RefreshDatabase;

    private string $saturday;
    private string $sunday;
    private Category $category;
    private Tournament $tournament;

    protected function setUp(): void
    {
        parent::setUp();

        $this->saturday = Carbon::parse('next saturday')->toDateString();
        $this->sunday = Carbon::parse('next saturday')->addDay()->toDateString();

        $this->category = Category::create([
            'name_category' => 'Sub-18',
            'genero_category' => 'Femenino',
        ]);

        $this->tournament = Tournament::create([
            'name_tournament' => 'Torneo Test',
            'start_date' => $this->saturday,
            'end_date' => $this->sunday,
        ]);

        $this->tournament->categories()->attach($this->category->id_category);
    }

    private function createTeam(string $name): Team
    {
        $delegate = Delegate::create([
            'name_delegate' => 'Delegado Test',
            'phone_delegate' => '2222222222',
            'email_delegate' => 'delegate@example.com',
        ]);

        return Team::create([
            'name_team' => $name,
            'city_team' => 'Córdoba',
            'id_category' => $this->category->id_category,
            'id_delegate' => $delegate->id_delegate,
        ]);
    }

    public function test_guest_can_access_reader(): void
    {
        $this->get('/lector')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Reader/Index'));
    }

    public function test_reader_index_only_shows_standings(): void
    {
        Fixture::create([
            'id_tournament' => $this->tournament->id,
            'name_fixture' => 'Fecha 1',
            'start_date' => $this->saturday,
            'end_date' => $this->sunday,
            'status_fixture' => 'scheduled',
        ]);

        $this->get('/lector')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Reader/Index')
                ->has('combinations')
                ->has('standings')
                ->missing('fixtures'));
    }

    public function test_reader_shows_future_fixtures(): void
    {
        $fixture = Fixture::create([
            'id_tournament' => $this->tournament->id,
            'name_fixture' => 'Fecha 1',
            'start_date' => $this->saturday,
            'end_date' => $this->sunday,
            'status_fixture' => 'scheduled',
        ]);

        $this->get('/lector/fixtures')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Reader/Fixtures')
                ->has('fixtures', 1)
                ->where('fixtures.0.id', $fixture->id));
    }

    public function test_reader_fixtures_excludes_past_fixtures(): void
    {
        Fixture::create([
            'id_tournament' => $this->tournament->id,
            'name_fixture' => 'Fecha pasada',
            'start_date' => Carbon::parse('last saturday')->toDateString(),
            'end_date' => Carbon::parse('last saturday')->addDay()->toDateString(),
            'status_fixture' => 'scheduled',
        ]);

        $this->get('/lector/fixtures')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Reader/Fixtures')
                ->has('fixtures', 0));
    }

    public function test_guest_can_view_fixture_detail(): void
    {
        $fixture = Fixture::create([
            'id_tournament' => $this->tournament->id,
            'name_fixture' => 'Fecha 1',
            'start_date' => $this->saturday,
            'end_date' => $this->sunday,
            'status_fixture' => 'scheduled',
        ]);

        $this->get("/lector/fixtures/{$fixture->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Reader/FixtureShow'));
    }

    public function test_guest_cannot_access_admin_areas(): void
    {
        $this->get('/teams')->assertRedirect(route('login'));
        $this->get('/fixtures')->assertRedirect(route('login'));
        $this->get('/users')->assertRedirect(route('login'));
    }
}
