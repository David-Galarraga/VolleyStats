<?php

namespace App\Policies;

use App\Models\MatchRoster;
use App\Models\User;

class MatchRosterPolicy
{
    public function view(User $user, MatchRoster $roster): bool
    {
        return false;
    }

    public function update(User $user, MatchRoster $roster): bool
    {
        return false;
    }
}
