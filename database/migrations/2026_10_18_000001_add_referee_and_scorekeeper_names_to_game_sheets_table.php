<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('game_sheets', function (Blueprint $table) {
            $table->string('referee_name')->nullable();
            $table->string('scorekeeper_name')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('game_sheets', function (Blueprint $table) {
            $table->dropColumn(['referee_name', 'scorekeeper_name']);
        });
    }
};
