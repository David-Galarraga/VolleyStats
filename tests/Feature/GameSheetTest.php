<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Delegate;
use App\Models\Game;
use App\Models\MatchRoster;
use App\Models\Player;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class GameSheetTest extends TestCase
{
    use RefreshDatabase;

    private string $date;

    protected function setUp(): void
    {
        parent::setUp();

        $this->actingAs(User::factory()->admin()->create());

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

    private function createGame(Team $local, Team $visitor): Game
    {
        $tournament = Tournament::create([
            'name_tournament' => 'Torneo Test',
            'start_date' => $this->date,
            'end_date' => Carbon::parse($this->date)->addDay()->toDateString(),
        ]);

        return Game::create([
            'id_tournament' => $tournament->id,
            'id_fixture' => null,
            'id_team_local' => $local->id,
            'id_team_visitor' => $visitor->id,
            'id_referee' => null,
            'date' => $this->date,
            'time' => '15:00',
            'status_game' => 'pending',
        ]);
    }

    private function submitRoster(Game $game, Team $team, array $players): void
    {
        $roster = MatchRoster::create([
            'game_id' => $game->id,
            'team_id' => $team->id,
            'submitted_by' => null,
            'submitted_at' => now(),
        ]);

        foreach ($players as $player) {
            $roster->players()->create([
                'player_id' => $player->id,
                'team_id' => $team->id,
                'name_player' => $player->name_player,
                'dni_player' => $player->dni_player,
            ]);
        }
    }

    private function scenario(bool $withRosters = true): array
    {
        $local = $this->createTeam('Equipo A');
        $visitor = $this->createTeam('Equipo B');

        $localPlayer = $this->createPlayer($local, 'Ana Pérez', '12345678');
        $visitorPlayer = $this->createPlayer($visitor, 'Lucía Gómez', '87654321');

        $game = $this->createGame($local, $visitor);

        if ($withRosters) {
            $this->submitRoster($game, $local, [$localPlayer]);
            $this->submitRoster($game, $visitor, [$visitorPlayer]);
        }

        return [$game, $local, $visitor, $localPlayer, $visitorPlayer];
    }

    public function test_show_renders_scoresheet_with_both_rosters(): void
    {
        [$game, $local, $visitor, $localPlayer, $visitorPlayer] = $this->scenario();

        $this->get("/games/{$game->id}/planilla")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Games/Scoresheet')
                ->where('game.id', $game->id)
                ->where('sheet', null)
                ->has('localPlayers', 1)
                ->has('visitorPlayers', 1)
                ->where('localPlayers.0.player_id', $localPlayer->id)
                ->where('visitorPlayers.0.player_id', $visitorPlayer->id));
    }

    public function test_summary_displays_playoff_instance_and_sheet_officials(): void
    {
        [$game] = $this->scenario();
        $game->update(['phase' => 'playoff', 'phase_instance' => 'Semifinal', 'set_format' => 'best_of_5']);
        $game->sheet()->create(['referee_name' => 'Árbitra Test', 'scorekeeper_name' => 'Planillero Test', 'venue' => 'Cancha Central']);

        $this->get("/games/{$game->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Games/Show')
                ->where('game.phase', 'playoff')
                ->where('game.phase_instance', 'Semifinal')
                ->where('game.sheet.venue', 'Cancha Central')
                ->where('game.sheet.referee_name', 'Árbitra Test')
                ->where('game.sheet.scorekeeper_name', 'Planillero Test'));
    }

    public function test_best_of_five_result_is_saved_and_nonplayed_sets_are_rejected(): void
    {
        [$game] = $this->scenario();
        $game->update(['phase' => 'playoff', 'phase_instance' => 'Final', 'set_format' => 'best_of_5']);
        $result = [
            'sets_local' => 3, 'sets_visitor' => 2,
            'set_1_points_local' => 25, 'set_1_points_visitor' => 20,
            'set_2_points_local' => 20, 'set_2_points_visitor' => 25,
            'set_3_points_local' => 25, 'set_3_points_visitor' => 18,
            'set_4_points_local' => 22, 'set_4_points_visitor' => 25,
            'set_5_points_local' => 15, 'set_5_points_visitor' => 13,
        ];

        $this->put("/games/{$game->id}/result", $result)->assertRedirect(route('games.sheet.show', $game));
        $this->assertDatabaseHas('results', ['game_id' => $game->id, 'sets_local' => 3, 'sets_visitor' => 2, 'set_5_points_local' => 15]);

        $inconsistent = $result;
        $inconsistent['set_5_points_local'] = 13;
        $inconsistent['set_5_points_visitor'] = 15;
        $this->put("/games/{$game->id}/result", $inconsistent)->assertSessionHasErrors('sets_local');

        $result['sets_local'] = 3;
        $result['sets_visitor'] = 0;
        $result['set_4_points_local'] = 20;
        $result['set_4_points_visitor'] = 18;
        $this->put("/games/{$game->id}/result", $result)->assertSessionHasErrors('set_4_points_local');
    }

    public function test_update_creates_sheet_with_snapshot_and_attendance(): void
    {
        [$game, $local, $visitor, $localPlayer, $visitorPlayer] = $this->scenario();

        $this->put("/games/{$game->id}/planilla", [
            'venue' => 'Polideportivo Central',
            'observations' => 'Partido demorado 10 minutos.',
            'players' => [
                [
                    'player_id' => $localPlayer->id,
                    'present' => true,
                ],
                [
                    'player_id' => $visitorPlayer->id,
                    'present' => false,
                ],
            ],
        ])->assertRedirect(route('games.sheet.show', $game));

        $this->assertDatabaseHas('game_sheets', [
            'game_id' => $game->id,
            'venue' => 'Polideportivo Central',
            'status_sheet' => 'draft',
        ]);

        $this->assertDatabaseHas('game_sheet_players', [
            'player_id' => $localPlayer->id,
            'team_id' => $local->id,
            'name_player' => 'Ana Pérez',
            'dni_player' => '12345678',
            'present' => true,
        ]);

        $this->assertDatabaseHas('game_sheet_players', [
            'player_id' => $visitorPlayer->id,
            'team_id' => $visitor->id,
            'present' => false,
        ]);
    }

    public function test_update_rejects_player_from_another_team(): void
    {
        [$game, $local, $visitor, $localPlayer, $visitorPlayer] = $this->scenario();

        $outsiderTeam = $this->createTeam('Equipo C');
        $outsider = $this->createPlayer($outsiderTeam, 'Intrusa Test', '11112222');

        $this->put("/games/{$game->id}/planilla", [
            'players' => [
                ['player_id' => $outsider->id, 'present' => true],
            ],
        ])->assertSessionHasErrors('players');
    }

    public function test_update_is_rejected_when_sheet_is_closed(): void
    {
        [$game, $local, $visitor, $localPlayer] = $this->scenario();

        $this->put("/games/{$game->id}/planilla", [
            'players' => [
                ['player_id' => $localPlayer->id, 'present' => true],
            ],
        ]);

        $this->post("/games/{$game->id}/planilla/close");

        $this->put("/games/{$game->id}/planilla", [
            'players' => [
                ['player_id' => $localPlayer->id, 'present' => false],
            ],
        ])->assertSessionHasErrors('sheet');

        $this->assertDatabaseHas('game_sheet_players', [
            'player_id' => $localPlayer->id,
            'present' => true,
        ]);
    }

    public function test_close_marks_sheet_and_game_as_finished(): void
    {
        [$game, $local, $visitor, $localPlayer] = $this->scenario();

        $this->put("/games/{$game->id}/planilla", [
            'players' => [
                ['player_id' => $localPlayer->id, 'present' => true],
            ],
        ]);

        $this->post("/games/{$game->id}/planilla/close")
            ->assertRedirect(route('games.sheet.show', $game));

        $this->assertDatabaseHas('game_sheets', [
            'game_id' => $game->id,
            'status_sheet' => 'closed',
        ]);

        $this->assertDatabaseHas('games', [
            'id' => $game->id,
            'status_game' => 'finished',
            'result' => 'finished',
        ]);
    }

    public function test_show_only_lists_players_from_the_submitted_roster(): void
    {
        [$game, $local, $visitor, $localPlayer] = $this->scenario(false);

        $this->createPlayer($local, 'Jugadora No Convocada', '55556666');
        $this->submitRoster($game, $local, [$localPlayer]);
        $this->submitRoster($game, $visitor, []);

        $this->get("/games/{$game->id}/planilla")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Games/Scoresheet')
                ->has('localPlayers', 1)
                ->where('localPlayers.0.player_id', $localPlayer->id)
                ->where('rostersReady', false));
    }

    public function test_update_is_rejected_when_rosters_are_missing(): void
    {
        [$game, $local, $visitor, $localPlayer] = $this->scenario(false);

        $this->put("/games/{$game->id}/planilla", [
            'players' => [
                ['player_id' => $localPlayer->id, 'present' => true],
            ],
        ])->assertSessionHasErrors('players');

        $this->assertDatabaseCount('game_sheets', 0);
    }
}
