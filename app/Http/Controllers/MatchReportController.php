<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Fixture;
use App\Models\Game;
use App\Models\GameSheet;
use App\Models\Team;
use App\Models\Tournament;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;

class MatchReportController extends Controller
{
    public function index(Request $request)
    {
        $tournamentId = $request->integer('tournament_id') ?: null;
        $phase = $request->query('phase');
        $fixtureId = $request->integer('fixture_id') ?: null;
        $categoryId = $request->integer('category_id') ?: null;
        $teamId = $request->integer('team_id') ?: null;
        $minimum = max(1, $request->integer('minimum', 1));

        if (! is_string($phase) || ! array_key_exists($phase, Game::PHASES)) {
            $phase = null;
        }

        $fixtures = $tournamentId
            ? Fixture::query()
                ->where('id_tournament', $tournamentId)
                ->whereHas('games', fn (Builder $query) => $this->filteredGames($query, $tournamentId, $phase))
                ->orderBy('start_date')
                ->get(['id', 'name_fixture', 'start_date', 'end_date'])
            : collect();

        if ($fixtureId && ! $fixtures->contains('id', $fixtureId)) {
            $fixtureId = null;
        }

        $categories = ($tournamentId && $phase && $fixtureId)
            ? Category::query()
                ->whereIn('id_category', Game::query()
                    ->select('id_category')
                    ->where('id_tournament', $tournamentId)
                    ->where('phase', $phase)
                    ->where('id_fixture', $fixtureId)
                    ->whereHas('sheet', fn (Builder $query) => $query->where('status_sheet', 'closed')))
                ->orderBy('name_category')
                ->get(['id_category', 'name_category', 'genero_category'])
            : collect();

        if ($categoryId && ! $categories->contains('id_category', $categoryId)) {
            $categoryId = null;
        }

        $games = collect();
        $teams = collect();
        $eligiblePlayers = collect();

        if ($tournamentId && $phase && $fixtureId && $categoryId) {
            $baseQuery = Game::query()
                ->with([
                    'tournament:id,name_tournament',
                    'fixture:id,name_fixture',
                    'category:id_category,name_category,genero_category',
                    'teamLocal:id,name_team',
                    'teamVisitor:id,name_team',
                    'matchResult',
                    'sheet.players',
                ])
                ->where('id_tournament', $tournamentId)
                ->where('phase', $phase)
                ->where('id_fixture', $fixtureId)
                ->where('id_category', $categoryId)
                ->whereHas('sheet', fn (Builder $query) => $query->where('status_sheet', 'closed'));

            $games = $baseQuery->orderBy('date')->orderBy('time')->get()
                ->map(fn (Game $game) => $this->serializeGame($game));
        }

        if ($tournamentId) {
            $teamIds = Game::query()
                ->where('id_tournament', $tournamentId)
                ->get(['id_team_local', 'id_team_visitor'])
                ->flatMap(fn (Game $game) => [$game->id_team_local, $game->id_team_visitor])
                ->unique()
                ->values();
            $teams = Team::query()->whereIn('id', $teamIds)->orderBy('name_team')->get(['id', 'name_team']);

            if ($teamId && ! $teams->contains('id', $teamId)) {
                $teamId = null;
            }
        } else {
            $teamId = null;
        }

        if ($tournamentId && $teamId) {
            $eligiblePlayers = $this->eligiblePlayers($tournamentId, $teamId, $minimum);
        }

        return Inertia::render('MatchReports/Index', [
            'tournaments' => Tournament::query()->orderByDesc('start_date')->get(['id', 'name_tournament']),
            'phases' => Game::PHASES,
            'fixtures' => $fixtures,
            'categories' => $categories,
            'teams' => $teams,
            'games' => $games,
            'eligiblePlayers' => $eligiblePlayers,
            'filters' => [
                'tournament_id' => $tournamentId,
                'phase' => $phase,
                'fixture_id' => $fixtureId,
                'category_id' => $categoryId,
                'team_id' => $teamId,
                'minimum' => $minimum,
            ],
        ]);
    }

    private function filteredGames(Builder $query, int $tournamentId, ?string $phase, ?int $fixtureId = null): Builder
    {
        return $query
            ->where('id_tournament', $tournamentId)
            ->when($phase, fn (Builder $builder) => $builder->where('phase', $phase))
            ->when($fixtureId, fn (Builder $builder) => $builder->where('id_fixture', $fixtureId))
            ->whereHas('sheet', fn (Builder $builder) => $builder->where('status_sheet', 'closed'));
    }

    private function serializeGame(Game $game): array
    {
        $sheet = $game->sheet;
        $presentPlayers = $sheet->players
            ->where('present', true)
            ->sortBy('name_player')
            ->values()
            ->map(fn ($entry) => [
                'player_id' => (int) $entry->player_id,
                'team_id' => (int) $entry->team_id,
                'name_player' => $entry->name_player,
            ]);

        return [
            'id' => (int) $game->id,
            'phase' => $game->phase,
            'phase_label' => Game::PHASES[$game->phase] ?? $game->phase,
            'date' => $game->date?->format('Y-m-d'),
            'time' => $game->time,
            'day_of_week' => $game->date?->locale('es')->translatedFormat('l'),
            'fixture' => $game->fixture?->only(['id', 'name_fixture']),
            'category' => $game->category?->only(['id_category', 'name_category', 'genero_category']),
            'team_local' => $game->teamLocal?->only(['id', 'name_team']),
            'team_visitor' => $game->teamVisitor?->only(['id', 'name_team']),
            'sheet' => [
                'venue' => $sheet->venue,
                'referee_name' => $sheet->referee_name,
                'scorekeeper_name' => $sheet->scorekeeper_name,
                'has_present_players' => $presentPlayers->isNotEmpty(),
                'players' => $presentPlayers,
            ],
            'match_result' => $game->matchResult?->only([
                'sets_local', 'sets_visitor',
                'set_1_points_local', 'set_1_points_visitor',
                'set_2_points_local', 'set_2_points_visitor',
                'set_3_points_local', 'set_3_points_visitor',
            ]),
        ];
    }

    private function eligiblePlayers(int $tournamentId, int $teamId, int $minimum): Collection
    {
        $appearances = GameSheet::query()
            ->where('status_sheet', 'closed')
            ->whereHas('game', fn (Builder $query) => $query
                ->where('id_tournament', $tournamentId)
                ->where('phase', 'regular'))
            ->whereHas('players', fn (Builder $query) => $query
                ->where('team_id', $teamId)
                ->where('present', true))
            ->with(['players' => fn ($query) => $query
                ->where('team_id', $teamId)
                ->where('present', true)])
            ->get(['id', 'game_id']);

        $counts = $appearances
            ->flatMap(fn (GameSheet $sheet) => $sheet->players->map(fn ($player) => [
                'player_id' => (int) $player->player_id,
                'game_id' => (int) $sheet->game_id,
                'name_player' => $player->name_player,
                'dni_player' => $player->dni_player,
            ]))
            ->unique(fn (array $row) => $row['player_id'].':'.$row['game_id'])
            ->groupBy('player_id')
            ->map(fn (Collection $rows) => [
                'player_id' => $rows->first()['player_id'],
                'name_player' => $rows->first()['name_player'],
                'dni_player' => $rows->first()['dni_player'],
                'matches_played' => $rows->count(),
            ])
            ->filter(fn (array $player) => $player['matches_played'] >= $minimum)
            ->sortBy('name_player')
            ->values();

        return $counts;
    }
}
