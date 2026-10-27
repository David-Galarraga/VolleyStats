<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fixtures', function (Blueprint $table) {
            $table->string('phase', 32)->nullable()->after('name_fixture');
        });

        DB::table('fixtures')->orderBy('id')->chunkById(100, function ($fixtures) {
            foreach ($fixtures as $fixture) {
                $gamePhases = DB::table('games')
                    ->where('id_fixture', $fixture->id)
                    ->whereNotNull('phase')
                    ->distinct()
                    ->pluck('phase');

                if ($gamePhases->count() === 1) {
                    DB::table('fixtures')->where('id', $fixture->id)->update(['phase' => $gamePhases->first()]);
                } elseif ($gamePhases->isEmpty()) {
                    $phase = strcasecmp(trim($fixture->name_fixture), 'Play off') === 0 ? 'playoff' : 'regular';
                    DB::table('fixtures')->where('id', $fixture->id)->update(['phase' => $phase]);
                }
            }
        });
    }

    public function down(): void
    {
        Schema::table('fixtures', function (Blueprint $table) {
            $table->dropColumn('phase');
        });
    }
};
