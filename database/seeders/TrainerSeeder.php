<?php

namespace Database\Seeders;

use App\Models\Trainer;
use Illuminate\Database\Seeder;

class TrainerSeeder extends Seeder
{
    /**
     * Punto 3: trainers es catálogo independiente.
     * teams no tiene id_trainer (ni migración ni fillable/relación en Team),
     * y los flujos actuales (Team/Game/Availability) no lo usan.
     * Por eso se siembra solo como datos de prueba para el CRUD de
     * trainers, sin intentar vincularlo a teams.
     *
     * Si a futuro se pide equipo->entrenador: nueva migración
     * add_id_trainer_to_teams + belongsTo/hasMany, no parche en seeder.
     */
    public function run(): void
    {
        $trainers = [
            ['name_trainer' => 'Pablo López', 'phone_trainer' => '099555111', 'email_trainer' => 'pablo.lopez@example.com'],
            ['name_trainer' => 'Lucía Méndez', 'phone_trainer' => '099555222', 'email_trainer' => 'lucia.mendez@example.com'],
            ['name_trainer' => 'Jorge Acosta', 'phone_trainer' => '099555333', 'email_trainer' => 'jorge.acosta@example.com'],
        ];

        foreach ($trainers as $data) {
            Trainer::firstOrCreate(['email_trainer' => $data['email_trainer']], $data);
        }
    }
}
