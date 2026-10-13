<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trainers', function (Blueprint $table) {
            $table->string('dni_trainer', 32)->nullable()->unique();
            $table->date('birthdate_trainer')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('trainers', function (Blueprint $table) {
            $table->dropUnique(['dni_trainer']);
            $table->dropColumn(['dni_trainer', 'birthdate_trainer']);
        });
    }
};
