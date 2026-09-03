<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{

    public function index()
    {
        $categories = Category::all();
        
       return Inertia::render('Categories/Index', [
            'categories' => $categories,
        ]);
    }


    public function create()
    {
        return Inertia::render('Categories/Create');
    }


    public function store(Request $request)
    {
        $request->validate([
            'name_category' => 'required|string|max:50',
            'genero_category' => 'required|string',
        ]);

        $category = Category::create([
            'name_category' => $request->input('name_category'),
            'genero_category' => $request->input('genero_category'),
        ]);

        return redirect()->route('categories.index');
    }


    public function show(Category $category)
    {
        //
    }

    
    public function edit(Category $category)
    {
        return Inertia::render('Categories/Edit', [
            'category' => $category,
        ]);
    }

    
    public function update(Request $request, Category $category)
    {

        $request->validate([
            'name_category' => 'required|string|max:50',
            'genero_category' => 'required|string',
        ]);

        $category->update([
            'name_category' => $request->input('name_category'),
            'genero_category' => $request->input('genero_category'),
        ]);

        return redirect()->route('categories.index');
    }

    
    public function destroy(Category $category)
    {

        $category->delete();

        return redirect()->route('categories.index');
    }
}
