<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Delegate;
use App\Models\Game;
use App\Models\Player;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\Trainer;
use App\Services\TeamRegistrationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class TournamentTeamController extends Controller
{
    public function select()
    {
        return Inertia::render('Teams/SelectTournament', ['tournaments' => Tournament::orderByDesc('start_date')->get(['id', 'name_tournament'])]);
    }

    private function context(Tournament $tournament, Category $category, ?Team $team = null): void
    {
        abort_unless($tournament->categories()->whereKey($category->getKey())->exists(), 404);
        if ($team) {
            abort_unless((int) $team->id_tournament === (int) $tournament->id && (int) $team->id_category === (int) $category->getKey(), 404);
        }
    }

    public function index(Tournament $tournament, Category $category)
    {
        $this->context($tournament, $category);

        return Inertia::render('Teams/TournamentIndex', [
            'tournament' => $tournament, 'category' => $category,
            'teams' => Team::where('id_tournament', $tournament->id)->where('id_category', $category->getKey())->with('category')->orderBy('name_team')->get(),
        ]);
    }

    private function teamPageContext(Tournament $tournament, Category $category, Team $team): array
    {
        $this->context($tournament, $category, $team);
        $teamsUrl = route('tournaments.teams.index', [$tournament, $category], false);

        return ['team' => $team->only(['id', 'name_team']), 'teamsUrl' => $teamsUrl, 'teamUrl' => "$teamsUrl/$team->id"];
    }

    public function players(Tournament $tournament, Category $category, Team $team)
    {
        $props = $this->teamPageContext($tournament, $category, $team);
        $trainer = $team->trainer;
        $props['team']['trainer'] = $trainer ? [
            ...$trainer->only(['name_trainer', 'dni_trainer']),
            'birthdate_trainer' => $trainer->birthdate_trainer?->format('d/m/Y'),
        ] : null;

        return Inertia::render('Players/Index', [
            ...$props, 'players' => $team->players()->orderBy('name_player')->get(),
        ]);
    }

    public function playerForm(Tournament $tournament, Category $category, Team $team, ?Player $player = null)
    {
        $props = $this->teamPageContext($tournament, $category, $team);
        abort_if($player && (int) $player->id_team !== $team->id, 404);

        return $player
            ? Inertia::render('Players/Edit', [...$props, 'player' => $player])
            : Inertia::render('Players/Create', $props);
    }

    public function savePlayer(Request $request, Tournament $tournament, Category $category, Team $team, TeamRegistrationService $service, ?Player $player = null)
    {
        $this->context($tournament, $category, $team);
        abort_if($player && (int) $player->id_team !== $team->id, 404);

        DB::transaction(function () use ($request, $tournament, $category, $team, $service, $player) {
            Tournament::whereKey($tournament->id)->lockForUpdate()->firstOrFail();
            $team->refresh();
            $players = $team->players()->get()->keyBy('id')->map(fn (Player $row) => $row->toArray());
            abort_if($player && ! $players->has($player->id), 404);

            if ($request->isMethod('DELETE')) {
                $players->forget($player->id);
            } else {
                $data = $request->validate([
                    'name_player' => 'required|string',
                    'dni_player' => 'required|string',
                    'birthdate_player' => 'required|string',
                ]);
                if ($player) {
                    $players->put($player->id, ['id' => $player->id, ...$data]);
                } else {
                    $players->push($data);
                }
            }

            $service->save($tournament, $category, [
                ...$team->only(['name_team', 'city_team', 'id_delegate', 'id_trainer']),
                'action' => 'draft', 'players' => $players->values()->all(),
            ], $team);
        });

        return redirect()->route('tournaments.teams.players.index', [$tournament, $category, $team]);
    }

    public function delegate(Tournament $tournament, Category $category, Team $team)
    {
        $props = $this->teamPageContext($tournament, $category, $team);

        return Inertia::render('Teams/Delegate', [
            ...$props, 'delegate' => $team->delegate,
            'availableDelegates' => Delegate::where('id_tournament', $tournament->id)
                ->where('id_delegate', '!=', $team->id_delegate)->orderBy('name_delegate')->get(),
        ]);
    }

    public function saveDelegate(Request $request, Tournament $tournament, Category $category, Team $team, TeamRegistrationService $service)
    {
        $this->context($tournament, $category, $team);

        DB::transaction(function () use ($request, $tournament, $category, $team, $service) {
            Tournament::whereKey($tournament->id)->lockForUpdate()->firstOrFail();
            $team->refresh();
            $previous = $team->delegate;
            $staff = $request->isMethod('DELETE')
                ? ['id_delegate' => $request->validate(['replacement_delegate_id' => 'required|integer|not_in:'.$team->id_delegate])['replacement_delegate_id']]
                : ['delegate' => $request->only(['name_delegate', 'dni_delegate', 'email_delegate', 'phone_delegate'])];

            $service->save($tournament, $category, [
                ...$team->only(['name_team', 'city_team', 'id_trainer']), ...$staff,
                'action' => 'draft', 'players' => $team->players()->get()->toArray(),
            ], $team);

            if ($request->isMethod('DELETE') && $previous && ! Team::where('id_delegate', $previous->getKey())->exists()) {
                $previous->delete();
            }
        });

        return redirect()->route('tournaments.teams.delegate.show', [$tournament, $category, $team]);
    }

    public function create(Tournament $tournament, Category $category)
    {
        return $this->form($tournament, $category);
    }

    public function edit(Tournament $tournament, Category $category, Team $team)
    {
        return $this->form($tournament, $category, $team);
    }

    private function form(Tournament $tournament, Category $category, ?Team $team = null)
    {
        $this->context($tournament, $category, $team);

        return Inertia::render('Teams/Registration', [
            'tournament' => $tournament, 'category' => $category,
            'team' => $team?->load(['delegate', 'trainer', 'players']),
            'saved' => session('success'),
            'delegates' => Delegate::where('id_tournament', $tournament->id)->orderBy('name_delegate')->get(),
            'trainers' => Trainer::where('id_tournament', $tournament->id)->orderBy('name_trainer')->get(),
        ]);
    }

    public function store(Request $request, Tournament $tournament, Category $category, TeamRegistrationService $service)
    {
        $team = $service->save($tournament, $category, $request->all());

        return redirect()->route('tournaments.teams.edit', [$tournament, $category, $team])->with('success', 'Equipo guardado.');
    }

    public function update(Request $request, Tournament $tournament, Category $category, Team $team, TeamRegistrationService $service)
    {
        $this->context($tournament, $category, $team);
        if ($request->has('id_category') && (int) $request->input('id_category') !== (int) $category->getKey()) {
            return back()->withErrors(['id_category' => 'El equipo pertenece a una sola categoría y no puede cambiarse desde esta inscripción.']);
        }
        $service->save($tournament, $category, $request->all(), $team);

        return redirect()->route('tournaments.teams.edit', [$tournament, $category, $team])->with('success', 'Equipo guardado.');
    }

    public function confirm(Tournament $tournament, Category $category, Team $team, TeamRegistrationService $service)
    {
        $this->context($tournament, $category, $team);
        $service->confirm($team);

        return back()->with('success', 'Inscripción confirmada.');
    }

    public function destroy(Tournament $tournament, Category $category, Team $team)
    {
        $this->context($tournament, $category, $team);
        if (Game::where('id_team_local', $team->id)->orWhere('id_team_visitor', $team->id)->exists()
            || DB::table('playoff_matches')->where('team_a_id', $team->id)->orWhere('team_b_id', $team->id)->exists()
            || $team->availabilities()->exists()) {
            return back()->withErrors(['team' => 'El equipo tiene actividad deportiva y no puede eliminarse.']);
        }
        $team->delete();

        return redirect()->route('tournaments.teams.index', [$tournament, $category]);
    }

    public function legacy(Request $request)
    {
        $team = $request->route('team');
        if (is_numeric($team)) {
            $team = Team::findOrFail($team);
        }
        $playerId = $request->route('player');
        if ($team instanceof Team && is_numeric($playerId)) {
            abort_unless($team->players()->whereKey($playerId)->exists(), 404);
        }
        if (! $team instanceof Team) {
            $player = $request->route('player');
            if (is_numeric($player)) {
                $player = Player::findOrFail($player);
            }
            if ($player instanceof Player) {
                $team = $player->team;
            }
        }
        foreach (['delegate', 'trainer'] as $type) {
            $id = $request->route($type);
            if (is_numeric($id)) {
                $team = Team::where("id_$type", $id)->whereNotNull('id_tournament')->first();
            }
        }
        if ($team instanceof Team && $team->id_tournament) {
            if ($request->query('tournament') && (int) $request->query('tournament') !== (int) $team->id_tournament) {
                abort(404);
            }

            return redirect()->route('tournaments.teams.edit', [$team->id_tournament, $team->id_category, $team]);
        }

        return redirect()->route('teams.index');
    }

    public function legacyWrite()
    {
        throw ValidationException::withMessages(['team' => 'Usá el formulario de equipos dentro del torneo y la categoría para guardar los datos.']);
    }
}
