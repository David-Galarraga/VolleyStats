<?php

namespace App\Support;

use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class TournamentPeople
{
    public static function dni(mixed $value): string
    {
        return str_replace('.', '', trim((string) $value));
    }

    public static function rules(string $type, int $tournament, ?int $ignore = null): array
    {
        [$table, $key] = match ($type) {
            'delegate' => ['delegates', 'id_delegate'],
            'trainer' => ['trainers', 'id_trainer'],
            default => ['players', 'id'],
        };
        $rules = [
            "name_{$type}" => ['required', 'string', 'max:'.($type === 'player' ? 255 : 50)],
            "dni_{$type}" => ['required', 'string', 'regex:/^[0-9]{8}$/D', Rule::unique($table, "dni_{$type}")->where('id_tournament', $tournament)->ignore($ignore, $key)],
        ];
        if ($type === 'delegate') {
            $rules['phone_delegate'] = ['required', 'string', 'max:25', 'regex:/^\+?[0-9 ()-]{6,25}$/D'];
            $rules['email_delegate'] = ['nullable', 'email', 'max:50'];
        } else {
            $rules["birthdate_{$type}"] = ['required', 'date', 'before_or_equal:today'];
        }

        return $rules;
    }

    public static function validate(array $data, string $type, int $tournament, ?int $ignore = null): array
    {
        $data["dni_{$type}"] = self::dni($data["dni_{$type}"] ?? '');

        return Validator::make($data, self::rules($type, $tournament, $ignore))->validate();
    }
}
