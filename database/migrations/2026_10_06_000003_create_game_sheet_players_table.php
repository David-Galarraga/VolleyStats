<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('game_sheet_players', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_sheet_id')->constrained('game_sheets')->cascadeOnDelete();
            $table->foreignId('player_id')->constrained('players')->cascadeOnDelete();
            $table->foreignId('team_id')->constrained('teams')->cascadeOnDelete();
            $table->string('name_player');
            $table->string('dni_player', 8);
            $table->boolean('present')->default(false);
            $table->timestamps();

            $table->unique(['game_sheet_id', 'player_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_sheet_players');
    }
};
