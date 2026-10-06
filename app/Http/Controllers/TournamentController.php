<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Tournament;
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
                ->whereNotIn('id_category', $linkedCategoryIds)
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

            $tournament->categories()->attach($data['id_category'], [
                'number_matches' => $data['number_matches'] ?? null,
                'number_teams' => $data['number_teams'] ?? null,
            ]);
        } else {
            DB::transaction(function () use ($data, $tournament) {
                $category = Category::create([
                    'name_category' => $data['name_category'],
                    'genero_category' => $data['genero_category'],
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

        $tournament->categories()->detach($category->id_category);

        return redirect()->route('tournaments.categories.index', $tournament);
    }

    public function create()
    {
        return Inertia::render('Tournaments/Create', [
            'categories' => Category::all(),
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

        $tournament = Tournament::create([
            'name_tournament' => $request->input('name_tournament'),
            'start_date' => $request->input('start_date'),
            'end_date' => $request->input('end_date'),
            'status_tournament' => $request->input('status_tournament'),
        ]);

        foreach ($request->input('categories') as $category) {
            $tournament->categories()->attach($category['id_category'], [
                'number_matches' => $category['number_matches'] ?? null ,
                'number_teams' => $category['number_teams'] ?? null,
            ]);
        }

        return redirect()->route('tournaments.index');
    }

    public function edit(Tournament $tournament)
    {
        return Inertia::render('Tournaments/Edit', [
            'tournament' => $tournament->load('categories'),
            'categories' => Category::all(),
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

        $tournament->update([
            'name_tournament' => $request->input('name_tournament'),
            'start_date' => $request->input('start_date'),
            'end_date' => $request->input('end_date'),
            'status_tournament' => $request->input('status_tournament'),
        ]);

        $tournament->categories()->sync(
            collect($request->input('categories'))->mapWithKeys(function ($category) {
                return [
                    $category['id_category'] => [
                        'number_matches' => $category['number_matches'] ?? null,
                        'number_teams' => $category['number_teams'] ?? null,
                    ],
                ];
            })->all()
            );

        return redirect()->route('tournaments.index');
    }

    public function destroy(Tournament $tournament)
    {

        if ($tournament->fixtures()->exists() || $tournament->games()->exists()) {
            return redirect()->back()->withErrors([
                'tournament' => 'No se puede eliminar el torneo porque tiene fixtures o partidos asociados.',
            ]);
        }

        $tournament->categories()->detach();
        $tournament->delete();

        return redirect()->route('tournaments.index');
    }
}
