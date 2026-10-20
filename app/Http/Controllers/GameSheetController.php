<?php

namespace App\Http\Controllers;

use App\Models\Game;
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

class GameSheetController extends Controller
{
    public function show(Game $game): Response
    {
        Gate::authorize('view', $game);

        $game->load([
            'tournament',
            'fixture',
            'teamLocal.players',
            'teamVisitor.players',
            'matchResult',
            'sheet.players',
        ]);

        $sheet = $game->sheet;
        $entries = $sheet ? $sheet->players->keyBy('player_id') : collect();

        return Inertia::render('Games/Scoresheet', [
            'game' => $game,
            'sheet' => $sheet ? $sheet->only(['id', 'status_sheet', 'venue', 'referee_name', 'scorekeeper_name', 'observations', 'closed_at']) : null,
            'localPlayers' => $this->sidePlayers($game->teamLocal, $entries),
            'visitorPlayers' => $this->sidePlayers($game->teamVisitor, $entries),
        ]);
    }

    public function update(Request $request, Game $game): RedirectResponse
    {
        Gate::authorize('update', $game);

        $sheet = $game->sheet;

        if ($sheet && $sheet->isClosed()) {
            return redirect()->back()->withErrors([
                'sheet' => 'La planilla está cerrada y no se puede modificar.',
            ]);
        }

        $data = $request->validate([
            'venue' => ['nullable', 'string', 'max:255'],
            'referee_name' => ['nullable', 'string', 'max:255'],
            'scorekeeper_name' => ['nullable', 'string', 'max:255'],
            'observations' => ['nullable', 'string'],
            'players' => ['sometimes', 'array'],
            'players.*.player_id' => ['required', 'integer', 'exists:players,id'],
            'players.*.present' => ['boolean'],
        ]);

        $participatingTeamIds = [(int) $game->id_team_local, (int) $game->id_team_visitor];
        $teamPlayers = Player::query()
            ->whereIn('id_team', $participatingTeamIds)
            ->get();
        $sheet = $game->sheet()->with('players')->first();
        $existingEntries = $sheet?->players->keyBy('player_id') ?? collect();
        $playerSnapshots = $teamPlayers->mapWithKeys(
            fn (Player $player) => [(int) $player->id => [
                'name_player' => $player->name_player,
                'dni_player' => $player->dni_player,
            ]]
        );
        // The same players.id_team relation populates the two lists shown by the sheet.
        $allowedTeamByPlayer = $teamPlayers->mapWithKeys(
            fn (Player $player) => [(int) $player->id => (int) $player->id_team]
        );

        // Keep legitimate historical sheet rows selectable even when the current roster changed.
        foreach ($sheet?->players ?? collect() as $entry) {
            $historicalTeamId = (int) $entry->team_id;
            if (in_array($historicalTeamId, $participatingTeamIds, true)) {
                $allowedTeamByPlayer[(int) $entry->player_id] = $historicalTeamId;
            }
        }

        $submittedPlayers = collect($data['players'] ?? []);
        $submittedIds = $submittedPlayers->pluck('player_id');
        $invalid = $submittedIds->duplicates()->isNotEmpty()
            || $submittedPlayers->contains(function (array $item) use ($allowedTeamByPlayer, $participatingTeamIds) {
                $playerId = (int) $item['player_id'];
                $expectedTeam = $allowedTeamByPlayer->get($playerId);

                return $expectedTeam === null
                    || ! in_array((int) $expectedTeam, $participatingTeamIds, true);
            });

        if ($invalid) {
            throw ValidationException::withMessages([
                'players' => 'Solo se pueden incluir jugadoras de la lista de buena fe.',
            ]);
        }

        DB::transaction(function () use ($game, $data, $submittedPlayers, $allowedTeamByPlayer, $playerSnapshots, $existingEntries, &$sheet) {
            $sheet = $game->sheet()->firstOrCreate(
                ['game_id' => $game->id],
                ['opened_by' => auth()->id()]
            );

            $sheet->update([
                'venue' => $data['venue'] ?? null,
                'referee_name' => $data['referee_name'] ?? null,
                'scorekeeper_name' => $data['scorekeeper_name'] ?? null,
                'observations' => $data['observations'] ?? null,
            ]);

            $players = Player::whereIn('id', $submittedPlayers->pluck('player_id'))
                ->get()
                ->keyBy('id');

            $submittedPlayers->each(function (array $item) use ($sheet, $players, $allowedTeamByPlayer, $playerSnapshots, $existingEntries) {
                $player = $players->get((int) $item['player_id']);
                $snapshot = $existingEntries->get($player->id) ?? $playerSnapshots->get($player->id) ?? [
                    'name_player' => $player->name_player,
                    'dni_player' => $player->dni_player,
                ];

                $sheet->players()->updateOrCreate(
                    ['player_id' => $player->id],
                    [
                        'team_id' => $allowedTeamByPlayer->get($player->id),
                        'name_player' => $snapshot['name_player'],
                        'dni_player' => $snapshot['dni_player'],
                        'present' => (bool) ($item['present'] ?? false),
                    ]
                );
            });
        });

        return redirect()->route('games.sheet.show', $game);
    }

    public function close(Request $request, Game $game): RedirectResponse
    {
        Gate::authorize('close', $game);

        $sheet = $game->sheet;

        if (! $sheet) {
            return redirect()->back()->withErrors([
                'sheet' => 'Primero guardá la planilla antes de cerrarla.',
            ]);
        }

        if (! $sheet->isClosed()) {
            DB::transaction(function () use ($game, $sheet) {
                $sheet->update([
                    'status_sheet' => 'closed',
                    'closed_by' => auth()->id(),
                    'closed_at' => now(),
                ]);

                $game->update([
                    'status_game' => 'finished',
                    'result' => 'finished',
                ]);
            });
        }

        return redirect()->route('games.sheet.show', $game);
    }

    private function sidePlayers(?Team $team, Collection $entries): array
    {
        if (! $team) {
            return [];
        }

        $teamPlayers = $team->players;
        $knownIds = $teamPlayers->pluck('id');

        $rows = $teamPlayers
            ->sortBy('name_player')
            ->map(fn (Player $player) => [
                'player_id' => $player->id,
                'name_player' => $player->name_player,
                'dni_player' => $player->dni_player,
                'birthdate_player' => $player->birthdate_player?->format('Y-m-d'),
                'present' => (bool) ($entries->get($player->id)?->present ?? false),
            ])
            ->values();

        // Conservamos filas guardadas de planillas viejas que ya no están en la lista.
        $orphans = $entries
            ->where('team_id', $team->id)
            ->filter(fn ($entry) => ! $knownIds->contains($entry->player_id))
            ->map(fn ($entry) => [
                'player_id' => $entry->player_id,
                'name_player' => $entry->name_player,
                'dni_player' => $entry->dni_player,
                'birthdate_player' => null,
                'present' => (bool) $entry->present,
            ])
            ->values();

        return $rows->concat($orphans)->values()->all();
    }
}
