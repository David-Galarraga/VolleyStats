<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->foreignId('id_category')
                ->nullable()
                ->after('id_tournament')
                ->constrained('categories', 'id_category')
                ->nullOnDelete();
        });

        DB::table('games')->update([
            'id_category' => DB::raw('(SELECT id_category FROM teams WHERE teams.id = games.id_team_local)'),
        ]);
    }

    public function down(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->dropConstrainedForeignId('id_category');
        });
    }
};
