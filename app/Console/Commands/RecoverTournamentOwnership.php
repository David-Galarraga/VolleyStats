<?php

namespace App\Console\Commands;

use App\Services\LegacyTournamentRecovery;
use Illuminate\Console\Command;

class RecoverTournamentOwnership extends Command
{
    protected $signature = 'tournaments:recover-ownership {--apply : Aplicar la recuperación; por defecto solo informa} {--assign=* : Asignación manual equipo:torneo, repetible}';

    protected $description = 'Revisar o separar datos históricos por torneo sin reutilizarlos en torneos nuevos';

    public function handle(LegacyTournamentRecovery $service): int
    {
        $manual = [];
        foreach ($this->option('assign') as $pair) {
            if (! preg_match('/^([1-9][0-9]*):([1-9][0-9]*)$/D', $pair, $match)) {
                $this->error('Usá --assign=equipo:torneo con identificadores positivos.');

                return self::FAILURE;
            }
            $manual[(int) $match[1]][] = (int) $match[2];
        }
        $report = $service->report($manual);
        $this->line(json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        if ($report['conflicts']) {
            $this->error('Resolvé los conflictos antes de aplicar.');

            return self::FAILURE;
        }
        if ($this->option('apply')) {
            $service->apply($manual);
            $this->info('Recuperación aplicada. Revisá y completá las inscripciones históricas antes de habilitarlas.');
        }

        return self::SUCCESS;
    }
}
