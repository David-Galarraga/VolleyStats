<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Delegate;
use App\Models\Game;
use App\Models\Player;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MatchRosterTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private string $date;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->actingAs($this->user);

        $this->date = Carbon::parse('next saturday')->toDateString();
    }

    private function createTeam(string $name): Team
    {
        $category = Category::create([
            'name_category' => 'Sub-18',
            'genero_category' => 'Femenino',
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
            'id_delegate' => $delegate->id_delegate,
        ]);
    }

    private function createPlayer(Team $team, string $name, string $dni): Player
    {
        return Player::create([
            'id_team' => $team->id,
            'name_player' => $name,
            'dni_player' => $dni,
            'birthdate_player' => '2008-05-12',
        ]);
    }

    private function createGame(Team $local, Team $visitor, ?string $date = null, string $time = '15:00'): Game
    {
        $date = $date ?? $this->date;

        $tournament = Tournament::create([
            'name_tournament' => 'Torneo Test',
            'start_date' => $date,
            'end_date' => Carbon::parse($date)->addDay()->toDateString(),
        ]);

        return Game::create([
            'id_tournament' => $tournament->id,
            'id_fixture' => null,
            'id_team_local' => $local->id,
            'id_team_visitor' => $visitor->id,
            'id_referee' => null,
            'date' => $date,
            'time' => $time,
            'status_game' => 'pending',
        ]);
    }

    private function scenario(): array
    {
        $local = $this->createTeam('Equipo A');
        $visitor = $this->createTeam('Equipo B');

        $localPlayer = $this->createPlayer($local, 'Ana Pérez', '12345678');
        $localPlayerTwo = $this->createPlayer($local, 'Marta Ruiz', '22334455');
        $visitorPlayer = $this->createPlayer($visitor, 'Lucía Gómez', '87654321');

        $game = $this->createGame($local, $visitor);

        return [$game, $local, $visitor, $localPlayer, $localPlayerTwo, $visitorPlayer];
    }

    public function test_edit_renders_only_team_players(): void
    {
        [$game, $local, $visitor, $localPlayer, $localPlayerTwo, $visitorPlayer] = $this->scenario();

        $this->get("/games/{$game->id}/lista/{$local->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Games/Roster')
                ->where('team.id', $local->id)
                ->where('isLocked', false)
                ->where('submittedAt', null)
                ->has('players', 2)
                ->where('players.0.player_id', $localPlayer->id)
                ->where('players.1.player_id', $localPlayerTwo->id));
    }

    public function test_edit_returns_404_for_team_not_in_game(): void
    {
        [$game, $local, $visitor] = $this->scenario();

        $outsiderTeam = $this->createTeam('Equipo C');

        $this->get("/games/{$game->id}/lista/{$outsiderTeam->id}")
            ->assertNotFound();
    }

    public function test_update_stores_roster_snapshot(): void
    {
        [$game, $local, $visitor, $localPlayer, $localPlayerTwo] = $this->scenario();

        $this->put("/games/{$game->id}/lista/{$local->id}", [
            'players' => [$localPlayer->id, $localPlayerTwo->id],
        ])->assertRedirect(route('games.show', $game));

        $this->assertDatabaseHas('match_rosters', [
            'game_id' => $game->id,
            'team_id' => $local->id,
            'submitted_by' => $this->user->id_user,
        ]);

        $this->assertDatabaseHas('match_roster_players', [
            'player_id' => $localPlayer->id,
            'team_id' => $local->id,
            'name_player' => 'Ana Pérez',
            'dni_player' => '12345678',
        ]);

        $this->assertDatabaseCount('match_roster_players', 2);
    }

    public function test_update_rejects_player_from_another_team(): void
    {
        [$game, $local, $visitor, $localPlayer, $localPlayerTwo, $visitorPlayer] = $this->scenario();

        $this->put("/games/{$game->id}/lista/{$local->id}", [
            'players' => [$visitorPlayer->id],
        ])->assertSessionHasErrors('players');

        $this->assertDatabaseCount('match_rosters', 0);
        $this->assertDatabaseCount('match_roster_players', 0);
    }

    public function test_update_replaces_previous_selection(): void
    {
        [$game, $local, $visitor, $localPlayer, $localPlayerTwo] = $this->scenario();

        $this->put("/games/{$game->id}/lista/{$local->id}", [
            'players' => [$localPlayer->id, $localPlayerTwo->id],
        ]);

        $this->put("/games/{$game->id}/lista/{$local->id}", [
            'players' => [$localPlayer->id],
        ]);

        $this->assertDatabaseCount('match_rosters', 1);
        $this->assertDatabaseCount('match_roster_players', 1);
        $this->assertDatabaseHas('match_roster_players', [
            'player_id' => $localPlayer->id,
        ]);
    }

    public function test_update_is_forbidden_after_game_starts(): void
    {
        [$game, $local, $visitor, $localPlayer] = $this->scenario();

        $game->update([
            'date' => Carbon::parse('-1 day')->toDateString(),
            'time' => '15:00',
        ]);

        $this->put("/games/{$game->id}/lista/{$local->id}", [
            'players' => [$localPlayer->id],
        ])->assertForbidden();

        $this->assertDatabaseCount('match_rosters', 0);
    }
}
