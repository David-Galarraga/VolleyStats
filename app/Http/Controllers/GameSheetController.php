<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\GameSheetPlayer;
use App\Models\MatchRoster;
use App\Models\Result;
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
            'rosters.players',
            'matchResult',
            'sheet.players',
            'planilleros:id_user,name_user,email',
            'forfeitTeam',
        ]);

        $localRoster = $game->rosters->firstWhere('team_id', (int) $game->id_team_local);
        $visitorRoster = $game->rosters->firstWhere('team_id', (int) $game->id_team_visitor);

        $sheet = $game->sheet;
        $entries = $sheet ? $sheet->players->keyBy('player_id') : collect();

        $sheetData = $sheet ? $sheet->only(['id', 'status_sheet', 'venue', 'referee_name', 'scorekeeper_name', 'observations', 'closed_at', 'local_absent', 'visitor_absent']) : null;

        if ($sheetData) {
            $sheetData['local_absent'] = (bool) ($sheetData['local_absent'] ?? false);
            $sheetData['visitor_absent'] = (bool) ($sheetData['visitor_absent'] ?? false);
        }

        $gameArray = $game->toArray();
        $gameArray['forfeit_team_id'] = $game->forfeit_team_id;
        $gameArray['forfeit_type'] = $game->forfeit_type;
        $gameArray['suspended'] = (bool) $game->suspended;
        if ($game->relationLoaded('forfeitTeam') && $game->forfeitTeam) {
            $gameArray['forfeit_team'] = $game->forfeitTeam;
        }

        return Inertia::render('Games/Scoresheet', [
            'game' => $gameArray,
            'sheet' => $sheetData,
            'localPlayers' => $this->sidePlayers($game->teamLocal, $entries, $localRoster),
            'visitorPlayers' => $this->sidePlayers($game->teamVisitor, $entries, $visitorRoster),
            'planilleros' => $game->planilleros,
            'rostersReady' => $this->rostersReady($localRoster, $visitorRoster),
        ]);
    }

    public function update(Request $request, Game $game): RedirectResponse
    {
        Gate::authorize('update', $game);

        $sheet = $game->sheet()->with('players')->first();

        if ($sheet && $sheet->isClosed()) {
            return redirect()->back()->withErrors([
                'sheet' => 'La planilla está cerrada y no se puede modificar.',
            ]);
        }

        $data = $request->validate([
            'venue' => ['nullable', 'string', 'max:255'],
            'referee_name' => ['nullable', 'string', 'max:255'],
            'observations' => ['nullable', 'string'],
            'players' => ['sometimes', 'array'],
            'players.*.player_id' => ['required', 'integer', 'exists:players,id'],
            'players.*.present' => ['boolean'],
            'local_absent' => ['sometimes', 'boolean'],
            'visitor_absent' => ['sometimes', 'boolean'],
            'suspended' => ['sometimes', 'boolean'],
        ]);

        $localAbsent = (bool) ($data['local_absent'] ?? false);
        $visitorAbsent = (bool) ($data['visitor_absent'] ?? false);
        $suspended = (bool) ($data['suspended'] ?? false);

        if ($localAbsent && $visitorAbsent) {
            $suspended = true;
            $localAbsent = false;
            $visitorAbsent = false;
        }

        if ($suspended && ($localAbsent || $visitorAbsent)) {
            return redirect()->back()->withErrors([
                'sheet' => 'Los estados "Partido suspendido" y "Equipo ausente" son mutuamente excluyentes.',
            ]);
        }

        if (($localAbsent || $visitorAbsent) && ! $suspended) {
            $obs = trim((string) ($data['observations'] ?? ''));
            if ($obs === '') {
                throw ValidationException::withMessages([
                    'observations' => 'Debés aclarar el motivo en observaciones cuando hay un equipo ausente.',
                ]);
            }
        }

        if ($sheet) {
            if ($sheet->local_absent || $sheet->visitor_absent || $game->suspended) {
                return redirect()->back()->withErrors([
                    'sheet' => 'No se puede modificar el estado de partido suspendido o equipo ausente una vez guardado.',
                ]);
            }
        } elseif ($game->suspended || $game->forfeit_type) {
            return redirect()->back()->withErrors([
                'sheet' => 'No se puede modificar el estado de partido suspendido o equipo ausente.',
            ]);
        }

        $participatingTeamIds = [(int) $game->id_team_local, (int) $game->id_team_visitor];
        $rosters = $game->rosters()->with('players')->get()->keyBy('team_id');
        $localRoster = $rosters->get((int) $game->id_team_local);
        $visitorRoster = $rosters->get((int) $game->id_team_visitor);

        if (! $localRoster || ! $visitorRoster
            || $localRoster->players->isEmpty()
            || $visitorRoster->players->isEmpty()) {
            throw ValidationException::withMessages([
                'players' => 'Primero deben cargarse las listas de buena fe de ambos equipos.',
            ]);
        }

        $teamPlayers = $localRoster->players->concat($visitorRoster->players);
        $sheet = $game->sheet()->with('players')->first();
        $existingEntries = $sheet?->players->keyBy('player_id') ?? collect();
        $playerSnapshots = $teamPlayers->mapWithKeys(
            fn ($player) => [(int) $player->player_id => [
                'name_player' => $player->name_player,
                'dni_player' => $player->dni_player,
            ]]
        );
        $allowedTeamByPlayer = $teamPlayers->mapWithKeys(
            fn ($player) => [(int) $player->player_id => (int) $player->team_id]
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

        DB::transaction(function () use ($game, $data, $submittedPlayers, $allowedTeamByPlayer, $playerSnapshots, $existingEntries, &$sheet, $localAbsent, $visitorAbsent, $suspended) {
            $sheet = $game->sheet()->firstOrCreate(
                ['game_id' => $game->id],
                ['opened_by' => auth()->id()]
            );

            $observations = $data['observations'] ?? $sheet->observations;
            if ($suspended && stripos((string) $observations, 'partido suspendido') === false) {
                $observations = trim(((string) $observations) . "\npartido suspendido");
            } elseif ($localAbsent && stripos((string) $observations, 'equipo ausente') === false) {
                $observations = trim(((string) $observations) . "\nEquipo ausente");
            } elseif ($visitorAbsent && stripos((string) $observations, 'equipo ausente') === false) {
                $observations = trim(((string) $observations) . "\nEquipo ausente");
            }

            $sheet->update([
                'venue' => isset($data['venue']) ? trim($data['venue']) : null,
                'referee_name' => isset($data['referee_name']) ? trim($data['referee_name']) : null,
                'observations' => $observations,
                'local_absent' => $localAbsent,
                'visitor_absent' => $visitorAbsent,
            ]);

            $game->update([
                'suspended' => $suspended,
                'suspension_reason' => $suspended ? 'partido suspendido' : $game->suspension_reason,
                'forfeit_type' => ($localAbsent || $visitorAbsent) ? 'wo' : $game->forfeit_type,
            ]);

            if ($localAbsent || $visitorAbsent) {
                $absentTeamId = $localAbsent ? (int) $game->id_team_local : (int) $game->id_team_visitor;
                $winnerTeamId = $localAbsent ? (int) $game->id_team_visitor : (int) $game->id_team_local;

                $winnerCount = $submittedPlayers->filter(function (array $item) use ($allowedTeamByPlayer, $winnerTeamId) {
                    return ((int) ($allowedTeamByPlayer->get((int) $item['player_id']) ?? 0)) === (int) $winnerTeamId
                        && ! empty($item['present']);
                })->count();

                if ($winnerCount < 6) {
                    throw ValidationException::withMessages([
                        'players' => 'El equipo presente debe tener al menos 6 jugadoras marcadas como presentes para un WO.',
                    ]);
                }

                $game->update([
                    'forfeit_team_id' => $absentTeamId,
                    'forfeit_type' => 'wo',
                    'suspended' => false,
                ]);
            }

            $submittedPlayers->each(function (array $item) use ($sheet, $allowedTeamByPlayer, $playerSnapshots, $existingEntries) {
                $playerId = (int) $item['player_id'];
                $snapshot = $existingEntries->get($playerId) ?? $playerSnapshots->get($playerId);

                if (! $snapshot) {
                    return;
                }

                $sheet->players()->updateOrCreate(
                    ['player_id' => $playerId],
                    [
                        'team_id' => $allowedTeamByPlayer->get($playerId),
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

        $sheet = $game->sheet()->with('players')->first();

        if (! $sheet) {
            return redirect()->back()->withErrors([
                'sheet' => 'Primero guardá la planilla antes de cerrarla.',
            ]);
        }

        if (! $sheet->isClosed() && (trim((string) $sheet->venue) === '' || trim((string) $sheet->referee_name) === '')) {
            throw ValidationException::withMessages([
                'venue' => 'La cancha es obligatoria para cerrar la planilla.',
                'referee_name' => 'El árbitro es obligatorio para cerrar la planilla.',
            ]);
        }

        if (! $sheet->isClosed()) {
            DB::transaction(function () use ($game, $sheet) {
                $localAbsent = (bool) $sheet->local_absent;
                $visitorAbsent = (bool) $sheet->visitor_absent;
                $suspended = (bool) $game->suspended;

                if ($localAbsent && $visitorAbsent) {
                    $suspended = true;
                    $localAbsent = false;
                    $visitorAbsent = false;
                    $sheet->update(['local_absent' => false, 'visitor_absent' => false]);
                    $game->update(['suspended' => true, 'forfeit_team_id' => null, 'forfeit_type' => null, 'suspension_reason' => 'partido suspendido']);
                }

                if ($suspended) {
                    $observations = (string) ($sheet->observations ?? '');
                    if (stripos($observations, 'partido suspendido') === false) {
                        $sheet->update(['observations' => trim($observations . "\npartido suspendido")]);
                    }
                    $game->update(['suspended' => true, 'status_game' => 'finished', 'result' => 'finished']);
                    $sheet->update([
                        'status_sheet' => 'closed',
                        'closed_by' => auth()->id(),
                        'closed_at' => now(),
                    ]);
                    return;
                }

                if ($localAbsent || $visitorAbsent) {
                    $absentTeamId = $localAbsent ? (int) $game->id_team_local : (int) $game->id_team_visitor;
                    $winnerTeamId = $localAbsent ? (int) $game->id_team_visitor : (int) $game->id_team_local;

                    $entries = $sheet->players->keyBy('player_id');
                    $winnerPresent = $sheet->players->filter(function ($entry) use ($entries, $winnerTeamId) {
                        return (int) $entry->team_id === (int) $winnerTeamId && (bool) $entry->present;
                    })->count();

                    if ($winnerPresent < 6) {
                        throw ValidationException::withMessages([
                            'players' => 'El equipo presente debe tener al menos 6 jugadoras marcadas como presentes para cerrar con WO.',
                        ]);
                    }

                    $observations = (string) ($sheet->observations ?? '');
                    if (stripos($observations, 'equipo ausente') === false && stripos($observations, 'wo') === false) {
                        $observations = trim($observations . "\nEquipo ausente - WO 2-0 (25-0/25-0)");
                        $sheet->update(['observations' => $observations]);
                    }

                    Result::updateOrCreate(
                        ['game_id' => $game->id],
                        [
                            'sets_local' => $winnerTeamId === (int) $game->id_team_local ? 2 : 0,
                            'sets_visitor' => $winnerTeamId === (int) $game->id_team_visitor ? 2 : 0,
                            'set_1_points_local' => $winnerTeamId === (int) $game->id_team_local ? 25 : 0,
                            'set_1_points_visitor' => $winnerTeamId === (int) $game->id_team_visitor ? 25 : 0,
                            'set_2_points_local' => $winnerTeamId === (int) $game->id_team_local ? 25 : 0,
                            'set_2_points_visitor' => $winnerTeamId === (int) $game->id_team_visitor ? 25 : 0,
                            'set_3_points_local' => null,
                            'set_3_points_visitor' => null,
                            'set_4_points_local' => null,
                            'set_4_points_visitor' => null,
                            'set_5_points_local' => null,
                            'set_5_points_visitor' => null,
                        ]
                    );

                    $game->update([
                        'forfeit_team_id' => $absentTeamId,
                        'forfeit_type' => 'wo',
                        'suspended' => false,
                        'status_game' => 'finished',
                        'result' => 'finished',
                        'set_local' => $winnerTeamId === (int) $game->id_team_local ? 2 : 0,
                        'set_visitor' => $winnerTeamId === (int) $game->id_team_visitor ? 2 : 0,
                    ]);
                } else {
                    $localCount = $sheet->players->filter(fn ($e) => (int) $e->team_id === (int) $game->id_team_local && (bool) $e->present)->count();
                    $visitorCount = $sheet->players->filter(fn ($e) => (int) $e->team_id === (int) $game->id_team_visitor && (bool) $e->present)->count();

                    if ($localCount < 6 || $visitorCount < 6) {
                        throw ValidationException::withMessages([
                            'players' => 'Cada equipo debe tener al menos 6 jugadoras marcadas como presentes para cerrar la planilla.',
                        ]);
                    }

                    if (! $game->matchResult) {
                        throw ValidationException::withMessages([
                            'result' => 'Debés cargar el resultado antes de cerrar la planilla.',
                        ]);
                    }
                }

                $sheet->update([
                    'status_sheet' => 'closed',
                    'closed_by' => auth()->id(),
                    'closed_at' => now(),
                ]);

                if (! $game->wasChanged(['status_game', 'result'])) {
                    $game->update([
                        'status_game' => 'finished',
                        'result' => 'finished',
                    ]);
                }
            });
        }

        return redirect()->route('games.sheet.show', $game);
    }

    private function sidePlayers(?Team $team, Collection $entries, ?MatchRoster $roster): array
    {
        if (! $team) {
            return [];
        }

        $rosterPlayers = $roster?->players ?? collect();
        $knownIds = $rosterPlayers->pluck('player_id');

        $rows = $rosterPlayers
            ->sortBy('name_player')
            ->map(fn ($player) => [
                'player_id' => $player->player_id,
                'name_player' => $player->name_player,
                'dni_player' => $player->dni_player,
                'birthdate_player' => null,
                'present' => (bool) ($entries->get($player->player_id)?->present ?? false),
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

    private function rostersReady(?MatchRoster $localRoster, ?MatchRoster $visitorRoster): bool
    {
        return $localRoster !== null
            && $visitorRoster !== null
            && $localRoster->submitted_at !== null
            && $visitorRoster->submitted_at !== null
            && $localRoster->players->isNotEmpty()
            && $visitorRoster->players->isNotEmpty();
    }
}
