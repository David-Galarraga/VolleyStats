<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Delegate;
use App\Models\Player;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PlayerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->actingAs(User::factory()->create());
    }

    private function createTeam(): Team
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
            'name_team' => 'Equipo Test',
            'city_team' => 'Córdoba',
            'id_category' => $category->id_category,
            'id_delegate' => $delegate->id_delegate,
        ]);
    }

    public function test_index_renders_players_page(): void
    {
        $this->get('/players')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Players/Index')
                ->has('players'));
    }

    public function test_create_renders_form_with_teams(): void
    {
        $this->createTeam();

        $this->get('/players/create')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Players/Create')
                ->has('teams', 1));
    }

    public function test_store_creates_a_player(): void
    {
        $team = $this->createTeam();

        $this->post('/players', [
            'id_team' => $team->id,
            'name_player' => 'Ana Pérez',
            'birthdate_player' => '2004-05-12',
            'number_player' => 7,
        ])->assertRedirect(route('players.index'));

        $this->assertDatabaseHas('players', [
            'name_player' => 'Ana Pérez',
            'id_team' => $team->id,
            'number_player' => 7,
        ]);
    }

    public function test_edit_renders_player_form(): void
    {
        $team = $this->createTeam();
        $player = Player::create([
            'id_team' => $team->id,
            'name_player' => 'Ana Pérez',
            'birthdate_player' => '2004-05-12',
            'number_player' => 7,
        ]);

        $this->get("/players/{$player->id}/edit")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Players/Edit')
                ->where('player.id', $player->id)
                ->has('teams'));
    }

    public function test_update_modifies_a_player(): void
    {
        $team = $this->createTeam();
        $player = Player::create([
            'id_team' => $team->id,
            'name_player' => 'Ana Pérez',
            'birthdate_player' => '2004-05-12',
            'number_player' => 7,
        ]);

        $this->put("/players/{$player->id}", [
            'id_team' => $team->id,
            'name_player' => 'Ana Gómez',
            'birthdate_player' => '2004-05-12',
            'number_player' => 10,
        ])->assertRedirect(route('players.index'));

        $this->assertDatabaseHas('players', [
            'id' => $player->id,
            'name_player' => 'Ana Gómez',
            'number_player' => 10,
        ]);
    }

    public function test_destroy_deletes_a_player(): void
    {
        $team = $this->createTeam();
        $player = Player::create([
            'id_team' => $team->id,
            'name_player' => 'Ana Pérez',
            'birthdate_player' => '2004-05-12',
            'number_player' => 7,
        ]);

        $this->delete("/players/{$player->id}")
            ->assertRedirect(route('players.index'));

        $this->assertDatabaseMissing('players', [
            'id' => $player->id,
        ]);
    }

    public function test_store_rejects_a_future_birthdate(): void
    {
        $team = $this->createTeam();

        $this->post('/players', [
            'id_team' => $team->id,
            'name_player' => 'Ana Pérez',
            'birthdate_player' => now()->addDay()->toDateString(),
            'number_player' => 7,
        ])->assertSessionHasErrors('birthdate_player');

        $this->assertDatabaseMissing('players', [
            'name_player' => 'Ana Pérez',
        ]);
    }
}
