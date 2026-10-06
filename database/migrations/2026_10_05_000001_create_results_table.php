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
        Schema::create('results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->unique()->constrained('games')->cascadeOnDelete();

            $table->unsignedTinyInteger('sets_local');
            $table->unsignedTinyInteger('sets_visitor');

            $table->unsignedSmallInteger('set_1_points_local');
            $table->unsignedSmallInteger('set_1_points_visitor');
            $table->unsignedSmallInteger('set_2_points_local');
            $table->unsignedSmallInteger('set_2_points_visitor');
            $table->unsignedSmallInteger('set_3_points_local')->nullable();
            $table->unsignedSmallInteger('set_3_points_visitor')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('results');
    }
};
