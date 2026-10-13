<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('match_roster_players', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_roster_id')->constrained('match_rosters')->cascadeOnDelete();
            $table->foreignId('player_id')->constrained('players')->cascadeOnDelete();
            $table->foreignId('team_id')->constrained('teams')->cascadeOnDelete();
            $table->string('name_player');
            $table->string('dni_player', 8);
            $table->timestamps();

            $table->unique(['match_roster_id', 'player_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('match_roster_players');
    }
};
