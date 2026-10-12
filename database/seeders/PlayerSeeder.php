<?php

namespace Database\Seeders;

use App\Models\Player;
use App\Models\Team;
use Illuminate\Database\Seeder;
use LogicException;

class PlayerSeeder extends Seeder
{
    public function run(): void
    {
        $genderIndexes = ['femenino' => 0, 'masculino' => 0];
        $generatedDnis = [];
        $sourcePlayers = [];
        $fictionalPlayers = [];

        foreach (VolleyballTestDataset::teams() as $teamData) {
            $team = Team::where('name_team', $teamData['name_team'])->firstOrFail();

            if ($teamData['name_team'] === 'La Vencedora Azul') {
                $sourcePlayers[] = [$team, VolleyballTestDataset::sourcePlayers()];
                continue;
            }

            $players = [];

            for ($i = 0; $i < 8; $i++) {
                $genderIndex = $genderIndexes[$teamData['gender']]++;
                $players[] = [
                    'name_player' => VolleyballTestDataset::fictionalPlayerName($teamData['gender'], $genderIndex),
                    'birthdate_player' => VolleyballTestDataset::fictionalPlayerBirthdate($teamData['gender'], $genderIndex),
                ];
            }

            $fictionalPlayers[] = [$team, $players];
        }

        // Convert old marked rows first; the dedicated seeder can also be run
        // alone when only existing data should be updated.
        $this->call(NormalizeLegacyPlayerDnisSeeder::class);

        foreach ($sourcePlayers as [$team, $players]) {
            foreach ($players as $player) {
                Player::updateOrCreate(
                    ['dni_player' => $player['dni_player']],
                    [
                        'id_team' => $team->id,
                        'name_player' => $player['name_player'],
                        'birthdate_player' => $player['birthdate_player'],
                    ]
                );
            }
        }

        foreach ($fictionalPlayers as [$team, $players]) {
            foreach ($players as $playerData) {
                $matches = Player::where('id_team', $team->id)
                    ->where('name_player', $playerData['name_player'])
                    ->whereDate('birthdate_player', $playerData['birthdate_player'])
                    ->get();

                if ($matches->count() > 1) {
                    throw new LogicException(
                        "Hay jugadores duplicados que coinciden con {$playerData['name_player']} en {$team->name_team}; se requiere revisión manual."
                    );
                }

                if ($matches->isEmpty()) {
                    $team->players()->create([
                        ...$playerData,
                        'dni_player' => $this->uniqueFictionalDni($generatedDnis),
                    ]);
                }
            }
        }
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
