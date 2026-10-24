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
use Tests\TestCase;

class GamePhaseTest extends TestCase
{
    use RefreshDatabase;

    private string $saturday;
    private Tournament $tournament;
    private Fixture $fixture;
    private Category $category;
    private Team $local;
    private Team $visitor;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::factory()->create());
        $this->saturday = Carbon::parse('next saturday')->toDateString();
        $sunday = Carbon::parse($this->saturday)->addDay()->toDateString();
        $this->category = Category::create(['name_category' => 'Sub-18', 'genero_category' => 'Femenino']);
        $this->tournament = Tournament::create(['name_tournament' => 'Torneo Test', 'start_date' => $this->saturday, 'end_date' => $sunday]);
        $this->tournament->categories()->attach($this->category->id_category);
        $this->fixture = Fixture::create(['id_tournament' => $this->tournament->id, 'name_fixture' => 'Fecha 1', 'start_date' => $this->saturday, 'end_date' => $sunday, 'status_fixture' => 'scheduled']);
        $this->local = $this->team('Local');
        $this->visitor = $this->team('Visitante');
    }

    public function test_creating_playoff_requires_and_saves_instance_and_format(): void
    {
        $this->post('/games', $this->payload(['phase_instance' => 'Semifinal', 'set_format' => 'best_of_5']))
            ->assertRedirect(route('fixtures.show', $this->fixture));

        $this->assertDatabaseHas('games', ['phase' => 'playoff', 'phase_instance' => 'Semifinal', 'set_format' => 'best_of_5']);

        $this->post('/games', $this->payload(['phase_instance' => ' ', 'set_format' => 'best_of_3']))
            ->assertSessionHasErrors('phase_instance');
    }

    public function test_regular_creation_uses_three_sets_and_rejects_five_set_format(): void
    {
        $this->post('/games', $this->payload(['phase' => 'regular', 'phase_instance' => null, 'set_format' => 'best_of_3']))
            ->assertRedirect(route('fixtures.show', $this->fixture));

        $this->assertDatabaseHas('games', ['phase' => 'regular', 'phase_instance' => null, 'set_format' => 'best_of_3']);

        $this->post('/games', $this->payload(['phase' => 'regular', 'phase_instance' => null, 'set_format' => 'best_of_5']))
            ->assertSessionHasErrors('set_format');
    }

    public function test_edit_rejects_a_format_change_that_invalidates_saved_result(): void
    {
        $game = Game::create($this->payload(['phase' => 'playoff', 'phase_instance' => 'Final', 'set_format' => 'best_of_5']));
        $game->matchResult()->create([
            'sets_local' => 3, 'sets_visitor' => 2,
            'set_1_points_local' => 25, 'set_1_points_visitor' => 20,
            'set_2_points_local' => 20, 'set_2_points_visitor' => 25,
            'set_3_points_local' => 25, 'set_3_points_visitor' => 18,
            'set_4_points_local' => 22, 'set_4_points_visitor' => 25,
            'set_5_points_local' => 15, 'set_5_points_visitor' => 13,
        ]);

        $payload = $this->payload(['phase' => 'regular', 'phase_instance' => null, 'set_format' => 'best_of_3']);
        $this->put("/games/{$game->id}", $payload)->assertSessionHasErrors('phase');
        $this->assertDatabaseHas('games', ['id' => $game->id, 'phase' => 'playoff', 'set_format' => 'best_of_5']);
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'id_tournament' => $this->tournament->id,
            'id_category' => $this->category->id_category,
            'id_fixture' => $this->fixture->id,
            'id_team_local' => $this->local->id,
            'id_team_visitor' => $this->visitor->id,
            'phase' => 'playoff',
            'phase_instance' => 'Cuartos de final',
            'set_format' => 'best_of_3',
            'date' => $this->saturday,
            'time' => '15:00',
            'status_game' => 'pending',
            'result' => 'pending',
        ], $overrides);
    }

    private function team(string $name): Team
    {
        $delegate = Delegate::create(['name_delegate' => 'Delegado '.$name, 'phone_delegate' => '2222222222', 'email_delegate' => strtolower($name).'@example.com']);
        return Team::create(['name_team' => 'Equipo '.$name, 'city_team' => 'Córdoba', 'id_category' => $this->category->id_category, 'id_delegate' => $delegate->id_delegate]);
    }
}
