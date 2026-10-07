<?php

namespace Database\Seeders;

use App\Models\Player;
use App\Models\Team;
use Illuminate\Database\Seeder;

class PlayerSeeder extends Seeder
{
    /**
     */
    public function run(): void
    {
        $teams = Team::all();

        if ($teams->isEmpty()) {
            $this->command->warn('PlayerSeeder omitido: sin teams.');
            return;
        }

        $names = ['Sofía', 'Valentina', 'Mateo', 'Joaquín', 'Luciana', 'Facundo', 'Camila', 'Agustín'];

        foreach ($teams as $teamIndex => $team) {
            for ($i = 1; $i <= 3; $i++) {
                $dni = str_pad((string) (30000000 + ($teamIndex * 3) + $i), 8, '0', STR_PAD_LEFT);
                Player::firstOrCreate(
                    [
                        'dni_player' => $dni,
                    ],
                    [
                        'id_team' => $team->id,
                        'name_player' => $names[($teamIndex * 3 + $i) % count($names)].' '.$team->name_team,
                        'birthdate_player' => '2008-05-'.str_pad((string) $i, 2, '0', STR_PAD_LEFT),
                    ]
                );
            }
        }
    }
}
