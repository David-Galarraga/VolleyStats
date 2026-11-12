<?php

namespace App\Policies;

use App\Models\Game;
use App\Models\User;
use Carbon\Carbon;

class GameSheetPolicy
{
    public function view(User $user, Game $game): bool
    {
        return $this->isAssignedPlanillero($user, $game);
    }

    public function update(User $user, Game $game): bool
    {
        return $this->isAssignedPlanillero($user, $game);
    }

    public function close(User $user, Game $game): bool
    {
        return $this->isAssignedPlanillero($user, $game);
    }

    private function isAssignedPlanillero(User $user, Game $game): bool
    {
        if (! $user->hasRole('Planillero') || ! $game->isAssignedTo($user)) {
            return false;
        }

        // El planillero asignado puede ver la planilla, pero no entrar a cargarla
        // ni cerrarla hasta que llegue el día del partido.
        if ($game->date === null) {
            return true;
        }

        return ! Carbon::parse($game->date)->isFuture();
    }
}
