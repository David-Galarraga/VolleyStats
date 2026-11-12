<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Delegate;
use App\Models\Fixture;
use App\Models\Game;
use App\Models\PlayoffBracket;
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

    public function test_reader_playoff_bracket_is_null_when_not_configured(): void
    {
        $this->get('/lector')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Reader/Index')
                ->where('playoffBracket', null));
    }

    public function test_reader_exposes_playoff_bracket_to_guests(): void
    {
        $teamA = $this->createTeam('Equipo A');
        $teamB = $this->createTeam('Equipo B');

        $bracket = PlayoffBracket::create([
            'tournament_id' => $this->tournament->id,
            'category_id' => $this->category->id_category,
        ]);

        $bracket->matches()->create([
            'tournament_id' => $this->tournament->id,
            'code' => 'C1',
            'stage' => 'Semifinal',
            'cup' => 'gold',
            'team_a_id' => $teamA->id,
            'team_b_id' => $teamB->id,
        ]);

        $this->get('/lector')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Reader/Index')
                ->where('playoffBracket.id', $bracket->id)
                ->has('playoffBracket.matches', 1)
                ->where('playoffBracket.matches.0.code', 'C1')
                ->where('playoffBracket.matches.0.stage', 'Semifinal')
                ->where('playoffBracket.matches.0.cup', 'gold')
                ->where('playoffBracket.matches.0.team_a', 'Equipo A')
                ->where('playoffBracket.matches.0.team_b', 'Equipo B'));
    }

    public function test_reader_resolves_playoff_winner_into_next_crossing(): void
    {
        $teamA = $this->createTeam('Equipo A');
        $teamB = $this->createTeam('Equipo B');
        $teamC = $this->createTeam('Equipo C');

        $bracket = PlayoffBracket::create([
            'tournament_id' => $this->tournament->id,
            'category_id' => $this->category->id_category,
        ]);

        $semi = $bracket->matches()->create([
            'tournament_id' => $this->tournament->id,
            'code' => 'S1',
            'stage' => 'Semifinal',
            'cup' => 'gold',
            'team_a_id' => $teamA->id,
            'team_b_id' => $teamB->id,
        ]);

        $game = Game::create([
            'id_tournament' => $this->tournament->id,
            'id_category' => $this->category->id_category,
            'id_fixture' => null,
            'id_team_local' => $teamA->id,
            'id_team_visitor' => $teamB->id,
            'id_referee' => null,
            'date' => $this->saturday,
            'time' => '15:00',
            'status_game' => 'finished',
            'phase' => 'playoff',
            'phase_instance' => 'Semifinal',
        ]);
        $game->matchResult()->create([
            'sets_local' => 2,
            'sets_visitor' => 0,
            'set_1_points_local' => 25,
            'set_1_points_visitor' => 20,
            'set_2_points_local' => 25,
            'set_2_points_visitor' => 18,
        ]);
        $semi->update(['game_id' => $game->id]);

        $bracket->matches()->create([
            'tournament_id' => $this->tournament->id,
            'code' => 'F1',
            'stage' => 'Final',
            'cup' => 'gold',
            'team_b_id' => $teamC->id,
            'source_a_type' => 'winner',
            'source_a_match_id' => $semi->id,
        ]);

        $this->get('/lector')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Reader/Index')
                ->has('playoffBracket.matches', 2)
                ->where('playoffBracket.matches.0.winner_side', 'a')
                ->where('playoffBracket.matches.1.team_a', 'Equipo A')
                ->where('playoffBracket.matches.1.source_a_code', 'S1')
                ->where('playoffBracket.matches.1.team_b', 'Equipo C'));
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
