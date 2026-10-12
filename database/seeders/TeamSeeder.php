<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Delegate;
use App\Models\Team;
use App\Models\Trainer;
use Illuminate\Database\Seeder;
use LogicException;

class TeamSeeder extends Seeder
{
    public function run(): void
    {
        foreach (VolleyballTestDataset::teams() as $data) {
            $category = Category::where('name_category', $data['category'])
                ->where('genero_category', $data['gender'])
                ->firstOrFail();
            $delegate = Delegate::where('email_delegate', $data['delegate_email'])->firstOrFail();
            $trainers = Trainer::where('name_trainer', $data['trainer_name'])
                ->whereDate('birthdate_trainer', $data['trainer_birthdate'])
                ->get();

            if ($trainers->count() !== 1) {
                throw new LogicException(
                    "No se encontró una identidad única para el entrenador {$data['trainer_name']} del equipo {$data['name_team']}."
                );
            }

            $trainer = $trainers->first();

            Team::updateOrCreate(
                ['name_team' => $data['name_team']],
                [
                    'city_team' => $data['city_team'],
                    'id_category' => $category->id_category,
                    'id_delegate' => $delegate->id_delegate,
                    'id_trainer' => $trainer->id_trainer,
                ]
            );
        }
    }
}
