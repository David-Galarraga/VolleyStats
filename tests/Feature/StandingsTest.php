<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Delegate;
use App\Models\Game;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class StandingsTest extends TestCase
{
    use RefreshDatabase;

    private string $date;

    protected function setUp(): void
    {
        parent::setUp();

        $this->actingAs(User::factory()->create());

        $this->date = Carbon::parse('next saturday')->toDateString();
    }

    private function createTournamentCategory(): array
    {
        $category = Category::create([
            'name_category' => 'Sub-18',
            'genero_category' => 'Femenino',
        ]);

        $tournament = Tournament::create([
            'name_tournament' => 'Torneo Test',
            'start_date' => $this->date,
            'end_date' => Carbon::parse($this->date)->addDay()->toDateString(),
        ]);

        $tournament->categories()->attach($category->id_category);

        return [$tournament, $category];
    }

    private function createTeam(Category $category, string $name): Team
    {
        $delegate = Delegate::create([
            'name_delegate' => 'Delegado Test',
            'phone_delegate' => '2222222222',
            'email_delegate' => 'delegate@example.com',
        ]);

        return Team::create([
            'name_team' => $name,
            'city_team' => 'Córdoba',
            'id_category' => $category->id_category,
            'id_delegate' => $delegate->id_delegate,
        ]);
    }

    private function createGame(Tournament $tournament, Team $local, Team $visitor, string $status): Game
    {
        return Game::create([
            'id_tournament' => $tournament->id,
            'id_category' => $local->id_category,
            'id_fixture' => null,
            'id_team_local' => $local->id,
            'id_team_visitor' => $visitor->id,
            'id_referee' => null,
            'date' => $this->date,
            'time' => '15:00',
            'status_game' => $status,
        ]);
    }

    private function recordResult(Game $game, int $setsLocal, int $setsVisitor): void
    {
        $game->matchResult()->create([
            'sets_local' => $setsLocal,
            'sets_visitor' => $setsVisitor,
            'set_1_points_local' => $setsLocal > $setsVisitor ? 25 : 20,
            'set_1_points_visitor' => $setsLocal > $setsVisitor ? 20 : 25,
            'set_2_points_local' => $setsLocal > $setsVisitor ? 25 : 18,
            'set_2_points_visitor' => $setsLocal > $setsVisitor ? 18 : 25,
        ]);
    }

    public function test_standings_only_count_finished_games(): void
    {
        [$tournament, $category] = $this->createTournamentCategory();
        $local = $this->createTeam($category, 'Equipo A');
        $visitor = $this->createTeam($category, 'Equipo B');

        $finished = $this->createGame($tournament, $local, $visitor, 'finished');
        $this->recordResult($finished, 2, 0);

        $pending = $this->createGame($tournament, $visitor, $local, 'pending');
        $this->recordResult($pending, 2, 0);

        $response = $this->get('/standings')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Standings/Index')
                ->has('standings', 2)
                ->where('standings.0.team_name', 'Equipo A')
                ->where('standings.0.matches_played', 1)
                ->where('standings.0.matches_won', 1)
                ->where('standings.0.classification_points', 3)
                ->where('standings.1.team_name', 'Equipo B')
                ->where('standings.1.matches_played', 1)
                ->where('standings.1.matches_lost', 1)
                ->where('standings.1.classification_points', 0));
    }

    public function test_standings_ignore_games_without_result(): void
    {
        [$tournament, $category] = $this->createTournamentCategory();
        $local = $this->createTeam($category, 'Equipo A');
        $visitor = $this->createTeam($category, 'Equipo B');

        $this->createGame($tournament, $local, $visitor, 'finished');

        $this->get('/standings')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('standings', 2)
                ->where('standings.0.matches_played', 0)
                ->where('standings.0.classification_points', 0));
    }

    public function test_saving_a_result_does_not_finish_the_game(): void
    {
        [$tournament, $category] = $this->createTournamentCategory();
        $local = $this->createTeam($category, 'Equipo A');
        $visitor = $this->createTeam($category, 'Equipo B');

        $game = $this->createGame($tournament, $local, $visitor, 'pending');

        $this->put("/games/{$game->id}/result", [
            'sets_local' => 2,
            'sets_visitor' => 0,
            'set_1_points_local' => 25,
            'set_1_points_visitor' => 20,
            'set_2_points_local' => 25,
            'set_2_points_visitor' => 18,
        ])->assertRedirect(route('games.show', $game));

        $this->assertDatabaseHas('games', [
            'id' => $game->id,
            'status_game' => 'pending',
        ]);
    }
}
