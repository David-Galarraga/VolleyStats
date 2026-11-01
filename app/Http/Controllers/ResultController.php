<?php

namespace App\Http\Controllers;

use App\Models\Game;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;

class ResultController extends Controller
{
    public function update(Request $request, Game $game): RedirectResponse
    {
        Gate::authorize('update', $game);

        $targetSets = $game->set_format === 'best_of_5' ? 3 : 2;
        $maxSets = ($targetSets * 2) - 1;

        $rules = [
            'sets_local' => ['required', 'integer', "between:0,{$targetSets}"],
            'sets_visitor' => ['required', 'integer', "between:0,{$targetSets}"],
        ];

        for ($set = 1; $set <= $maxSets; $set++) {
            $rules["set_{$set}_points_local"] = ['nullable', 'integer', 'min:0'];
            $rules["set_{$set}_points_visitor"] = ['nullable', 'integer', 'min:0'];
        }

        $validator = Validator::make($request->all(), $rules, [
            'sets_local.required' => 'Seleccioná el resultado general en sets.',
            'sets_visitor.required' => 'Seleccioná el resultado general en sets.',
            '*.required' => 'Completá este tanteador.',
            '*.integer' => 'El tanteador debe ser un número entero.',
            '*.min' => 'El tanteador no puede ser negativo.',
        ]);

        $validator->after(function ($validator) use ($targetSets, $maxSets) {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $data = $validator->getData();
            $setsLocal = (int) $data['sets_local'];
            $setsVisitor = (int) $data['sets_visitor'];

            $validGeneralScore = ($setsLocal === $targetSets && $setsVisitor < $targetSets)
                || ($setsVisitor === $targetSets && $setsLocal < $targetSets);

            if (! $validGeneralScore) {
                $validator->errors()->add(
                    'sets_local',
                    $targetSets === 3
                        ? 'El resultado debe ser 3–0, 3–1, 3–2, 2–3, 1–3 o 0–3.'
                        : 'El resultado debe ser 2–0, 2–1, 1–2 o 0–2.'
                );

                return;
            }

            $playedSets = $setsLocal + $setsVisitor;
            $localSetWins = 0;
            $visitorSetWins = 0;

            for ($set = 1; $set <= $maxSets; $set++) {
                $localPoints = $data["set_{$set}_points_local"] ?? null;
                $visitorPoints = $data["set_{$set}_points_visitor"] ?? null;

                if ($set > $playedSets) {
                    if ($localPoints !== null || $visitorPoints !== null) {
                        $validator->errors()->add(
                            "set_{$set}_points_local",
                            "El set {$set} no se jugó y no debe tener tanteador."
                        );
                    }

                    continue;
                }

                if ($localPoints === null || $visitorPoints === null) {
                    $validator->errors()->add(
                        "set_{$set}_points_local",
                        'Completá este tanteador.'
                    );

                    continue;
                }

                if (abs((int) $localPoints - (int) $visitorPoints) < 2) {
                    $validator->errors()->add(
                        "set_{$set}_points_local",
                        'El ganador de cada set debe tener una diferencia mínima de 2 puntos.'
                    );
                    $validator->errors()->add(
                        "set_{$set}_points_visitor",
                        'El ganador de cada set debe tener una diferencia mínima de 2 puntos.'
                    );

                    continue;
                }

                if ((int) $localPoints > (int) $visitorPoints) {
                    $localSetWins++;
                } else {
                    $visitorSetWins++;
                }
            }

            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            if ($localSetWins !== $setsLocal || $visitorSetWins !== $setsVisitor) {
                $validator->errors()->add('sets_local', 'El resultado general no coincide con los tanteadores de los sets.');
            }
        });

        if ($validator->fails()) {
            return redirect()
                ->route('games.sheet.show', $game)
                ->withErrors($validator)
                ->withInput();
        }

        $data = $validator->validated();

        DB::transaction(function () use ($game, $data) {
            $payload = [
                'sets_local' => $data['sets_local'],
                'sets_visitor' => $data['sets_visitor'],
            ];

            for ($set = 1; $set <= 5; $set++) {
                $payload["set_{$set}_points_local"] = $data["set_{$set}_points_local"] ?? null;
                $payload["set_{$set}_points_visitor"] = $data["set_{$set}_points_visitor"] ?? null;
            }

            $game->matchResult()->updateOrCreate([], $payload);
        });

        return redirect()->route('games.sheet.show', $game);
    }
}
