<?php

namespace Database\Seeders;

use App\Models\Player;
use App\Models\Team;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use LogicException;

class NormalizeLegacyPlayerDnisSeeder extends Seeder
{
    public function run(): void
    {
        $genderIndexes = ['femenino' => 0, 'masculino' => 0];
        $plannedUpdates = [];

        foreach (VolleyballTestDataset::teams() as $teamData) {
            if ($teamData['name_team'] === 'La Vencedora Azul') {
                continue;
            }

            $team = Team::where('name_team', $teamData['name_team'])->firstOrFail();
            $expectedPlayers = [];

            for ($i = 0; $i < 8; $i++) {
                $genderIndex = $genderIndexes[$teamData['gender']]++;
                $expectedPlayers[] = [
                    'name_player' => VolleyballTestDataset::fictionalPlayerName($teamData['gender'], $genderIndex),
                    'birthdate_player' => VolleyballTestDataset::fictionalPlayerBirthdate($teamData['gender'], $genderIndex),
                ];
            }

            $legacyPlayers = Player::where('id_team', $team->id)
                ->where('dni_player', 'like', 'TEST-PLY-%')
                ->get();
            $matchedLegacyIds = [];

            foreach ($expectedPlayers as $expectedPlayer) {
                $matchingRows = Player::where('id_team', $team->id)
                    ->where('name_player', $expectedPlayer['name_player'])
                    ->whereDate('birthdate_player', $expectedPlayer['birthdate_player'])
                    ->get();

                if ($matchingRows->count() > 1) {
                    throw new LogicException(
                        "Hay jugadores duplicados que coinciden con {$expectedPlayer['name_player']} en {$team->name_team}; se requiere revisión manual."
                    );
                }

                $matchingLegacy = $legacyPlayers->filter(
                    fn (Player $player) => $player->name_player === $expectedPlayer['name_player']
                        && substr((string) $player->birthdate_player, 0, 10) === $expectedPlayer['birthdate_player']
                );

                if ($matchingLegacy->count() > 1) {
                    throw new LogicException(
                        "Hay varios jugadores TEST-PLY que coinciden con {$expectedPlayer['name_player']} en {$team->name_team}; se requiere revisión manual."
                    );
                }

                if ($matchingLegacy->isEmpty()) {
                    continue;
                }

                $legacyPlayer = $matchingLegacy->first();

                if ($matchingRows->count() !== 1 || $matchingRows->first()->id !== $legacyPlayer->id) {
                    throw new LogicException(
                        "La identidad de {$expectedPlayer['name_player']} en {$team->name_team} es ambigua; se requiere revisión manual."
                    );
                }

                $matchedLegacyIds[] = $legacyPlayer->id;
                $plannedUpdates[] = $legacyPlayer;
            }

            if ($legacyPlayers->count() !== count($matchedLegacyIds)) {
                throw new LogicException(
                    "Hay jugadores TEST-PLY en {$team->name_team} que no coinciden exactamente con la plantilla ficticia actual; se requiere revisión manual."
                );
            }
        }

        DB::transaction(function () use ($plannedUpdates): void {
            $generatedDnis = [];

            foreach ($plannedUpdates as $player) {
                $player->update([
                    'dni_player' => $this->uniqueFictionalDni($generatedDnis),
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
            || Player::whereIn('dni_player', [$dni, $formattedDni])->exists());

        $generatedDnis[] = $dni;

        return $dni;
    }
}
