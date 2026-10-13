<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            ['name_category' => 'A', 'genero_category' => 'femenino'],
            ['name_category' => 'A', 'genero_category' => 'masculino'],
            ['name_category' => 'B', 'genero_category' => 'femenino'],
            ['name_category' => 'B', 'genero_category' => 'masculino'],
            ['name_category' => 'C', 'genero_category' => 'femenino'],
        ] as $data) {
            Category::firstOrCreate($data, $data);
        }
    }
}
