<?php

namespace Database\Seeders;

use App\Models\Trainer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use LogicException;

class NormalizeLegacyTrainerDnisSeeder extends Seeder
{
    public function run(): void
    {
        $legacyTrainers = Trainer::where('dni_trainer', 'like', 'TEST-TRN-%')->get();
        $matchedLegacyIds = [];
        $plannedUpdates = [];

        foreach (VolleyballTestDataset::teams() as $teamData) {
            if ($teamData['trainer_dni'] !== null) {
                continue;
            }

            $identityMatches = Trainer::where('name_trainer', $teamData['trainer_name'])
                ->whereDate('birthdate_trainer', $teamData['trainer_birthdate'])
                ->get();

            $legacyMatches = $identityMatches->filter(function (Trainer $trainer) use ($teamData) {
                return preg_match('/^TEST-TRN-[0-9]{6}$/D', (string) $trainer->dni_trainer) === 1
                    && $trainer->teams()->where('name_team', $teamData['name_team'])->exists();
            });

            if ($legacyMatches->count() > 1) {
                throw new LogicException(
                    "Hay varios entrenadores TEST-TRN que coinciden con {$teamData['trainer_name']} y el equipo {$teamData['name_team']}; se requiere revisión manual."
                );
            }

            if ($legacyMatches->isEmpty()) {
                continue;
            }

            if ($identityMatches->count() !== 1) {
                throw new LogicException(
                    "La identidad del entrenador {$teamData['trainer_name']} para {$teamData['name_team']} es ambigua; se requiere revisión manual."
                );
            }

            $trainer = $legacyMatches->first();
            $matchedLegacyIds[] = $trainer->id_trainer;
            $plannedUpdates[] = $trainer;
        }

        if ($legacyTrainers->count() !== count($matchedLegacyIds)) {
            throw new LogicException(
                'Hay entrenadores TEST-TRN que no coinciden exactamente con un entrenador ficticio del dataset y su equipo; no se modificó ningún registro.'
            );
        }

        DB::transaction(function () use ($plannedUpdates): void {
            $generatedDnis = [];

            foreach ($plannedUpdates as $trainer) {
                $trainer->update([
                    'dni_trainer' => $this->uniqueFictionalDni($generatedDnis),
                ]);
            }
        });
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
