<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Delegate;
use App\Models\Player;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\Trainer;
use App\Support\TournamentPeople;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class LegacyTournamentRecovery
{
    public function report(array $manual = []): array
    {
        $assignments = [];
        $pending = [];
        $conflicts = [];
        $identities = [];
        foreach ($manual as $team => $tournaments) {
            if (! Team::whereNull('id_tournament')->whereKey($team)->exists()) {
                $conflicts[] = "Equipo $team: no existe o ya tiene torneo asignado.";
            }
            foreach ($tournaments as $id) {
                if (! Tournament::whereKey($id)->exists()) {
                    $conflicts[] = "Torneo $id inexistente.";
                }
            }
        }
        foreach (Team::whereNull('id_tournament')->get() as $team) {
            $ids = collect($manual[$team->id] ?? []);
            foreach (['id_team_local', 'id_team_visitor', 'forfeit_team_id'] as $field) {
                $ids = $ids->merge(DB::table('games')->where($field, $team->id)->pluck('id_tournament'));
            }
            foreach (['team_a_id', 'team_b_id'] as $field) {
                $ids = $ids->merge(DB::table('playoff_matches')->where($field, $team->id)->pluck('tournament_id'));
            }
            $ids = $ids->merge(DB::table('team_availabilities as a')->join('fixtures as f', 'f.id', '=', 'a.id_fixture')->where('a.id_team', $team->id)->pluck('f.id_tournament'));
            $ids = $ids->merge(DB::table('match_rosters as r')->join('games as g', 'g.id', '=', 'r.game_id')->where('r.team_id', $team->id)->pluck('g.id_tournament'));
            $ids = $ids->merge(DB::table('game_sheet_players as p')->join('game_sheets as s', 's.id', '=', 'p.game_sheet_id')->join('games as g', 'g.id', '=', 's.game_id')->where('p.team_id', $team->id)->pluck('g.id_tournament'))->unique();
            if ($ids->isEmpty() && ! DB::table('tournament_legacy_links')->where('entity', 'team')->where('source_id', $team->id)->exists()) {
                $pending[] = $team->id;
            }
            foreach ($ids as $id) {
                $assignments[] = ['team' => $team->id, 'tournament' => (int) $id];
                if (! in_array((int) $id, $manual[$team->id] ?? [], true) && ! DB::table('tournament_categories')->where('id_tournament', $id)->where('id_category', $team->id_category)->exists() && ! $this->target('category', $team->id_category, $id)) {
                    $conflicts[] = "Equipo {$team->id}: categoría no vinculada al torneo $id.";
                }
                if (! Category::whereKey($team->id_category)->exists()) {
                    $conflicts[] = "Equipo {$team->id}: categoría inexistente.";
                }
                if (! $team->delegate) {
                    $conflicts[] = "Equipo {$team->id}: delegado inexistente.";
                }
                foreach (['delegate', 'trainer'] as $type) {
                    $person = $team->$type;
                    if (! $person) {
                        continue;
                    }
                    $dni = $person->{"dni_$type"};
                    if ($dni === null) {
                        continue;
                    }
                    $dni = TournamentPeople::dni($dni);
                    $key = "$type:$id:$dni";
                    if (isset($identities[$key]) && $identities[$key] !== $person->getKey()) {
                        $conflicts[] = "DNI $dni de $type repetido en el torneo $id.";
                    }
                    $identities[$key] = $person->getKey();
                    $class = $type === 'delegate' ? Delegate::class : Trainer::class;
                    $existing = $class::where('id_tournament', $id)->where("dni_$type", $dni)->first();
                    if ($existing && $this->target($type, $person->getKey(), $id) !== $existing->getKey()) {
                        $conflicts[] = "DNI $dni de $type ya asignado en el torneo $id.";
                    }
                }
                $players = $this->sourcePlayers($team, (int) $id);
                foreach ($players as $player) {
                    $dni = TournamentPeople::dni($player->dni_player);
                    $key = "$id:$dni";
                    if (isset($identities[$key]) && $identities[$key] !== [$team->id, $player->id]) {
                        $conflicts[] = "DNI $dni repetido en el torneo $id: revisar equipos y referencias históricas.";
                    }
                    $identities[$key] = [$team->id, $player->id];
                    $existing = Player::withTrashed()->where('id_tournament', $id)->where('dni_player', $dni)->first();
                    if ($existing && $this->target('player', $player->id, $id) !== $existing->id) {
                        $conflicts[] = "DNI $dni ya asignado en el torneo $id.";
                    }
                }
            }
        }

        return ['assignments' => $assignments, 'pending_team_ids' => $pending, 'conflicts' => array_values(array_unique($conflicts))];
    }

    private function sourcePlayers(Team $team, int $tournament)
    {
        $ids = DB::table('players')->where('id_team', $team->id)->pluck('id');
        $ids = $ids->merge(DB::table('game_sheet_players as p')->join('game_sheets as s', 's.id', '=', 'p.game_sheet_id')->join('games as g', 'g.id', '=', 's.game_id')->where('g.id_tournament', $tournament)->where('p.team_id', $team->id)->pluck('p.player_id'));
        $ids = $ids->merge(DB::table('match_roster_players as p')->join('match_rosters as r', 'r.id', '=', 'p.match_roster_id')->join('games as g', 'g.id', '=', 'r.game_id')->where('g.id_tournament', $tournament)->where('p.team_id', $team->id)->pluck('p.player_id'));

        return Player::withTrashed()->whereIn('id', $ids->unique())->get();
    }

    private function target(string $entity, int $source, int $tournament): ?int
    {
        $id = DB::table('tournament_legacy_links')->where(['entity' => $entity, 'source_id' => $source, 'id_tournament' => $tournament])->value('target_id');

        return $id === null ? null : (int) $id;
    }

    private function remember(string $entity, int $source, int $tournament, int $target): void
    {
        DB::table('tournament_legacy_links')->insert(['entity' => $entity, 'source_id' => $source, 'id_tournament' => $tournament, 'target_id' => $target]);
    }

    private function person(string $type, $source, int $tournament, ?int $team = null)
    {
        $class = match ($type) {
            'delegate' => Delegate::class, 'trainer' => Trainer::class, default => Player::class
        };
        if ($id = $this->target($type, $source->getKey(), $tournament)) {
            return $class::withoutGlobalScopes()->findOrFail($id);
        }
        $copy = $source->replicate();
        $copy->id_tournament = $tournament;
        $field = "dni_$type";
        if ($copy->$field !== null) {
            $copy->$field = TournamentPeople::dni($copy->$field);
        }
        if ($type === 'player') {
            $copy->id_team = $team;
        }
        $copy->save();
        $this->remember($type, $source->getKey(), $tournament, $copy->getKey());

        return $copy;
    }

    public function apply(array $manual = []): array
    {
        return DB::transaction(function () use ($manual) {
            Tournament::orderBy('id')->lockForUpdate()->get();
            $report = $this->report($manual);
            if ($report['conflicts']) {
                throw new RuntimeException(implode("\n", $report['conflicts']));
            }
            foreach (Tournament::with('categories')->get() as $tournament) {
                foreach ($tournament->categories as $source) {
                    if ((int) $source->id_tournament === (int) $tournament->id) {
                        continue;
                    }
                    $id = $this->target('category', $source->getKey(), $tournament->id);
                    if (! $id) {
                        $copy = app(TournamentCategoryService::class)->attach($tournament, $source, ['number_matches' => $source->pivot->number_matches, 'number_teams' => $source->pivot->number_teams]);
                        $id = $copy->getKey();
                        $this->remember('category', $source->getKey(), $tournament->id, $id);
                    }
                    DB::table('games')->where('id_tournament', $tournament->id)->where('id_category', $source->getKey())->update(['id_category' => $id]);
                    DB::table('playoff_brackets')->where('tournament_id', $tournament->id)->where('category_id', $source->getKey())->update(['category_id' => $id]);
                    $tournament->categories()->detach($source->getKey());
                }
            }
            foreach ($report['assignments'] as $assignment) {
                $source = Team::findOrFail($assignment['team']);
                $tid = $assignment['tournament'];
                if ($this->target('team', $source->id, $tid)) {
                    continue;
                }
                $category = $this->target('category', $source->id_category, $tid);
                if (! $category) {
                    $original = Category::findOrFail($source->id_category);
                    if ((int) $original->id_tournament === $tid) {
                        $category = $original->getKey();
                    } else {
                        $category = app(TournamentCategoryService::class)->attach(Tournament::findOrFail($tid), $original)->getKey();
                        $this->remember('category', $original->getKey(), $tid, $category);
                    }
                }
                $delegate = $this->person('delegate', $source->delegate, $tid);
                $trainer = $source->trainer ? $this->person('trainer', $source->trainer, $tid) : null;
                $copy = $source->replicate();
                $copy->fill(['id_tournament' => $tid, 'id_category' => $category, 'id_delegate' => $delegate->getKey(), 'id_trainer' => $trainer?->getKey(), 'legacy_source_id' => $source->id, 'registration_status' => 'legacy_review']);
                $copy->save();
                $this->remember('team', $source->id, $tid, $copy->id);
                foreach ($this->sourcePlayers($source, $tid) as $player) {
                    $new = $this->person('player', $player, $tid, $copy->id);
                    foreach (['game_sheet_players' => ['game_sheets', 'game_sheet_id'], 'match_roster_players' => ['match_rosters', 'match_roster_id']] as $table => [$parent, $foreign]) {
                        $parents = DB::table($parent)->whereIn('game_id', DB::table('games')->where('id_tournament', $tid)->select('id'))->select('id');
                        DB::table($table)->whereIn($foreign, $parents)->where('team_id', $source->id)->where('player_id', $player->id)->update(['player_id' => $new->id, 'team_id' => $copy->id]);
                    }
                }
                foreach (['id_team_local', 'id_team_visitor', 'forfeit_team_id'] as $field) {
                    DB::table('games')->where('id_tournament', $tid)->where($field, $source->id)->update([$field => $copy->id]);
                }
                foreach (['team_a_id', 'team_b_id'] as $field) {
                    DB::table('playoff_matches')->where('tournament_id', $tid)->where($field, $source->id)->update([$field => $copy->id]);
                }
                DB::table('match_rosters')->whereIn('game_id', DB::table('games')->where('id_tournament', $tid)->select('id'))->where('team_id', $source->id)->update(['team_id' => $copy->id]);
                DB::table('team_availabilities')->whereIn('id_fixture', DB::table('fixtures')->where('id_tournament', $tid)->select('id'))->where('id_team', $source->id)->update(['id_team' => $copy->id]);
            }

            return $report;
        });
    }
}
