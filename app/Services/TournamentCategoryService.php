<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Game;
use App\Models\Team;
use App\Models\Tournament;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TournamentCategoryService
{
    public function attach(Tournament $tournament, Category $source, array $pivot = []): Category
    {
        return DB::transaction(function () use ($tournament, $source, $pivot) {
            $category = Category::create(['name_category' => $source->name_category, 'genero_category' => $source->genero_category, 'id_tournament' => $tournament->id]);
            $tournament->categories()->attach($category->getKey(), $pivot);

            return $category;
        });
    }

    public function ensureRemovable(Tournament $tournament, Category $category): void
    {
        if (Team::where('id_tournament', $tournament->id)->where('id_category', $category->getKey())->exists()
            || Game::where('id_tournament', $tournament->id)->where('id_category', $category->getKey())->exists()
            || DB::table('playoff_brackets')->where('tournament_id', $tournament->id)->where('category_id', $category->getKey())->exists()) {
            throw ValidationException::withMessages(['categories' => 'No se puede quitar una categoría con equipos o actividad deportiva.']);
        }
    }
}
