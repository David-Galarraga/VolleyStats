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
        Schema::create('tournament_teams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_tournament')->constrained('tournaments')->cascadeOnDelete();
            $table->foreignId('id_team')->constrained('teams')->cascadeOnDelete();
            $table->integer('id_category');
            $table->string('status')->default('enrolled');
            $table->timestamps();

            $table->unique(['id_tournament', 'id_team']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tournament_teams');
    }
};
