<?php

namespace App\Http\Controllers;

use App\Models\PlayoffBracket;
use App\Models\PlayoffMatch;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PlayoffMatchController extends Controller
{
    public function store(Request $request, int $tournament, int $category): RedirectResponse
    {
        $data = $request->validate([
            'stage' => ['required', Rule::in(array_keys(PlayoffMatch::STAGES))],
            'cup' => ['required', Rule::in(['gold', 'silver'])],
            'team_a_id' => ['nullable', 'integer', 'different:team_b_id'],
            'team_b_id' => ['nullable', 'integer', 'different:team_a_id'],
            'source_a_type' => ['nullable', Rule::in(['winner', 'loser'])],
            'source_a_match_id' => ['nullable', 'integer'],
            'source_b_type' => ['nullable', Rule::in(['winner', 'loser'])],
            'source_b_match_id' => ['nullable', 'integer'],
        ]);

        if (! DB::table('tournament_categories')->where('id_tournament', $tournament)->where('id_category', $category)->exists()) {
            abort(404);
        }
        $bracket = PlayoffBracket::firstOrCreate(['tournament_id' => $tournament, 'category_id' => $category]);
        foreach (['a', 'b'] as $slot) {
            $teamId = $data["team_{$slot}_id"] ?? null;
            if ($teamId && ! DB::table('teams')->where('id', $teamId)->where('id_category', $category)->exists()) {
                return back()->withErrors(["team_{$slot}_id" => 'El equipo no pertenece a la categoría del prode.']);
            }
            $sourceId = $data["source_{$slot}_match_id"] ?? null;
            if ($sourceId && ! PlayoffMatch::where('id', $sourceId)->where('bracket_id', $bracket->id)->exists()) {
                return back()->withErrors(["source_{$slot}_match_id" => 'El cruce de origen debe pertenecer al mismo prode.']);
            }
            if (($teamId && $sourceId)
                || (($data["source_{$slot}_type"] ?? null) && ! $sourceId)
                || ($sourceId && ! ($data["source_{$slot}_type"] ?? null))) {
                return back()->withErrors(["team_{$slot}_id" => 'Cada lado debe ser un equipo inicial o el resultado de otro cruce.']);
            }
        }

        DB::transaction(function () use ($bracket, $data, $tournament) {
            DB::table('tournaments')->where('id', $tournament)->lockForUpdate()->first();
            $used = PlayoffMatch::where('tournament_id', $tournament)->pluck('code')->all();
            $index = 0;
            do { $code = $this->code($index++); } while (in_array($code, $used, true));
            $bracket->matches()->create([...$data, 'tournament_id' => $tournament, 'code' => $code]);
        });

        return back();
    }

    public function update(Request $request, int $tournament, int $category, int $match): RedirectResponse
    {
        $item = PlayoffMatch::where('tournament_id', $tournament)->whereHas('bracket', fn ($q) => $q->where('category_id', $category))->findOrFail($match);
        $data = $request->validate([
            'stage' => ['required', Rule::in(array_keys(PlayoffMatch::STAGES))],
            'cup' => ['required', Rule::in(['gold', 'silver'])],
            'team_a_id' => ['nullable', 'integer', 'different:team_b_id'],
            'team_b_id' => ['nullable', 'integer', 'different:team_a_id'],
            'source_a_type' => ['nullable', Rule::in(['winner', 'loser'])],
            'source_b_type' => ['nullable', Rule::in(['winner', 'loser'])],
            'source_a_match_id' => ['nullable', 'integer'],
            'source_b_match_id' => ['nullable', 'integer'],
        ]);
        DB::transaction(function () use ($item, $data) {
            $matches = PlayoffMatch::where('bracket_id', $item->bracket_id)->lockForUpdate()->get()->keyBy('id');
            foreach (['a', 'b'] as $slot) {
                $team = $data["team_{$slot}_id"] ?? null;
                $source = $data["source_{$slot}_match_id"] ?? null;
                $type = $data["source_{$slot}_type"] ?? null;
                $invalid = ($team && $source) || ((bool) $source !== (bool) $type);
                if ($team && ! DB::table('teams')->where('id', $team)->where('id_category', $item->bracket->category_id)->exists()) $invalid = true;
                $pending = $source ? [$source] : []; $seen = [];
                while ($pending) {
                    $id = array_pop($pending);
                    if ($id == $item->id || ! isset($matches[$id])) { $invalid = true; break; }
                    if (isset($seen[$id])) continue;
                    $seen[$id] = true;
                    foreach (['source_a_match_id', 'source_b_match_id'] as $key) if ($matches[$id]->$key) $pending[] = $matches[$id]->$key;
                }
                if ($invalid) throw \Illuminate\Validation\ValidationException::withMessages(["team_{$slot}_id" => 'Equipo u origen inv?lido; no se permiten ciclos.']);
            }
            $keys = ['team_a_id', 'team_b_id', 'source_a_type', 'source_b_type', 'source_a_match_id', 'source_b_match_id'];
            $item->fill($data);
            $game = $item->game;
            if ($game && $item->isDirty($keys) && ($game->matchResult || $game->sheet || $game->rosters()->exists() || $game->forfeit_team_id)) throw \Illuminate\Validation\ValidationException::withMessages(['team_a_id' => 'No se pueden cambiar participantes con resultados o planilla cargada.']);
            if ($game && $item->isDirty([...$keys, 'stage'])) {
                $item->unsetRelation('teamA')->unsetRelation('teamB')->unsetRelation('sourceA')->unsetRelation('sourceB');
                $a = $item->resolvedTeam('a'); $b = $item->resolvedTeam('b');
                if (! $a || ! $b || $a->id === $b->id) throw \Illuminate\Validation\ValidationException::withMessages(['team_a_id' => 'El partido requiere dos equipos distintos y resueltos.']);
                $game->update(['phase_instance' => $item->stage, 'id_team_local' => $a->id, 'id_team_visitor' => $b->id]);
            }
            $item->save();
        });
        return back();
    }

    public function destroy(int $tournament, int $category, int $match): RedirectResponse
    {
        DB::transaction(function () use ($tournament, $category, $match) {
            $item = PlayoffMatch::where('tournament_id', $tournament)->whereHas('bracket', fn ($q) => $q->where('category_id', $category))->lockForUpdate()->findOrFail($match);
            foreach (['a', 'b'] as $slot) PlayoffMatch::where("source_{$slot}_match_id", $item->id)->update(["source_{$slot}_match_id" => null, "source_{$slot}_type" => null]);
            $item->delete();
        });
        return back();
    }

    private function code(int $number): string
    {
        $code = '';
        do { $code = chr(65 + ($number % 26)).$code; $number = intdiv($number, 26) - 1; } while ($number >= 0);
        return $code;
    }
}
