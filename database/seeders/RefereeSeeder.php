<?php

namespace Database\Seeders;

use App\Models\Referee;
use Illuminate\Database\Seeder;

class RefereeSeeder extends Seeder
{
    public function run(): void
    {
        $referees = [
            ['name_referee' => 'Lucía Fernández', 'phone_referee' => '098111111'],
            ['name_referee' => 'Martín Pérez', 'phone_referee' => '098222222'],
        ];

        foreach ($referees as $data) {
            Referee::firstOrCreate(['name_referee' => $data['name_referee']], $data);
        }
    }
}
