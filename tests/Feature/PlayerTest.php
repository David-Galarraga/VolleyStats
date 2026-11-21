<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PlayerTest extends TestCase
{
    use RefreshDatabase;

    private Team $team;

    private string $url;

    protected function setUp(): void
    {
        parent::setUp();
        $this->travelTo(Carbon::parse('2026-11-17 12:00:00'));
        $this->actingAs(User::factory()->admin()->create());
        $t = Tournament::create(['name_tournament' => 'Torneo', 'start_date' => '2027-01-01', 'end_date' => '2027-12-31']);
        $c = Category::create(['id_tournament' => $t->id, 'name_category' => 'A', 'genero_category' => 'Femenino']);
        $t->categories()->attach($c->getKey());
        $base = "/tournaments/$t->id/categories/{$c->getKey()}/teams";
        $this->post($base, ['name_team' => 'Equipo', 'city_team' => 'Ciudad', 'action' => 'draft', 'players' => [], 'delegate' => ['name_delegate' => 'Delegada', 'dni_delegate' => '87654321', 'phone_delegate' => '3446123456']])->assertSessionHasNoErrors();
        $this->team = Team::firstOrFail();
        $this->url = "$base/{$this->team->id}";
    }

    private function payload(array $players): array
    {
        return [...$this->team->only(['name_team', 'city_team', 'id_delegate']), 'action' => 'draft', 'players' => $players];
    }

    private function player(): array
    {
        return ['name_player' => 'Ana P?rez', 'dni_player' => '12.345.678', 'birthdate_player' => '2004-05-12'];
    }

    public function test_old_global_pages_require_tournament_context(): void
    {
        $this->get('/players')->assertRedirect('/teams');
        $this->get('/players/create')->assertRedirect('/teams');
        $this->get("/teams/{$this->team->id}/players")->assertRedirect($this->url.'/edit');
        $this->get($this->url.'/edit')->assertInertia(fn (Assert $p) => $p->component('Teams/Registration')->where('team.id', $this->team->id)->has('team.players', 0));
    }

    public function test_store_normalizes_dni_and_assigns_player_to_the_team_tournament(): void
    {
        $this->put($this->url, $this->payload([$this->player()]))->assertSessionHasNoErrors();
        $this->assertDatabaseHas('players', ['id_team' => $this->team->id, 'id_tournament' => $this->team->id_tournament, 'dni_player' => '12345678']);
    }

    public function test_update_modifies_player_without_creating_another_identity(): void
    {
        $this->put($this->url, $this->payload([$this->player()]))->assertSessionHasNoErrors();
        $player = $this->team->players()->firstOrFail();
        $row = $player->toArray();
        $row['name_player'] = 'Nombre editado';
        $this->put($this->url, $this->payload([$row]))->assertSessionHasNoErrors();
        $this->assertSame('Nombre editado', $player->fresh()->name_player);
        $this->assertDatabaseCount('players', 1);
    }

    public function test_removing_a_player_archives_the_record_instead_of_erasing_history(): void
    {
        $this->put($this->url, $this->payload([$this->player()]))->assertSessionHasNoErrors();
        $player = $this->team->players()->firstOrFail();
        $this->put($this->url, $this->payload([]))->assertSessionHasNoErrors();
        $this->assertSoftDeleted('players', ['id' => $player->id]);
        $this->assertSame(0, $this->team->players()->count());
    }

    public function test_future_birthdate_is_rejected(): void
    {
        $row = $this->player();
        $row['birthdate_player'] = now()->addDay()->toDateString();
        $this->put($this->url, $this->payload([$row]))->assertSessionHasErrors('players.0.birthdate_player');
        $this->assertDatabaseCount('players', 0);
    }

    public function test_duplicate_dni_in_another_team_of_the_same_tournament_is_rejected(): void
    {
        $this->put($this->url, $this->payload([$this->player()]))->assertSessionHasNoErrors();
        $base = preg_replace('~/[0-9]+$~', '', $this->url);
        $this->post($base, $this->payload([$this->player()]))->assertSessionHasErrors('players.0.dni_player');
        $this->assertDatabaseCount('players', 1);
    }

    public function test_invalid_dni_format_is_rejected(): void
    {
        $row = $this->player();
        $row['dni_player'] = '1234';
        $this->put($this->url, $this->payload([$row]))->assertSessionHasErrors('players.0.dni_player');
    }
}
