<?php

namespace App\Policies;

use App\Models\Game;
use App\Models\User;

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
        return $user->hasRole('Planillero') && $game->isAssignedTo($user);
    }
}
