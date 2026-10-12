<?php

namespace Database\Seeders;

use App\Models\Delegate;
use Illuminate\Database\Seeder;

class DelegateSeeder extends Seeder
{
    public function run(): void
    {
        foreach (VolleyballTestDataset::teams() as $team) {
            Delegate::updateOrCreate(
                ['email_delegate' => $team['delegate_email']],
                [
                    'name_delegate' => $team['delegate_name'],
                    'phone_delegate' => $team['delegate_phone'],
                ]
            );
        }
    }
}
