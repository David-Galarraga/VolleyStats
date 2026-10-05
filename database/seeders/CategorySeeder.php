<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name_category' => 'Sub-14', 'genero_category' => 'femenino'],
            ['name_category' => 'Sub-16', 'genero_category' => 'femenino'],
            ['name_category' => 'Sub-18', 'genero_category' => 'masculino'],
            ['name_category' => 'Mayores', 'genero_category' => 'masculino'],
        ];

        foreach ($categories as $data) {
            Category::firstOrCreate(
                ['name_category' => $data['name_category'], 'genero_category' => $data['genero_category']],
                $data
            );
        }
    }
}
