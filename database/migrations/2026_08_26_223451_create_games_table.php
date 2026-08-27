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
        Schema::create('games', function (Blueprint $table) {
            $table->id();
            $table->integer('id_tournament');
            $table->integer('id_team_local');
            $table->integer('id_team_visitor');
            $table->integer('id_referee');
            $table->date('date');
            $table->time('time');
            $table->string('status_game')->default('pending');
            $table->integer('set_local')->nullable();
            $table->integer('set_visitor')->nullable();
            $table->string('result')->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('games');
    }
};
