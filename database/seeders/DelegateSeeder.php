<?php

namespace Database\Seeders;

use App\Models\Delegate;
use App\Models\Tournament;
use Illuminate\Database\Seeder;

class DelegateSeeder extends Seeder
{
    public function run(): void
    {
        $tournament = Tournament::where('name_tournament', 'Torneo de Prueba 2026')->firstOrFail();
        foreach (VolleyballTestDataset::teams() as $index => $team) {
            Delegate::updateOrCreate(
                ['id_tournament' => $tournament->id, 'email_delegate' => $team['delegate_email']],
                [
                    'name_delegate' => $team['delegate_name'],
                    'dni_delegate' => (string) (90000000 + $index),
                    'phone_delegate' => $team['delegate_phone'],
                ]
            );
        }
    }
}
