<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const TABLES = [
        'players',
        'game_sheet_players',
        'match_roster_players',
    ];

    public function up(): void
    {
        foreach (self::TABLES as $tableName) {
            Schema::table($tableName, function (Blueprint $table): void {
                $table->string('dni_player', 32)->change();
            });
        }
    }

    public function down(): void
    {
        foreach (self::TABLES as $tableName) {
            if (DB::table($tableName)->whereRaw('CHAR_LENGTH(dni_player) > 8')->exists()) {
                throw new \RuntimeException(
                    "Cannot shrink {$tableName}.dni_player to 8 characters while values longer than 8 characters exist."
                );
            }
        }

        foreach (self::TABLES as $tableName) {
            Schema::table($tableName, function (Blueprint $table): void {
                $table->string('dni_player', 8)->change();
            });
        }
    }
};
