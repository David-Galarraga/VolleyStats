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
        Schema::create('tournament_categories', function (Blueprint $table) {
            $table->id();

            $table->integer('id_tournament');
            $table->integer('id_category');

            $table->integer('number_matches')->nullable();
            $table->integer('number_teams')->nullable();

            $table->timestamps();

            $table->unique(['id_tournament', 'id_category']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tournament_categories');
    }
};
