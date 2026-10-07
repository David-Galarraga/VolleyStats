<?php

namespace App\Http\Controllers;

use App\Models\Game;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ResultController extends Controller
{
    public function update(Request $request, Game $game): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'sets_local' => ['required', 'integer', 'between:0,2'],
            'sets_visitor' => ['required', 'integer', 'between:0,2'],
            'set_1_points_local' => ['required', 'integer', 'min:0'],
            'set_1_points_visitor' => ['required', 'integer', 'min:0'],
            'set_2_points_local' => ['required', 'integer', 'min:0'],
            'set_2_points_visitor' => ['required', 'integer', 'min:0'],
            'set_3_points_local' => ['nullable', 'integer', 'min:0'],
            'set_3_points_visitor' => ['nullable', 'integer', 'min:0'],
        ], [
            'sets_local.required' => 'Seleccioná el resultado general en sets.',
            'sets_visitor.required' => 'Seleccioná el resultado general en sets.',
            '*.required' => 'Completá este tanteador.',
            '*.integer' => 'El tanteador debe ser un número entero.',
            '*.min' => 'El tanteador no puede ser negativo.',
        ]);

        $validator->after(function ($validator) {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $data = $validator->getData();
            $setsLocal = (int) $data['sets_local'];
            $setsVisitor = (int) $data['sets_visitor'];
            $scoreIsValid = ($setsLocal === 2 && in_array($setsVisitor, [0, 1], true))
                || ($setsVisitor === 2 && in_array($setsLocal, [0, 1], true));

            if (! $scoreIsValid) {
                $validator->errors()->add('sets_local', 'El resultado debe ser 2–0, 2–1, 1–2 o 0–2.');

                return;
            }

            $thirdSetWasPlayed = $setsLocal + $setsVisitor === 3;
            $thirdLocal = $data['set_3_points_local'] ?? null;
            $thirdVisitor = $data['set_3_points_visitor'] ?? null;

            if ($thirdSetWasPlayed && ($thirdLocal === null || $thirdVisitor === null)) {
                $validator->errors()->add('set_3_points_local', 'Completá el tanteador de ambos equipos para el tercer set.');

                return;
            }

            if (! $thirdSetWasPlayed && ($thirdLocal !== null || $thirdVisitor !== null)) {
                $validator->errors()->add('set_3_points_local', 'El tercer set solo se carga cuando el partido termina 2–1 o 1–2.');

                return;
            }

            $localSetWins = 0;
            $visitorSetWins = 0;
            $sets = [
                [$data['set_1_points_local'], $data['set_1_points_visitor'], 'set_1_points_local', 'set_1_points_visitor'],
                [$data['set_2_points_local'], $data['set_2_points_visitor'], 'set_2_points_local', 'set_2_points_visitor'],
            ];

            if ($thirdSetWasPlayed) {
                $sets[] = [$thirdLocal, $thirdVisitor, 'set_3_points_local', 'set_3_points_visitor'];
            }

            foreach ($sets as [$localPoints, $visitorPoints, $localField, $visitorField]) {
                if (abs((int) $localPoints - (int) $visitorPoints) < 2) {
                    $validator->errors()->add($localField, 'El ganador de cada set debe tener una diferencia mínima de 2 puntos.');
                    $validator->errors()->add($visitorField, 'El ganador de cada set debe tener una diferencia mínima de 2 puntos.');

                    return;
                }

                if ((int) $localPoints > (int) $visitorPoints) {
                    $localSetWins++;
                } else {
                    $visitorSetWins++;
                }
            }

            if ($localSetWins !== $setsLocal || $visitorSetWins !== $setsVisitor) {
                $validator->errors()->add('sets_local', 'El resultado general no coincide con los tanteadores de los sets.');
            }
        });

        $data = $validator->validate();

        DB::transaction(function () use ($game, $data) {
            $game->matchResult()->updateOrCreate([], [
                'sets_local' => $data['sets_local'],
                'sets_visitor' => $data['sets_visitor'],
                'set_1_points_local' => $data['set_1_points_local'],
                'set_1_points_visitor' => $data['set_1_points_visitor'],
                'set_2_points_local' => $data['set_2_points_local'],
                'set_2_points_visitor' => $data['set_2_points_visitor'],
                'set_3_points_local' => $data['set_3_points_local'] ?? null,
                'set_3_points_visitor' => $data['set_3_points_visitor'] ?? null,
            ]);
        });

        return redirect()->route('games.show', $game);
    }
}
