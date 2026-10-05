<?php

namespace Database\Seeders;

use App\Models\Trainer;
use Illuminate\Database\Seeder;

class TrainerSeeder extends Seeder
{
    /**
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
