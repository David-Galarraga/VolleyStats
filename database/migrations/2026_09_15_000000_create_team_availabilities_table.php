<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('team_availabilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_fixture')->constrained('fixtures')->cascadeOnDelete();
            $table->foreignId('id_team')->constrained('teams')->cascadeOnDelete();
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->timestamps();

            $table->unique(['id_fixture', 'id_team', 'date', 'start_time', 'end_time'], 'team_availability_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('team_availabilities');
    }
};
