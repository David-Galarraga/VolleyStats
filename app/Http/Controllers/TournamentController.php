<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Delegate;
use App\Models\Tournament;
use App\Models\Trainer;
use App\Services\TournamentCategoryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class TournamentController extends Controller
{
    public function index()
    {
        $tournaments = Tournament::with('categories')->get();

        return Inertia::render('Tournaments/Index', [
            'tournaments' => $tournaments,
        ]);
    }

    public function show(Tournament $tournament)
    {
        $tournament->load([
            'categories' => fn ($query) => $query
                ->orderBy('name_category'),
        ]);

        return Inertia::render('Tournaments/Show', [
            'tournament' => $tournament,
        ]);
    }

    public function categories(Tournament $tournament)
    {
        $tournament->load(['categories' => fn ($query) => $query->orderBy('name_category')]);
        $linkedCategoryIds = $tournament->categories->pluck('id_category');

        return Inertia::render('Tournaments/Categories', [
            'tournament' => $tournament->only(['id', 'name_tournament']),
            'categories' => $tournament->categories,
            'availableCategories' => Category::query()
                ->whereNull('id_tournament')->whereNotIn('id_category', $linkedCategoryIds)
                ->orderBy('genero_category')
                ->orderBy('name_category')
                ->get(),
        ]);
    }

    public function storeCategory(Request $request, Tournament $tournament)
    {
        $data = $request->validate([
            'id_category' => 'nullable|integer|exists:categories,id_category',
            'name_category' => 'required_without:id_category|string|max:50',
            'genero_category' => 'required_without:id_category|string|max:50',
            'number_matches' => 'nullable|integer|min:0',
            'number_teams' => 'nullable|integer|min:0',
        ]);

        if (! empty($data['id_category'])) {
            if ($tournament->categories()->where('categories.id_category', $data['id_category'])->exists()) {
                return back()->withErrors(['id_category' => 'La categoría ya está asociada a este torneo.']);
            }

            app(TournamentCategoryService::class)->attach($tournament, Category::findOrFail($data['id_category']), [
                'number_matches' => $data['number_matches'] ?? null,
                'number_teams' => $data['number_teams'] ?? null,
            ]);
        } else {
            DB::transaction(function () use ($data, $tournament) {
                $category = Category::create([
                    'name_category' => $data['name_category'],
                    'genero_category' => $data['genero_category'],
                    'id_tournament' => $tournament->id,
                ]);

                $tournament->categories()->attach($category->id_category, [
                    'number_matches' => $data['number_matches'] ?? null,
                    'number_teams' => $data['number_teams'] ?? null,
                ]);
            });
        }

        return redirect()->route('tournaments.categories.index', $tournament);
    }

    public function updateCategory(Request $request, Tournament $tournament, Category $category)
    {
        abort_unless($tournament->categories()->where('categories.id_category', $category->id_category)->exists(), 404);

        abort_if($category->tournaments()->where('tournaments.id', '!=', $tournament->id)->exists(), 409, 'Separá las categorías históricas antes de editarlas.');
        $data = $request->validate([
            'name_category' => 'required|string|max:50',
            'genero_category' => 'required|string|max:50',
            'number_matches' => 'nullable|integer|min:0',
            'number_teams' => 'nullable|integer|min:0',
        ]);

        DB::transaction(function () use ($data, $category, $tournament) {
            $category->update([
                'name_category' => $data['name_category'],
                'genero_category' => $data['genero_category'],
            ]);

            $tournament->categories()->updateExistingPivot($category->id_category, [
                'number_matches' => $data['number_matches'] ?? null,
                'number_teams' => $data['number_teams'] ?? null,
            ]);
        });

        return redirect()->route('tournaments.categories.index', $tournament);
    }

    public function detachCategory(Tournament $tournament, Category $category)
    {
        abort_unless($tournament->categories()->where('categories.id_category', $category->id_category)->exists(), 404);

        app(TournamentCategoryService::class)->ensureRemovable($tournament, $category);
        $tournament->categories()->detach($category->id_category);

        return redirect()->route('tournaments.categories.index', $tournament);
    }

    public function create()
    {
        return Inertia::render('Tournaments/Create', [
            'categories' => Category::whereNull('id_tournament')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name_tournament' => 'required|string|max:100',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status_tournament' => ['nullable', 'string', Rule::in(['scheduled', 'in_progress', 'finished', 'canceled'])],

            'categories' => 'required|array|min:1',
            'categories.*.id_category' => 'required|exists:categories,id_category',
            'categories.*.number_matches' => 'nullable|integer|min:0',
            'categories.*.number_teams' => 'nullable|integer|min:0',
        ]);

        DB::transaction(function () use ($request) {
            $tournament = Tournament::create([
                'name_tournament' => $request->input('name_tournament'),
                'start_date' => $request->input('start_date'),
                'end_date' => $request->input('end_date'),
                'status_tournament' => $request->input('status_tournament'),
            ]);

            foreach ($request->input('categories') as $category) {
                app(TournamentCategoryService::class)->attach($tournament, Category::findOrFail($category['id_category']), [
                    'number_matches' => $category['number_matches'] ?? null,
                    'number_teams' => $category['number_teams'] ?? null,
                ]);
            }
        });

        return redirect()->route('tournaments.index');
    }

    public function edit(Tournament $tournament)
    {
        return Inertia::render('Tournaments/Edit', [
            'tournament' => $tournament->load('categories'),
            'categories' => Category::whereNull('id_tournament')->orWhere('id_tournament', $tournament->id)->get(),
        ]);
    }

    public function update(Request $request, Tournament $tournament)
    {
        $request->validate([
            'name_tournament' => 'required|string|max:100',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status_tournament' => ['nullable', 'string', Rule::in(['scheduled', 'in_progress', 'finished', 'canceled'])],

            'categories' => 'required|array|min:1',
            'categories.*.id_category' => 'required|exists:categories,id_category',
            'categories.*.number_matches' => 'nullable|integer|min:0',
            'categories.*.number_teams' => 'nullable|integer|min:0',
        ]);

        $selected = collect($request->input('categories'));
        foreach ($tournament->categories as $existing) {
            if (! $selected->contains('id_category', $existing->id_category)) {
                app(TournamentCategoryService::class)->ensureRemovable($tournament, $existing);
            }
        }
        DB::transaction(function () use ($tournament, $selected, $request) {
            $tournament->update($request->only(['name_tournament', 'start_date', 'end_date', 'status_tournament']));
            $keep = [];
            foreach ($selected as $item) {
                $pivot = ['number_matches' => $item['number_matches'] ?? null, 'number_teams' => $item['number_teams'] ?? null];
                $category = $tournament->categories()->whereKey($item['id_category'])->first();
                if ($category) {
                    $tournament->categories()->updateExistingPivot($category->getKey(), $pivot);
                } else {
                    $category = app(TournamentCategoryService::class)->attach($tournament, Category::findOrFail($item['id_category']), $pivot);
                }
                $keep[] = $category->getKey();
            }
            $tournament->categories()->detach($tournament->categories()->whereNotIn('categories.id_category', $keep)->pluck('categories.id_category'));
        });

        return redirect()->route('tournaments.index');
    }

    public function destroy(Tournament $tournament)
    {

        if ($tournament->fixtures()->exists() || $tournament->games()->exists() || $tournament->teams()->exists() || Delegate::where('id_tournament', $tournament->id)->exists() || Trainer::where('id_tournament', $tournament->id)->exists()
            || DB::table('playoff_matches')->where('tournament_id', $tournament->id)->exists()
            || DB::table('tournament_legacy_links')->where('id_tournament', $tournament->id)->exists()) {
            return redirect()->back()->withErrors([
                'tournament' => 'No se puede eliminar el torneo porque tiene equipos, personas, fixtures o actividad histórica asociada.',
            ]);
        }

        DB::transaction(function () use ($tournament) {
            $tournament->categories()->detach();
            Category::where('id_tournament', $tournament->id)->delete();
            $tournament->delete();
        });

        return redirect()->route('tournaments.index');
    }
}
