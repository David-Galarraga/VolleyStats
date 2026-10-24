<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class LegacyGamePhaseMigrationTest extends TestCase
{
    public function test_existing_playoff_phase_codes_have_explicit_instance_mappings(): void
    {
        $migration = require dirname(__DIR__, 2).'/database/migrations/2026_10_23_000001_add_playoff_format_and_five_set_results.php';
        $reflection = new \ReflectionClass($migration);
        $legacyPhases = $reflection->getReflectionConstant('LEGACY_PHASES')->getValue();

        self::assertSame([
            'regular' => null,
            'playoff_16avos' => '16avos',
            'playoff_octavos' => 'Octavos',
            'playoff_cuartos' => 'Cuartos de final',
            'playoff_semifinal' => 'Semifinal',
            'playoff_final' => 'Final',
        ], $legacyPhases);
    }
}
