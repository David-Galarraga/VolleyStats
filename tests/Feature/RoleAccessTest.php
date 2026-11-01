<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Delegate;
use App\Models\Fixture;
use App\Models\Game;
use App\Models\Player;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleAccessTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Category $category;

    private Tournament $tournament;

    private string $saturday;

    private string $sunday;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create();

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

    private function createFixture(): Fixture
    {
        return Fixture::create([
            'id_tournament' => $this->tournament->id,
            'name_fixture' => 'Fecha 1',
            'start_date' => $this->saturday,
            'end_date' => $this->sunday,
            'status_fixture' => 'scheduled',
        ]);
    }

    private function createGame(?Fixture $fixture = null): Game
    {
        $local = $this->createTeam('Equipo A');
        $visitor = $this->createTeam('Equipo B');

        return Game::create([
            'id_tournament' => $this->tournament->id,
            'id_category' => $this->category->id_category,
            'id_fixture' => $fixture?->id,
            'id_team_local' => $local->id,
            'id_team_visitor' => $visitor->id,
            'id_referee' => null,
            'date' => $this->saturday,
            'time' => '15:00',
            'status_game' => 'pending',
            'phase' => 'regular',
        ]);
    }

    private function createPlayers(Team $team, int $count): array
    {
        $players = [];

        for ($i = 1; $i <= $count; $i++) {
            $players[] = Player::create([
                'id_team' => $team->id,
                'name_player' => "Jugadora {$team->name_team} {$i}",
                'dni_player' => str_pad((string) (10000000 + ($team->id * 10) + $i), 8, '0', STR_PAD_LEFT),
                'birthdate_player' => '2008-05-12',
            ]);
        }

        return $players;
    }

    private function submitRoster(Game $game, Team $team, array $players): void
    {
        $roster = $game->rosters()->create([
            'team_id' => $team->id,
            'submitted_by' => $this->admin->id_user,
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

    public function test_admin_can_access_all_areas(): void
    {
        $game = $this->createGame();

        $this->actingAs($this->admin);

        $this->get('/standings')->assertOk();
        $this->get('/teams')->assertOk();
        $this->get('/fixtures')->assertOk();
        $this->get('/users')->assertOk();
        $this->get("/games/{$game->id}")->assertOk();
        $this->get("/games/{$game->id}/planilla")->assertOk();
    }

    public function test_assigned_planillero_can_manage_the_sheet(): void
    {
        $game = $this->createGame();
        $planillero = User::factory()->planillero()->create();

        $game->planilleros()->attach($planillero->id_user, [
            'assigned_by' => $this->admin->id_user,
        ]);

        $localPlayers = $this->createPlayers($game->teamLocal, 6);
        $visitorPlayers = $this->createPlayers($game->teamVisitor, 6);

        $this->submitRoster($game, $game->teamLocal, $localPlayers);
        $this->submitRoster($game, $game->teamVisitor, $visitorPlayers);

        $this->actingAs($planillero);

        $this->get("/games/{$game->id}/planilla")->assertOk();

        $players = collect($localPlayers)
            ->concat($visitorPlayers)
            ->map(fn (Player $player) => [
                'player_id' => $player->id,
                'present' => true,
            ])
            ->all();

        $this->put("/games/{$game->id}/planilla", [
            'venue' => 'Polideportivo Central',
            'referee_name' => 'Árbitra Test',
            'players' => $players,
        ])->assertRedirect(route('games.sheet.show', $game));

        $this->put("/games/{$game->id}/result", [
            'sets_local' => 2,
            'sets_visitor' => 0,
            'set_1_points_local' => 25,
            'set_1_points_visitor' => 0,
            'set_2_points_local' => 25,
            'set_2_points_visitor' => 0,
        ])->assertRedirect(route('games.sheet.show', $game));

        $this->post("/games/{$game->id}/planilla/close")
            ->assertRedirect(route('games.sheet.show', $game));

        $this->assertDatabaseHas('game_sheets', [
            'game_id' => $game->id,
            'status_sheet' => 'closed',
        ]);
    }

    public function test_assigned_planillero_can_save_best_of_five_result_and_close_sheet(): void
    {
        $game = $this->createGame();
        $game->update([
            'phase' => 'playoff',
            'phase_instance' => 'Final',
            'set_format' => 'best_of_5',
        ]);

        $planillero = User::factory()->planillero()->create();
        $game->planilleros()->attach($planillero->id_user);

        $localPlayers = $this->createPlayers($game->teamLocal, 6);
        $visitorPlayers = $this->createPlayers($game->teamVisitor, 6);

        $this->submitRoster($game, $game->teamLocal, $localPlayers);
        $this->submitRoster($game, $game->teamVisitor, $visitorPlayers);

        $this->actingAs($planillero);

        $players = collect($localPlayers)
            ->concat($visitorPlayers)
            ->map(fn (Player $player) => [
                'player_id' => $player->id,
                'present' => true,
            ])
            ->all();

        $this->put("/games/{$game->id}/planilla", [
            'venue' => 'Polideportivo Central',
            'referee_name' => 'Árbitra Test',
            'players' => $players,
        ])->assertRedirect(route('games.sheet.show', $game));

        $this->put("/games/{$game->id}/result", [
            'sets_local' => 3,
            'sets_visitor' => 2,
            'set_1_points_local' => 25,
            'set_1_points_visitor' => 20,
            'set_2_points_local' => 20,
            'set_2_points_visitor' => 25,
            'set_3_points_local' => 25,
            'set_3_points_visitor' => 18,
            'set_4_points_local' => 22,
            'set_4_points_visitor' => 25,
            'set_5_points_local' => 15,
            'set_5_points_visitor' => 13,
        ])->assertRedirect(route('games.sheet.show', $game));

        $this->post("/games/{$game->id}/planilla/close")
            ->assertRedirect(route('games.sheet.show', $game));

        $this->assertDatabaseHas('results', [
            'game_id' => $game->id,
            'sets_local' => 3,
            'sets_visitor' => 2,
            'set_5_points_local' => 15,
            'set_5_points_visitor' => 13,
        ]);

        $this->assertDatabaseHas('game_sheets', [
            'game_id' => $game->id,
            'status_sheet' => 'closed',
        ]);
    }

    public function test_unassigned_planillero_cannot_access_the_sheet(): void
    {
        $game = $this->createGame();
        $planillero = User::factory()->planillero()->create();

        $this->actingAs($planillero)
            ->get("/games/{$game->id}/planilla")
            ->assertForbidden();
    }

    public function test_planillero_can_view_standings_but_cannot_access_admin_areas(): void
    {
        $game = $this->createGame();
        $planillero = User::factory()->planillero()->create();

        $this->actingAs($planillero);

        $this->get('/standings')->assertOk();
        $this->get('/teams')->assertForbidden();
        $this->get('/fixtures')->assertForbidden();
        $this->get('/users')->assertForbidden();
        $this->get("/games/{$game->id}")->assertForbidden();
    }

    public function test_planillero_only_sees_assigned_games(): void
    {
        $assigned = $this->createGame();
        $other = $this->createGame();
        $planillero = User::factory()->planillero()->create();

        $assigned->planilleros()->attach($planillero->id_user);

        $this->actingAs($planillero)
            ->get('/mis-planillas')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Games/Mine')
                ->has('games', 1)
                ->where('games.0.id', $assigned->id));
    }

    public function test_planillero_with_assigned_fixture_can_view_my_sheets(): void
    {
        $fixture = $this->createFixture();
        $game = $this->createGame($fixture);
        $planillero = User::factory()->planillero()->create();

        $game->planilleros()->attach($planillero->id_user);

        $this->actingAs($planillero)
            ->get('/mis-planillas')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Games/Mine')
                ->has('games', 1)
                ->where('games.0.id', $game->id)
                ->where('games.0.day', 'sábado'));
    }

    public function test_admin_can_create_another_admin_user(): void
    {
        $this->actingAs($this->admin)
            ->post('/users', [
                'name_user' => 'Nuevo Administrador',
                'email' => 'nuevo-admin@example.com',
                'password' => 'password',
                'password_confirmation' => 'password',
                'role' => 'Administrador',
                'is_active' => true,
            ])
            ->assertRedirect(route('users.index'));

        $user = User::where('email', 'nuevo-admin@example.com')->firstOrFail();

        $this->assertNotNull($user->email_verified_at);
        $this->assertTrue($user->hasRole('Administrador'));
    }

    public function test_admin_can_assign_a_planillero_to_a_game(): void
    {
        $fixture = $this->createFixture();
        $game = $this->createGame($fixture);
        $planillero = User::factory()->planillero()->create();

        $this->actingAs($this->admin)
            ->put("/games/{$game->id}", [
                'id_tournament' => $this->tournament->id,
                'id_category' => $this->category->id_category,
                'id_fixture' => $fixture->id,
                'id_team_local' => $game->id_team_local,
                'id_team_visitor' => $game->id_team_visitor,
                'phase' => 'regular',
                'date' => $this->saturday,
                'time' => '15:00',
                'status_game' => 'pending',
                'planillero_ids' => [$planillero->id_user],
            ])
            ->assertRedirect(route('fixtures.show', $fixture));

        $this->assertDatabaseHas('game_planillero', [
            'game_id' => $game->id,
            'user_id' => $planillero->id_user,
            'assigned_by' => $this->admin->id_user,
        ]);
    }

    public function test_admin_cannot_assign_a_user_without_the_planillero_role(): void
    {
        $fixture = $this->createFixture();
        $game = $this->createGame($fixture);
        $other = User::factory()->create();

        $this->actingAs($this->admin)
            ->put("/games/{$game->id}", [
                'id_tournament' => $this->tournament->id,
                'id_category' => $this->category->id_category,
                'id_fixture' => $fixture->id,
                'id_team_local' => $game->id_team_local,
                'id_team_visitor' => $game->id_team_visitor,
                'phase' => 'regular',
                'date' => $this->saturday,
                'time' => '15:00',
                'status_game' => 'pending',
                'planillero_ids' => [$other->id_user],
            ])
            ->assertSessionHasErrors('planillero_ids.0');

        $this->assertDatabaseCount('game_planillero', 0);
    }
}
