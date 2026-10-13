<?php

namespace Database\Seeders;

use App\Models\Trainer;
use Illuminate\Database\Seeder;
use LogicException;

class TrainerSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(NormalizeLegacyTrainerDnisSeeder::class);
        $generatedDnis = [];

        foreach (VolleyballTestDataset::teams() as $team) {
            if ($team['trainer_dni'] !== null) {
                Trainer::updateOrCreate(
                    ['dni_trainer' => $team['trainer_dni']],
                    [
                        'name_trainer' => $team['trainer_name'],
                        'birthdate_trainer' => $team['trainer_birthdate'],
                    ]
                );

                continue;
            }

            $matches = Trainer::where('name_trainer', $team['trainer_name'])
                ->whereDate('birthdate_trainer', $team['trainer_birthdate'])
                ->get();

            if ($matches->count() > 1) {
                throw new LogicException(
                    "Hay varios entrenadores que coinciden con {$team['trainer_name']} y {$team['trainer_birthdate']}; se requiere revisión manual."
                );
            }

            if ($matches->isNotEmpty()) {
                $trainer = $matches->first();

                if ($trainer->dni_trainer === null) {
                    if (! $trainer->teams()->where('name_team', $team['name_team'])->exists()) {
                        throw new LogicException(
                            "No se puede identificar con seguridad el entrenador sin DNI {$team['trainer_name']} del equipo {$team['name_team']}."
                        );
                    }

                    $trainer->update([
                        'dni_trainer' => $this->uniqueFictionalDni($generatedDnis),
                    ]);

                    continue;
                }

                if (preg_match('/^(?:[0-9]{8}|[0-9]{2}\.[0-9]{3}\.[0-9]{3})$/D', $trainer->dni_trainer) !== 1) {
                    throw new LogicException(
                        "El entrenador {$team['trainer_name']} ya tiene un DNI con formato no reconocido; se requiere revisión manual."
                    );
                }

                continue;
            }

            Trainer::create([
                'name_trainer' => $team['trainer_name'],
                'dni_trainer' => $this->uniqueFictionalDni($generatedDnis),
                'birthdate_trainer' => $team['trainer_birthdate'],
            ]);
        }
    }

    private function uniqueFictionalDni(array &$generatedDnis): string
    {
        do {
            $dni = (string) random_int(10_000_000, 99_999_999);
            $formattedDni = substr($dni, 0, 2).'.'.substr($dni, 2, 3).'.'.substr($dni, 5, 3);
        } while (in_array($dni, $generatedDnis, true)
            || Trainer::whereIn('dni_trainer', [$dni, $formattedDni])->exists());

        $generatedDnis[] = $dni;

        return $dni;
    }
}
