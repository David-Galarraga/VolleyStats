<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Delegate;
use App\Models\Game;
use App\Models\Player;
use App\Models\Team;
use App\Models\Tournament;
use App\Services\LegacyTournamentRecovery;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class LegacyTournamentRecoveryTest extends TestCase
{
    use RefreshDatabase;

    public function test_recovery_separates_shared_teams_players_and_snapshots_without_duplication(): void
    {
        $category = Category::create(['name_category' => 'A', 'genero_category' => 'Femenino']);
        $delegate = Delegate::create(['name_delegate' => 'Delegada', 'phone_delegate' => '3446123456']);
        $team = Team::create(['name_team' => 'Equipo', 'city_team' => 'Ciudad', 'id_category' => $category->getKey(), 'id_delegate' => $delegate->getKey()]);
        $visitor = Team::create(['name_team' => 'Visitante', 'city_team' => 'Ciudad', 'id_category' => $category->getKey(), 'id_delegate' => $delegate->getKey()]);
        $player = Player::create(['id_team' => $team->id, 'name_player' => 'Nombre actual', 'dni_player' => '12.345.678', 'birthdate_player' => '2000-01-01']);
        $games = [];
        foreach ([1, 2] as $i) {
            $tournament = Tournament::create(['name_tournament' => "Torneo $i", 'start_date' => '2026-01-01', 'end_date' => '2026-12-31']);
            $tournament->categories()->attach($category->getKey());
            $game = Game::create(['id_tournament' => $tournament->id, 'id_category' => $category->getKey(), 'id_team_local' => $team->id, 'id_team_visitor' => $visitor->id, 'date' => '2026-01-03', 'time' => '15:00']);
            $sheet = DB::table('game_sheets')->insertGetId(['game_id' => $game->id, 'status_sheet' => 'closed']);
            DB::table('game_sheet_players')->insert(['game_sheet_id' => $sheet, 'team_id' => $team->id, 'player_id' => $player->id, 'name_player' => 'Nombre histórico', 'dni_player' => '12.345.678', 'present' => true]);
            $roster = DB::table('match_rosters')->insertGetId(['game_id' => $game->id, 'team_id' => $team->id]);
            DB::table('match_roster_players')->insert(['match_roster_id' => $roster, 'team_id' => $team->id, 'player_id' => $player->id, 'name_player' => 'Nombre convocado', 'dni_player' => '12.345.678']);
            $games[] = $game;
        }
        $service = app(LegacyTournamentRecovery::class);
        $this->assertCount(4, $service->report()['assignments']);
        $service->apply();
        $this->assertDatabaseCount('teams', 6);
        $this->assertDatabaseCount('players', 3);
        $first = $games[0]->fresh();
        $second = $games[1]->fresh();
        $this->assertNotSame($first->id_team_local, $second->id_team_local);
        $this->assertNotSame($first->id_category, $second->id_category);
        $this->assertSame('legacy_review', $first->teamLocal->registration_status);
        foreach ([$first, $second] as $game) {
            $this->assertSame((int) $game->id_tournament, (int) $game->teamLocal->id_tournament);
            $entry = DB::table('game_sheet_players')->where('game_sheet_id', $game->sheet->id)->first();
            $this->assertSame('Nombre histórico', $entry->name_player);
            $this->assertSame('12.345.678', $entry->dni_player);
            $this->assertSame($game->id_team_local, $entry->team_id);
            $this->assertNotSame($player->id, $entry->player_id);
            $this->assertDatabaseHas('match_roster_players', ['player_id' => $entry->player_id, 'team_id' => $entry->team_id, 'name_player' => 'Nombre convocado']);
        }
        $service->apply();
        $this->assertDatabaseCount('teams', 6);
        $this->assertDatabaseCount('players', 3);
        $this->assertNull($team->fresh()->id_tournament);
        $this->assertNull($delegate->fresh()->dni_delegate);
    }

    public function test_unassigned_data_remains_pending_and_report_command_does_not_mutate(): void
    {
        $category = Category::create(['name_category' => 'A', 'genero_category' => 'Femenino']);
        $delegate = Delegate::create(['name_delegate' => 'Delegada', 'phone_delegate' => '3446123456']);
        $team = Team::create(['name_team' => 'Sin evidencia', 'city_team' => 'Ciudad', 'id_category' => $category->getKey(), 'id_delegate' => $delegate->getKey()]);
        $this->artisan('tournaments:recover-ownership')->assertSuccessful();
        $this->assertSame([$team->id], app(LegacyTournamentRecovery::class)->report()['pending_team_ids']);
        $this->assertDatabaseCount('tournament_legacy_links', 0);
    }

    public function test_explicit_manual_assignment_is_reported_before_application_and_is_repeatable(): void
    {
        $category = Category::create(['name_category' => 'A', 'genero_category' => 'Femenino']);
        $delegate = Delegate::create(['name_delegate' => 'Delegada', 'phone_delegate' => '3446123456']);
        $team = Team::create(['name_team' => 'Sin evidencia', 'city_team' => 'Ciudad', 'id_category' => $category->getKey(), 'id_delegate' => $delegate->getKey()]);
        $t = Tournament::create(['name_tournament' => 'Destino explícito', 'start_date' => '2026-01-01', 'end_date' => '2026-12-31']);
        $options = ['--assign' => ["$team->id:$t->id"]];
        $this->artisan('tournaments:recover-ownership', $options)->assertSuccessful();
        $this->assertSame(0, $t->teams()->count());
        $this->artisan('tournaments:recover-ownership', [...$options, '--apply' => true])->assertSuccessful();
        $this->assertSame(1, $t->teams()->count());
        $this->assertSame(1, $t->categories()->count());
        $this->artisan('tournaments:recover-ownership', [...$options, '--apply' => true])->assertSuccessful();
        $this->assertSame(1, $t->teams()->count());
    }

    public function test_conflicting_normalized_dni_blocks_application_without_partial_changes(): void
    {
        $category = Category::create(['name_category' => 'A', 'genero_category' => 'Femenino']);
        $delegate = Delegate::create(['name_delegate' => 'Delegada', 'phone_delegate' => '3446123456']);
        $t = Tournament::create(['name_tournament' => 'Destino', 'start_date' => '2026-01-01', 'end_date' => '2026-12-31']);
        $manual = [];
        foreach (['12345678', '12.345.678'] as $dni) {
            $team = Team::create(['name_team' => 'Equipo', 'city_team' => 'Ciudad', 'id_category' => $category->getKey(), 'id_delegate' => $delegate->getKey()]);
            Player::create(['id_team' => $team->id, 'name_player' => 'Jugadora', 'dni_player' => $dni, 'birthdate_player' => '2000-01-01']);
            $manual[$team->id] = [$t->id];
        }
        $service = app(LegacyTournamentRecovery::class);
        $this->assertNotEmpty($service->report($manual)['conflicts']);
        try {
            $service->apply($manual);
            $this->fail('La recuperación debe rechazar conflictos.');
        } catch (\RuntimeException $e) {
            $this->assertStringContainsString('DNI', $e->getMessage());
        }
        $this->assertSame(0, $t->teams()->count());
        $this->assertDatabaseCount('tournament_legacy_links', 0);
    }
}
