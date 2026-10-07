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
            'teamLocal',
            'teamVisitor',
            'referee',
            'matchResult',
            'sheet.players',
        ]);

        $sheet = $game->sheet;
        $entries = $sheet ? $sheet->players->keyBy('player_id') : collect();

        return Inertia::render('Games/Scoresheet', [
            'game' => $game,
            'sheet' => $sheet ? $sheet->only(['id', 'status_sheet', 'venue', 'observations', 'closed_at']) : null,
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
            'observations' => ['nullable', 'string'],
            'players' => ['required', 'array'],
            'players.*.player_id' => ['required', 'integer', 'exists:players,id'],
            'players.*.present' => ['boolean'],
        ]);

        $allowedIds = collect([$game->id_team_local, $game->id_team_visitor])
            ->filter()
            ->flatMap(fn ($teamId) => Player::where('id_team', $teamId)->pluck('id'));

        $invalid = collect($data['players'])
            ->pluck('player_id')
            ->diff($allowedIds);

        if ($invalid->isNotEmpty()) {
            throw ValidationException::withMessages([
                'players' => 'Solo se pueden incluir jugadoras de los equipos del partido.',
            ]);
        }

        DB::transaction(function () use ($game, $data, &$sheet) {
            $sheet = $game->sheet()->firstOrCreate(
                ['game_id' => $game->id],
                ['opened_by' => auth()->id()]
            );

            $sheet->update([
                'venue' => $data['venue'] ?? null,
                'observations' => $data['observations'] ?? null,
            ]);

            $sheet->players()->delete();

            $players = Player::whereIn('id', collect($data['players'])->pluck('player_id'))
                ->get()
                ->keyBy('id');

            $rows = collect($data['players'])->map(function (array $item) use ($players) {
                $player = $players->get($item['player_id']);

                return [
                    'player_id' => $player->id,
                    'team_id' => $player->id_team,
                    'name_player' => $player->name_player,
                    'dni_player' => $player->dni_player,
                    'present' => (bool) ($item['present'] ?? false),
                ];
            });

            $sheet->players()->createMany($rows);
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

                $game->update(['status_game' => 'finished']);
            });
        }

        return redirect()->route('games.sheet.show', $game);
    }

    private function sidePlayers(?Team $team, Collection $entries): array
    {
        if (! $team) {
            return [];
        }

        $players = $team->players()->orderBy('name_player')->get();

        $rows = $players->map(fn (Player $player) => [
            'player_id' => $player->id,
            'name_player' => $player->name_player,
            'dni_player' => $player->dni_player,
            'birthdate_player' => $player->birthdate_player?->format('Y-m-d'),
            'present' => (bool) ($entries->get($player->id)?->present ?? false),
        ]);

        $knownIds = $players->pluck('id');

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
