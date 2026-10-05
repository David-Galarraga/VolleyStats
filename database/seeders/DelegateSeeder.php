<?php

namespace Database\Seeders;

use App\Models\Delegate;
use Illuminate\Database\Seeder;

class DelegateSeeder extends Seeder
{
    public function run(): void
    {
        $delegates = [
            ['name_delegate' => 'Ana Gómez', 'email_delegate' => 'ana.gomez@example.com', 'phone_delegate' => '099111111'],
            ['name_delegate' => 'Bruno Díaz', 'email_delegate' => 'bruno.diaz@example.com', 'phone_delegate' => '099222222'],
            ['name_delegate' => 'Carla Ruiz', 'email_delegate' => 'carla.ruiz@example.com', 'phone_delegate' => '099333333'],
            ['name_delegate' => 'Diego Sosa', 'email_delegate' => 'diego.sosa@example.com', 'phone_delegate' => '099444444'],
        ];

        foreach ($delegates as $data) {
            Delegate::firstOrCreate(['email_delegate' => $data['email_delegate']], $data);
        }
    }
}
