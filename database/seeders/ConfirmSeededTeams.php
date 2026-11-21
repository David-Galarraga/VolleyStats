<?php

namespace Database\Seeders;

use App\Models\Team;
use App\Models\Tournament;
use App\Services\TeamRegistrationService;
use Illuminate\Database\Seeder;

class ConfirmSeededTeams extends Seeder
{
    public function run(): void
    {
        $tournament = Tournament::where('name_tournament', 'Torneo de Prueba 2026')->firstOrFail();
        foreach (Team::where('id_tournament', $tournament->id)->get() as $team) {
            app(TeamRegistrationService::class)->confirm($team);
        }
    }
}
