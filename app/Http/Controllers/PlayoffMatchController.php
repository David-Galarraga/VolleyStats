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

    private function code(int $number): string
    {
        $code = '';
        do { $code = chr(65 + ($number % 26)).$code; $number = intdiv($number, 26) - 1; } while ($number >= 0);
        return $code;
    }
}
