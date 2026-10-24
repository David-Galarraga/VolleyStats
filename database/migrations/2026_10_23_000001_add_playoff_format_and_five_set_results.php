<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const LEGACY_PHASES = [
        'regular' => null,
        'playoff_16avos' => '16avos',
        'playoff_octavos' => 'Octavos',
        'playoff_cuartos' => 'Cuartos de final',
        'playoff_semifinal' => 'Semifinal',
        'playoff_final' => 'Final',
    ];

    private const INSTANCE_PHASES = [
        '16avos' => 'playoff_16avos',
        'Octavos' => 'playoff_octavos',
        'Cuartos de final' => 'playoff_cuartos',
        'Semifinal' => 'playoff_semifinal',
        'Final' => 'playoff_final',
    ];

    public function up(): void
    {
        // Abort before changing the schema if an unrecognized phase needs manual review.
        $unexpected = DB::table('games')->where(fn ($query) => $query
            ->whereNotIn('phase', array_keys(self::LEGACY_PHASES))->orWhereNull('phase'))
            ->distinct()->pluck('phase')->map(fn ($phase) => $phase ?? '(vacía)')->all();

        if ($unexpected !== []) {
            throw new RuntimeException('Fases inesperadas en games.phase: '.implode(', ', $unexpected).'. Revisalas antes de migrar.');
        }

        Schema::table('games', function (Blueprint $table) {
            $table->string('phase_instance')->nullable();
            $table->string('set_format', 16)->default('best_of_3');
            // Preserves the exact legacy code so rollback can restore every existing value.
            $table->string('legacy_phase', 32)->nullable();
        });

        foreach (self::LEGACY_PHASES as $legacyPhase => $instance) {
            DB::table('games')->where('phase', $legacyPhase)->update([
                'legacy_phase' => $legacyPhase,
                'phase' => $legacyPhase === 'regular' ? 'regular' : 'playoff',
                'phase_instance' => $instance,
            ]);
        }

        Schema::table('results', function (Blueprint $table) {
            $table->unsignedSmallInteger('set_4_points_local')->nullable();
            $table->unsignedSmallInteger('set_4_points_visitor')->nullable();
            $table->unsignedSmallInteger('set_5_points_local')->nullable();
            $table->unsignedSmallInteger('set_5_points_visitor')->nullable();
        });
    }

    public function down(): void
    {
        $hasNewFormat = DB::table('games')->where('set_format', '!=', 'best_of_3')->exists();
        $hasSetsFourOrFive = DB::table('results')->where(function ($query) {
            $query->whereNotNull('set_4_points_local')->orWhereNotNull('set_4_points_visitor')
                ->orWhereNotNull('set_5_points_local')->orWhereNotNull('set_5_points_visitor');
        })->exists();

        if ($hasNewFormat || $hasSetsFourOrFive) {
            throw new RuntimeException('No se puede revertir mientras existan partidos al mejor de cinco o tanteadores de sets 4/5.');
        }

        foreach (self::LEGACY_PHASES as $legacyPhase => $instance) {
            $expectedPhase = $legacyPhase === 'regular' ? 'regular' : 'playoff';
            $query = DB::table('games')->where('legacy_phase', $legacyPhase)
                ->where(fn ($builder) => $builder->where('phase', '!=', $expectedPhase)->orWhereNull('phase'));
            $instanceChanged = $instance === null
                ? DB::table('games')->where('legacy_phase', $legacyPhase)->whereNotNull('phase_instance')->exists()
                : DB::table('games')->where('legacy_phase', $legacyPhase)
                    ->where(fn ($builder) => $builder->where('phase_instance', '!=', $instance)->orWhereNull('phase_instance'))->exists();

            if ($query->exists() || $instanceChanged) {
                throw new RuntimeException('No se puede revertir porque un partido histórico cambió de fase o instancia desde la migración.');
            }
        }

        $unrestorable = DB::table('games')->where('phase', 'playoff')->whereNull('legacy_phase')
            ->where(fn ($query) => $query->whereNotIn('phase_instance', array_keys(self::INSTANCE_PHASES))->orWhereNull('phase_instance'))
            ->pluck('phase_instance')->unique()->all();

        if ($unrestorable !== []) {
            throw new RuntimeException('No se puede revertir sin perder instancias Play off personalizadas: '.implode(', ', $unrestorable).'.');
        }

        DB::table('games')->whereNotNull('legacy_phase')->update([
            'phase' => DB::raw('legacy_phase'),
        ]);
        foreach (self::INSTANCE_PHASES as $instance => $legacyPhase) {
            DB::table('games')->where('phase', 'playoff')->whereNull('legacy_phase')->where('phase_instance', $instance)
                ->update(['phase' => $legacyPhase]);
        }
        DB::table('games')->where('phase', 'regular')->whereNull('legacy_phase')->update(['phase' => 'regular']);

        Schema::table('results', function (Blueprint $table) {
            $table->dropColumn([
                'set_4_points_local', 'set_4_points_visitor',
                'set_5_points_local', 'set_5_points_visitor',
            ]);
        });

        Schema::table('games', function (Blueprint $table) {
            $table->dropColumn(['phase_instance', 'set_format', 'legacy_phase']);
        });
    }
};
