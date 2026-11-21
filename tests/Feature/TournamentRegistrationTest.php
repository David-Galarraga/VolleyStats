<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Fixture;
use App\Models\Game;
use App\Models\GameSheetPlayer;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\User;
use App\Services\StandingsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TournamentRegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->travelTo(Carbon::parse('2026-11-17 12:00:00'));
        $this->actingAs(User::factory()->admin()->create());
    }

    private function context(): array
    {
        $tournament = Tournament::create(['name_tournament' => 'Torneo', 'start_date' => '2027-01-01', 'end_date' => '2027-12-31']);
        $category = Category::create(['id_tournament' => $tournament->id, 'name_category' => 'A', 'genero_category' => 'Femenino']);
        $tournament->categories()->attach($category->getKey());

        return [$tournament, $category, "/tournaments/{$tournament->id}/categories/{$category->getKey()}/teams"];
    }

    private function payload(int $count = 0, string $action = 'draft'): array
    {
        return [
            'name_team' => 'Las del club', 'city_team' => 'Gualeguaychú', 'action' => $action,
            'delegate' => ['name_delegate' => 'Delegada Test', 'dni_delegate' => '87.654.321', 'phone_delegate' => '+54 3446 123456'],
            'players' => array_map(fn ($i) => ['name_player' => "Jugadora $i", 'dni_player' => (string) (12340000 + $i), 'birthdate_player' => '2000-01-01'], range(1, max(1, $count))),
        ] + [];
    }

    private function createTeam(string $base, int $count = 8): Team
    {
        $payload = $this->payload($count, $count >= 8 ? 'confirm' : 'draft');
        if ($count === 0) {
            $payload['players'] = [];
        }
        $this->post($base, $payload)->assertSessionHasNoErrors()->assertRedirect();

        return Team::latest('id')->firstOrFail();
    }

    private function editPayload(Team $team): array
    {
        return [...$team->only(['name_team', 'city_team', 'id_delegate', 'id_trainer']), 'action' => 'confirm', 'players' => $team->players->toArray()];
    }

    public function test_form_and_category_navigation_are_available(): void
    {
        [$t, $c, $base] = $this->context();
        $this->get("/tournaments/$t->id/categories")->assertOk();
        $this->get($base)->assertInertia(fn (Assert $p) => $p->component('Teams/TournamentIndex')->has('teams', 0));
        $this->get("$base/create")->assertInertia(fn (Assert $p) => $p->component('Teams/Registration')->where('team', null)->has('delegates', 0)->has('trainers', 0));
    }

    public function test_draft_requires_complete_delegate_and_saves_no_partial_data(): void
    {
        [, , $base] = $this->context();
        foreach (['name_delegate', 'dni_delegate', 'phone_delegate'] as $field) {
            $payload = $this->payload();
            $payload['players'] = [];
            unset($payload['delegate'][$field]);
            $this->post($base, $payload)->assertSessionHasErrors("delegate.$field");
        }
        $this->assertDatabaseCount('teams', 0);
        $this->assertDatabaseCount('delegates', 0);
        $team = $this->createTeam($base, 0);
        $this->assertSame('draft', $team->registration_status);
        $this->assertSame('87654321', $team->delegate->dni_delegate);
        $this->assertNull($team->delegate->email_delegate);
        $this->assertSame(0, $team->players()->count());
    }

    public function test_confirmation_requires_eight_and_trainer_is_optional(): void
    {
        [, , $base] = $this->context();
        $this->post($base, $this->payload(7, 'confirm'))->assertSessionHasErrors('players');
        $this->assertDatabaseCount('teams', 0);
        $this->assertDatabaseCount('players', 0);
        $this->assertDatabaseCount('delegates', 0);
        $team = $this->createTeam($base);
        $this->assertSame('confirmed', $team->registration_status);
        $this->assertNull($team->id_trainer);
        $this->assertSame(8, $team->players()->count());
    }

    public function test_draft_can_be_completed_and_confirmed_later(): void
    {
        [, , $base] = $this->context();
        $team = $this->createTeam($base, 0);
        $payload = $this->payload(8, 'confirm');
        $payload['id_delegate'] = $team->id_delegate;
        $this->put("$base/$team->id", $payload)->assertSessionHasNoErrors();
        $this->assertSame('confirmed', $team->fresh()->registration_status);
        $this->post("$base/$team->id/confirm")->assertSessionHasNoErrors();
        $this->assertDatabaseCount('players', 8);
        $this->assertDatabaseCount('delegates', 1);
    }

    public function test_new_tournament_is_empty_and_preserves_previous_data_and_categories(): void
    {
        [$a, $ac, $base] = $this->context();
        $old = $this->createTeam($base);
        $this->post('/tournaments', ['name_tournament' => 'Nuevo', 'start_date' => '2027-01-01', 'end_date' => '2027-12-31', 'categories' => [['id_category' => $ac->getKey()]]])->assertSessionHasNoErrors();
        $b = Tournament::latest('id')->firstOrFail();
        $bc = $b->categories()->firstOrFail();
        $this->assertNotSame($ac->getKey(), $bc->getKey());
        foreach (['teams', 'players', 'delegates', 'trainers', 'fixtures', 'games'] as $table) {
            $this->assertSame(0, DB::table($table)->where('id_tournament', $b->id)->count());
        }
        $this->assertCount(0, app(StandingsService::class)->calculate($b->id, $bc->getKey()));
        $this->assertSame(8, $old->players()->count());
        $this->put("/tournaments/$b->id/categories/{$bc->getKey()}", ['name_category' => 'B', 'genero_category' => 'Femenino'])->assertSessionHasNoErrors();
        $this->assertSame('A', $ac->fresh()->name_category);
    }

    public function test_same_dni_is_allowed_in_different_tournaments_and_edits_are_independent(): void
    {
        [, , $a] = $this->context();
        [, , $b] = $this->context();
        $first = $this->createTeam($a);
        $second = $this->createTeam($b);
        $payload = $this->editPayload($second);
        unset($payload['id_delegate']);
        $payload['delegate'] = ['name_delegate' => 'Nueva delegada', 'dni_delegate' => '87654321', 'phone_delegate' => '3446123456'];
        $payload['players'][0]['name_player'] = 'Nombre nuevo';
        $this->put("$b/$second->id", $payload)->assertSessionHasNoErrors();
        $this->assertSame('Delegada Test', $first->delegate->fresh()->name_delegate);
        $this->assertSame('Jugadora 1', $first->players()->first()->name_player);
        $this->assertDatabaseCount('players', 16);
    }

    public function test_dni_cannot_repeat_within_tournament_even_with_different_format(): void
    {
        [, , $base] = $this->context();
        $first = $this->createTeam($base);
        $payload = $this->payload(8, 'confirm');
        $payload['id_delegate'] = $first->id_delegate;
        $payload['players'][0]['dni_player'] = '12.340.001';
        $this->post($base, $payload)->assertSessionHasErrors('players.0.dni_player');
        $this->assertDatabaseCount('teams', 1);
        $payload = $this->editPayload($first);
        $payload['players'][1]['dni_player'] = $payload['players'][0]['dni_player'];
        $this->put("$base/$first->id", $payload)->assertSessionHasErrors('players.1.dni_player');
    }

    public function test_confirmed_team_cannot_lose_delegate_or_drop_below_eight(): void
    {
        [, , $base] = $this->context();
        $team = $this->createTeam($base);
        $payload = $this->editPayload($team);
        array_pop($payload['players']);
        $this->put("$base/$team->id", $payload)->assertSessionHasErrors('players');
        $payload = $this->editPayload($team);
        unset($payload['id_delegate']);
        $this->put("$base/$team->id", $payload)->assertSessionHasErrors('delegate.name_delegate');
        $this->assertSame(8, $team->players()->count());
        $this->assertNotNull($team->fresh()->id_delegate);
    }

    public function test_cross_tournament_team_staff_and_player_ids_are_rejected(): void
    {
        [, , $a] = $this->context();
        [$tb, $cb, $b] = $this->context();
        $first = $this->createTeam($a);
        $second = $this->createTeam($b);
        $this->get("$b/$first->id/edit")->assertNotFound();
        $this->put("$b/$first->id", $this->editPayload($first))->assertNotFound();
        $payload = $this->editPayload($second);
        $payload['id_delegate'] = $first->id_delegate;
        $this->put("$b/$second->id", $payload)->assertSessionHasErrors('id_delegate');
        $payload = $this->editPayload($second);
        $payload['players'][0]['id'] = $first->players()->first()->id;
        $this->put("$b/$second->id", $payload)->assertSessionHasErrors('players.0.id');
        $this->get($a.'/create')->assertInertia(fn (Assert $p) => $p->has('delegates', 1));
    }

    public function test_optional_trainer_is_created_in_the_same_transaction(): void
    {
        [$t, , $base] = $this->context();
        $payload = $this->payload(8, 'confirm');
        $payload['trainer'] = ['name_trainer' => 'DT', 'dni_trainer' => '22.222.222', 'birthdate_trainer' => '1980-01-01'];
        $this->post($base, $payload)->assertSessionHasNoErrors();
        $this->assertDatabaseHas('trainers', ['id_tournament' => $t->id, 'dni_trainer' => '22222222']);
        $payload['trainer']['dni_trainer'] = 'mal';
        $payload['id_delegate'] = Team::first()->id_delegate;
        $this->post($base, $payload)->assertSessionHasErrors('trainer.dni_trainer');
        $this->assertDatabaseCount('teams', 1);
        $this->assertDatabaseCount('trainers', 1);
    }

    public function test_drafts_and_foreign_teams_are_not_offered_for_competition(): void
    {
        [$t, $c, $base] = $this->context();
        $team = $this->createTeam($base, 0);
        $fixture = Fixture::create(['id_tournament' => $t->id, 'name_fixture' => 'Fecha 1', 'start_date' => '2027-01-02', 'end_date' => '2027-01-03']);
        $this->assertCount(0, app(StandingsService::class)->calculate($t->id, $c->getKey()));
        $this->get("/fixtures/$fixture->id/availabilities")->assertInertia(fn (Assert $p) => $p->has('teams', 0));
        $this->get("/games/create?fixture=$fixture->id")->assertInertia(fn (Assert $p) => $p->has('teams', 0));
        $this->post("/fixtures/$fixture->id/availabilities", ['id_category' => $c->getKey(), 'id_team' => $team->id, 'dates' => ['2027-01-02'], 'start_time' => '10:00', 'end_time' => '11:00'])->assertSessionHasErrors('id_team');
        $this->post("/tournaments/$t->id/categories/{$c->getKey()}/playoff-matches", ['stage' => 'Final', 'cup' => 'gold', 'team_a_id' => $team->id])->assertSessionHasErrors('team_a_id');
        $this->assertDatabaseCount('playoff_brackets', 0);
    }

    public function test_category_cannot_be_changed_or_removed_with_teams(): void
    {
        [$t, $c, $base] = $this->context();
        $team = $this->createTeam($base);
        $payload = $this->editPayload($team);
        $payload['id_category'] = 999;
        $this->put("$base/$team->id", $payload)->assertSessionHasErrors('id_category');
        $this->delete("/tournaments/$t->id/categories/{$c->getKey()}")->assertSessionHasErrors('categories');
    }

    public function test_legacy_global_writes_cannot_bypass_registration_rules(): void
    {
        foreach (['teams', 'players', 'delegates', 'trainers'] as $resource) {
            $this->post("/$resource", [])->assertSessionHasErrors('team');
        }
        $this->get('/teams')->assertInertia(fn (Assert $p) => $p->component('Teams/SelectTournament'));
        $this->get('/players')->assertRedirect('/teams');
    }

    public function test_replacing_delegate_with_a_new_person_is_atomic_and_keeps_the_original(): void
    {
        [, , $base] = $this->context();
        $team = $this->createTeam($base);
        $old = $team->delegate;
        $payload = $this->editPayload($team);
        unset($payload['id_delegate']);
        $payload['new_delegate'] = true;
        $payload['delegate'] = ['name_delegate' => 'Reemplazo', 'dni_delegate' => '55555555', 'phone_delegate' => '3446123456'];
        $this->put("$base/$team->id", $payload)->assertSessionHasNoErrors();
        $this->assertNotSame($old->getKey(), $team->fresh()->id_delegate);
        $this->assertSame('Delegada Test', $old->fresh()->name_delegate);
        $this->assertDatabaseCount('delegates', 2);
    }

    public function test_removing_ninth_player_preserves_scoresheet_and_roster_snapshots(): void
    {
        [$t, $c, $base] = $this->context();
        $team = $this->createTeam($base, 9);
        $player = $team->players()->firstOrFail();
        $visitor = $team->replicate();
        $visitor->name_team = 'Visitante';
        $visitor->save();
        $game = Game::create(['id_tournament' => $t->id, 'id_category' => $c->getKey(), 'id_team_local' => $team->id, 'id_team_visitor' => $visitor->id, 'date' => '2027-01-02', 'time' => '15:00']);
        $sheet = DB::table('game_sheets')->insertGetId(['game_id' => $game->id, 'status_sheet' => 'closed']);
        DB::table('game_sheet_players')->insert(['game_sheet_id' => $sheet, 'team_id' => $team->id, 'player_id' => $player->id, 'name_player' => 'Nombre histórico', 'dni_player' => $player->dni_player, 'present' => true]);
        $payload = $this->editPayload($team);
        $payload['players'] = array_values(array_filter($payload['players'], fn ($p) => $p['id'] !== $player->id));
        $this->put("$base/$team->id", $payload)->assertSessionHasNoErrors();
        $this->assertSoftDeleted('players', ['id' => $player->id]);
        $this->assertSame(8, $team->players()->count());
        $this->assertDatabaseHas('game_sheet_players', ['player_id' => $player->id, 'name_player' => 'Nombre histórico']);
        $this->assertNotNull(GameSheetPlayer::first()->player);
    }

    public function test_empty_tournament_can_still_be_deleted_with_its_owned_categories(): void
    {
        [$t, $c] = $this->context();
        $this->delete("/tournaments/$t->id")->assertSessionHasNoErrors()->assertRedirect();
        $this->assertDatabaseMissing('tournaments', ['id' => $t->id]);
        $this->assertDatabaseMissing('categories', ['id_category' => $c->getKey()]);
    }
}
