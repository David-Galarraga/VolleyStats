<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('playoff_brackets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tournament_id')->constrained('tournaments')->cascadeOnDelete();
            $table->unsignedBigInteger('category_id');
            $table->timestamps();
            $table->unique(['tournament_id', 'category_id']);
            $table->foreign('category_id')->references('id_category')->on('categories')->cascadeOnDelete();
        });

        Schema::create('playoff_matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bracket_id')->constrained('playoff_brackets')->cascadeOnDelete();
            $table->foreignId('tournament_id')->constrained('tournaments')->cascadeOnDelete();
            $table->string('code', 8);
            $table->string('stage', 24);
            $table->string('cup', 8);
            $table->unsignedBigInteger('team_a_id')->nullable();
            $table->unsignedBigInteger('team_b_id')->nullable();
            $table->string('source_a_type', 8)->nullable();
            $table->unsignedBigInteger('source_a_match_id')->nullable();
            $table->string('source_b_type', 8)->nullable();
            $table->unsignedBigInteger('source_b_match_id')->nullable();
            $table->unsignedBigInteger('game_id')->nullable()->unique();
            $table->timestamps();
            $table->unique(['tournament_id', 'code']);
            $table->foreign('team_a_id')->references('id')->on('teams')->nullOnDelete();
            $table->foreign('team_b_id')->references('id')->on('teams')->nullOnDelete();
            $table->foreign('source_a_match_id')->references('id')->on('playoff_matches')->nullOnDelete();
            $table->foreign('source_b_match_id')->references('id')->on('playoff_matches')->nullOnDelete();
            $table->foreign('game_id')->references('id')->on('games')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('playoff_matches');
        Schema::dropIfExists('playoff_brackets');
    }
};
