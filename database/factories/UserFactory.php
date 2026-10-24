<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        DB::table('user_types')->insertOrIgnore([
            'id_user_type' => 1,
            'name_user_type' => 'Usuario',
            'description_user_type' => 'Usuario registrado general',
        ]);

        return [
            'name_user' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'id_user_type' => 1,
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function admin(): static
    {
        return $this->afterCreating(fn (User $user) => $user->assignRole(
            Role::findOrCreate('Administrador', 'web')
        ));
    }

    public function planillero(): static
    {
        return $this->afterCreating(fn (User $user) => $user->assignRole(
            Role::findOrCreate('Planillero', 'web')
        ));
    }
}
