<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\MatchRoster;
use App\Models\Player;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class MatchRosterController extends Controller
{
    public function edit(Game $game, Team $team): Response
    {
        $this->ensureTeamBelongsToGame($game, $team);

        $roster = $this->resolveRoster($game, $team);

        Gate::authorize('view', $roster);

        return Inertia::render('Games/Roster', [
            'game' => $game->load(['tournament', 'teamLocal', 'teamVisitor']),
            'team' => $team->only(['id', 'name_team']),
            'players' => $this->teamPlayers($team, $roster->players),
            'submittedAt' => $roster->submitted_at?->toIso8601String(),
            'isLocked' => $game->hasStarted(),
        ]);
    }

    public function update(Request $request, Game $game, Team $team): RedirectResponse
    {
        $this->ensureTeamBelongsToGame($game, $team);

        $roster = $this->resolveRoster($game, $team);

        Gate::authorize('update', $roster);

        $data = $request->validate([
            'players' => ['present', 'array'],
            'players.*' => ['integer', 'exists:players,id'],
        ]);

        $allowedIds = $team->players()->pluck('id');
        $selected = collect($data['players'] ?? [])->unique()->values();

        $invalid = $selected->diff($allowedIds);

        if ($invalid->isNotEmpty()) {
            throw ValidationException::withMessages([
                'players' => 'Solo se pueden convocar jugadoras del equipo.',
            ]);
        }

        DB::transaction(function () use ($game, $team, $selected) {
            $roster = $game->rosters()->updateOrCreate(
                ['team_id' => $team->id],
                [
                    'submitted_by' => auth()->id(),
                    'submitted_at' => now(),
                ]
            );

            $roster->players()->delete();

            $players = Player::whereIn('id', $selected)->get()->keyBy('id');

            $rows = $selected->map(function (int $playerId) use ($players, $team) {
                $player = $players->get($playerId);

                return [
                    'player_id' => $player->id,
                    'team_id' => $team->id,
                    'name_player' => $player->name_player,
                    'dni_player' => $player->dni_player,
                ];
            })->all();

            $roster->players()->createMany($rows);
        });

        return redirect()->route('games.show', $game);
    }

    private function ensureTeamBelongsToGame(Game $game, Team $team): void
    {
        $isMatchTeam = in_array(
            $team->id,
            [$game->id_team_local, $game->id_team_visitor],
            true
        );

        abort_unless($isMatchTeam, 404);
    }

    private function resolveRoster(Game $game, Team $team): MatchRoster
    {
        $roster = $game->rosters()
            ->where('team_id', $team->id)
            ->with('players')
            ->first();

        if (! $roster) {
            $roster = new MatchRoster([
                'game_id' => $game->id,
                'team_id' => $team->id,
            ]);

            $roster->setRelation('players', collect());
        }

        $roster->setRelation('game', $game);

        return $roster;
    }

    private function teamPlayers(Team $team, Collection $entries): array
    {
        $selected = $entries->pluck('player_id');

        return $team->players()
            ->orderBy('name_player')
            ->get()
            ->map(fn (Player $player) => [
                'player_id' => $player->id,
                'name_player' => $player->name_player,
                'dni_player' => $player->dni_player,
                'birthdate_player' => $player->birthdate_player?->format('Y-m-d'),
                'convocada' => $selected->contains($player->id),
            ])
            ->values()
            ->all();
    }
}
