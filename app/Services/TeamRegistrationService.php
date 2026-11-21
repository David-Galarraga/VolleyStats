<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Delegate;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\Trainer;
use App\Support\TournamentPeople;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class TeamRegistrationService
{
    public function save(Tournament $tournament, Category $category, array $input, ?Team $team = null): Team
    {
        abort_unless($tournament->categories()->whereKey($category->getKey())->exists(), 404);
        abort_unless((int) $category->id_tournament === (int) $tournament->id, 409, 'Primero separá los datos históricos por torneo.');
        if ($team) {
            abort_unless((int) $team->id_tournament === (int) $tournament->id && (int) $team->id_category === (int) $category->getKey(), 404);
        }

        return DB::transaction(function () use ($tournament, $category, $input, $team) {
            Tournament::whereKey($tournament->id)->lockForUpdate()->firstOrFail();
            if ($team) {
                $team = Team::whereKey($team->id)->lockForUpdate()->firstOrFail();
            }
            $data = Validator::make($input, [
                'name_team' => 'required|string|max:50', 'city_team' => 'required|string|max:50',
                'action' => ['required', Rule::in(['draft', 'confirm'])],
                'id_delegate' => ['nullable', 'integer', Rule::exists('delegates', 'id_delegate')->where('id_tournament', $tournament->id)],
                'id_trainer' => ['nullable', 'integer', Rule::exists('trainers', 'id_trainer')->where('id_tournament', $tournament->id)],
                'delegate' => 'nullable|array', 'trainer' => 'nullable|array',
                'new_delegate' => 'sometimes|boolean', 'new_trainer' => 'sometimes|boolean',
                'players' => 'present|array', 'players.*' => 'array', 'players.*.id' => 'nullable|integer|distinct',
                'players.*.name_player' => 'nullable|string',
                'players.*.dni_player' => 'nullable|string',
                'players.*.birthdate_player' => 'nullable|string',
            ])->validate();
            $data['players'] ??= [];
            $delegate = $this->staff('delegate', $data, $tournament, $team);
            $trainer = $this->staff('trainer', $data, $tournament, $team);
            $players = [];
            $seen = [];
            foreach ($data['players'] as $index => $row) {
                if (empty($row['id']) && ! collect($row)->contains(fn ($v) => $v !== null && trim((string) $v) !== '')) {
                    continue;
                }
                $id = $row['id'] ?? null;
                if ($id && (! $team || ! $team->players()->whereKey($id)->exists())) {
                    throw ValidationException::withMessages(["players.$index.id" => 'La jugadora no pertenece a este equipo.']);
                }
                try {
                    $values = TournamentPeople::validate($row, 'player', $tournament->id, $id);
                } catch (ValidationException $e) {
                    throw ValidationException::withMessages(collect($e->errors())->mapWithKeys(fn ($errors, $key) => ["players.$index.$key" => $errors])->all());
                }
                if (isset($seen[$values['dni_player']])) {
                    throw ValidationException::withMessages(["players.$index.dni_player" => 'El DNI está repetido en el plantel.']);
                }
                $seen[$values['dni_player']] = true;
                $players[] = [$id, $values];
            }
            $confirming = $data['action'] === 'confirm' || $team?->registration_status === 'confirmed';
            if ($confirming && count($players) < 8) {
                throw ValidationException::withMessages(['players' => 'La inscripción requiere al menos ocho jugadoras.']);
            }
            $attributes = [
                'id_tournament' => $tournament->id, 'id_category' => $category->getKey(),
                'name_team' => $data['name_team'], 'city_team' => $data['city_team'],
                'id_delegate' => $delegate->getKey(), 'id_trainer' => $trainer?->getKey(),
                'registration_status' => $confirming ? 'confirmed' : 'draft',
            ];
            if ($team) {
                $team->update($attributes);
            } else {
                $team = Team::create($attributes);
            }
            $keep = [];
            foreach ($players as [$id, $values]) {
                $values['id_tournament'] = $tournament->id;
                if ($id) {
                    $player = $team->players()->findOrFail($id);
                    $player->update($values);
                } else {
                    $player = $team->players()->create($values);
                }
                $keep[] = $player->id;
            }
            $team->players()->whereNotIn('id', $keep)->delete();

            return $team->fresh(['delegate', 'trainer', 'players']);
        });
    }

    private function staff(string $type, array $data, Tournament $tournament, ?Team $team): Delegate|Trainer|null
    {
        $class = $type === 'delegate' ? Delegate::class : Trainer::class;
        $id = $data["id_$type"] ?? null;
        if ($id) {
            $person = $class::where('id_tournament', $tournament->id)->findOrFail($id);
            $person->update(TournamentPeople::validate($person->toArray(), $type, $tournament->id, $person->getKey()));

            return $person;
        }
        $values = $data[$type] ?? [];
        if ($type === 'trainer' && ! collect($values)->contains(fn ($v) => $v !== null && trim((string) $v) !== '')) {
            return null;
        }
        $current = ! empty($data["new_$type"]) ? null : $team?->$type;
        try {
            $values = TournamentPeople::validate($values, $type, $tournament->id, $current?->getKey());
        } catch (ValidationException $e) {
            throw ValidationException::withMessages(collect($e->errors())->mapWithKeys(fn ($errors, $key) => ["$type.$key" => $errors])->all());
        }
        if ($current) {
            abort_unless((int) $current->id_tournament === (int) $tournament->id, 404);
            $current->update($values);

            return $current;
        }

        return $class::create([...$values, 'id_tournament' => $tournament->id]);
    }

    public function confirm(Team $team): Team
    {
        $team->load(['players', 'delegate', 'trainer']);

        return $this->save(Tournament::findOrFail($team->id_tournament), Category::findOrFail($team->id_category), [
            ...$team->only(['name_team', 'city_team', 'id_delegate', 'id_trainer']),
            'action' => 'confirm', 'players' => $team->players->toArray(),
        ], $team);
    }
}
