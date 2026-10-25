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
        $target = $game->phase === 'playoff' && $game->set_format === 'best_of_5' ? 3 : 2;
        $rules = [
            'sets_local' => ['required', 'integer', 'between:0,'.$target],
            'sets_visitor' => ['required', 'integer', 'between:0,'.$target],
        ];

        for ($set = 1; $set <= 5; $set++) {
            $rules['set_'.$set.'_points_local'] = [$set <= $target ? 'required' : 'nullable', 'integer', 'min:0'];
            $rules['set_'.$set.'_points_visitor'] = [$set <= $target ? 'required' : 'nullable', 'integer', 'min:0'];
        }

        $validator = Validator::make($request->all(), $rules, [
            '*.required' => 'Completá este tanteador.',
            '*.integer' => 'El tanteador debe ser un número entero.',
            '*.min' => 'El tanteador no puede ser negativo.',
        ]);

        $validator->after(function ($validator) use ($target) {
            if ($validator->errors()->isNotEmpty()) return;

            $data = $validator->getData();
            $setsLocal = (int) $data['sets_local'];
            $setsVisitor = (int) $data['sets_visitor'];
            $validWinner = ($setsLocal === $target && $setsVisitor < $target)
                || ($setsVisitor === $target && $setsLocal < $target);

            if (! $validWinner) {
                $validator->errors()->add('sets_local', $target === 3
                    ? 'El resultado debe ser 3–0, 3–1, 3–2, 2–3, 1–3 o 0–3.'
                    : 'El resultado debe ser 2–0, 2–1, 1–2 o 0–2.');
                return;
            }

            $playedSets = $setsLocal + $setsVisitor;
            $localWins = 0;
            $visitorWins = 0;

            for ($set = 1; $set <= 5; $set++) {
                $local = $data['set_'.$set.'_points_local'] ?? null;
                $visitor = $data['set_'.$set.'_points_visitor'] ?? null;

                if ($set > $playedSets) {
                    if ($local !== null || $visitor !== null) {
                        $validator->errors()->add('set_'.$set.'_points_local', 'No se pueden cargar tanteadores para sets no jugados.');
                        return;
                    }
                    continue;
                }

                if ($local === null || $visitor === null) {
                    $validator->errors()->add('set_'.$set.'_points_local', 'Completá el tanteador de ambos equipos para cada set jugado.');
                    return;
                }

                $winnerScore = max((int) $local, (int) $visitor);
                $loserScore = min((int) $local, (int) $visitor);
                $pointsToWin = $set === ($target * 2 - 1) ? 15 : 25;
                $validSetScore = $winnerScore >= $pointsToWin
                    && ($loserScore < $pointsToWin - 1
                        ? $winnerScore === $pointsToWin
                        : $winnerScore - $loserScore === 2);

                if (! $validSetScore) {
                    $message = 'El set '.$set.' debe llegar al menos a '.$pointsToWin.' puntos con una diferencia minima de 2.';
                    $validator->errors()->add('set_'.$set.'_points_local', $message);
                    $validator->errors()->add('set_'.$set.'_points_visitor', $message);
                    return;
                }

                (int) $local > (int) $visitor ? $localWins++ : $visitorWins++;
            }

            if ($localWins !== $setsLocal || $visitorWins !== $setsVisitor) {
                $validator->errors()->add('sets_local', 'El resultado general no coincide con los tanteadores de los sets.');
            }
        });

        if ($validator->fails()) {
            return redirect()->route('games.sheet.show', $game)->withErrors($validator)->withInput();
        }

        $data = $validator->validated();
        $values = ['sets_local' => $data['sets_local'], 'sets_visitor' => $data['sets_visitor']];
        for ($set = 1; $set <= 5; $set++) {
            $values['set_'.$set.'_points_local'] = $data['set_'.$set.'_points_local'] ?? null;
            $values['set_'.$set.'_points_visitor'] = $data['set_'.$set.'_points_visitor'] ?? null;
        }

        DB::transaction(fn () => $game->matchResult()->updateOrCreate([], $values));

        return redirect()->route('games.sheet.show', $game);
    }
}
