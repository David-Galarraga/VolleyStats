<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tournament_legacy_links', function (Blueprint $table) {
            $table->id();
            $table->string('entity', 20);
            $table->unsignedBigInteger('source_id');
            $table->foreignId('id_tournament')->constrained('tournaments')->restrictOnDelete();
            $table->unsignedBigInteger('target_id');
            $table->unique(['entity', 'source_id', 'id_tournament'], 'tournament_legacy_link_unique');
        });
        // Existing records remain unassigned until the historical-data review.
        foreach (['teams', 'players', 'delegates', 'trainers', 'categories'] as $name) {
            Schema::table($name, function (Blueprint $table) {
                $table->foreignId('id_tournament')->nullable()->constrained('tournaments')->restrictOnDelete();
            });
        }
        Schema::table('teams', function (Blueprint $table) {
            $table->string('registration_status')->default('draft');
            $table->unsignedBigInteger('legacy_source_id')->nullable()->index();
        });
        Schema::table('players', function (Blueprint $table) {
            $table->softDeletes();
        });
        Schema::table('delegates', function (Blueprint $table) {
            $table->string('dni_delegate', 32)->nullable();
            $table->string('email_delegate', 50)->nullable()->change();
            $table->string('phone_delegate', 25)->change();
            $table->unique(['id_tournament', 'dni_delegate']);
        });
        Schema::table('players', function (Blueprint $table) {
            $table->dropUnique(['dni_player']);
            $table->unique(['id_tournament', 'dni_player']);
        });
        Schema::table('trainers', function (Blueprint $table) {
            $table->dropUnique(['dni_trainer']);
            $table->unique(['id_tournament', 'dni_trainer']);
        });
    }

    public function down(): void
    {
        // Do not silently merge people whose DNI is repeated across tournaments.
        foreach (['players' => 'dni_player', 'trainers' => 'dni_trainer'] as $name => $dni) {
            if (DB::table($name)->whereNotNull($dni)->groupBy($dni)->havingRaw('COUNT(*) > 1')->exists()) {
                throw new RuntimeException('Rollback requires resolving repeated DNI across tournaments first.');
            }
        }
        foreach (['players' => 'dni_player', 'trainers' => 'dni_trainer'] as $name => $dni) {
            Schema::table($name, function (Blueprint $table) use ($dni) {
                $table->dropUnique(['id_tournament', $dni]);
                $table->unique($dni);
            });
        }
        Schema::table('delegates', function (Blueprint $table) {
            $table->dropUnique(['id_tournament', 'dni_delegate']);
            $table->dropColumn('dni_delegate');
        });
        Schema::table('players', fn (Blueprint $table) => $table->dropSoftDeletes());
        Schema::table('teams', fn (Blueprint $table) => $table->dropColumn(['registration_status', 'legacy_source_id']));
        foreach (['teams', 'players', 'delegates', 'trainers', 'categories'] as $name) {
            Schema::table($name, fn (Blueprint $table) => $table->dropConstrainedForeignId('id_tournament'));
        }
        Schema::dropIfExists('tournament_legacy_links');
    }
};
