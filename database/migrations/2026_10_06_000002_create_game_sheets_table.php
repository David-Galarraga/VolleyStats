<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('game_sheets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->unique()->constrained('games')->cascadeOnDelete();
            $table->string('status_sheet')->default('draft');
            $table->string('venue')->nullable();
            $table->text('observations')->nullable();
            $table->foreignId('opened_by')->nullable()->constrained('users', 'id_user')->nullOnDelete();
            $table->foreignId('closed_by')->nullable()->constrained('users', 'id_user')->nullOnDelete();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_sheets');
    }
};
