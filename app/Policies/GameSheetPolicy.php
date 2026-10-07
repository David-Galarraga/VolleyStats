<?php

namespace App\Policies;

use App\Models\Game;
use App\Models\User;

class GameSheetPolicy
{
    public function view(User $user, Game $game): bool
    {
        return $this->isStaff($user);
    }

    public function update(User $user, Game $game): bool
    {
        return $this->isStaff($user);
    }

    public function close(User $user, Game $game): bool
    {
        return $this->isStaff($user);
    }

    private function isStaff(User $user): bool
    {
        return true;
    }
}
