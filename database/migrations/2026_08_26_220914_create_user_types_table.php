<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_types', function (Blueprint $table) {
            $table->id('id_user_type');
            $table->string('name_user_type', 50)->unique();
            $table->text('description_user_type');
        });

        \Illuminate\Support\Facades\DB::table('user_types')->insert([
            ['id_user_type' => 1, 'name_user_type' => 'Usuario', 'description_user_type' => 'Usuario registrado general'],
            ['id_user_type' => 2, 'name_user_type' => 'Administrador', 'description_user_type' => 'Administrador del sistema'],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('user_types');
    }
};
