<?php

namespace App\Http\Controllers;

use App\Models\UserType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserTypeController extends Controller
{
    
    public function index()
    {
        $userTypes = UserType::all();
        
        return Inertia('UserTypes/Index', [
            'userTypes' => $userTypes
        ]);
    }

    
    public function create()
    {
        return Inertia('UserTypes/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name_user_type' => 'required|string|max:50',
            'description_user_type' => 'required|string|max:255',
        ]);

        $userType = UserType::create([
            'name_user_type' => $request->input('name_user_type'),
            'description_user_type' => $request->input('description_user_type'),
        ]);

        return redirect()->route('user-types.index');
    }

    public function show(UserType $userType)
    {
        return Inertia('UserTypes/Show', [
            'userType' => $userType,
        ]);
    }

    public function edit(UserType $userType)
    {
        return Inertia('UserTypes/Edit', [
            'userType' => $userType,
        ]);
    }

    public function update(Request $request, UserType $userType)
    {
        $request->validate([
            'name_user_type' => 'required|string|max:50',
            'description_user_type' => 'required|string',
        ]);

        $userType->update([
            'name_user_type' => $request->input('name_user_type'),
            'description_user_type' => $request->input('description_user_type'),
        ]);

        return redirect()->route('user-types.index');
    }

    public function destroy(UserType $userType)
    {
        $userType->delete();

        return redirect()->route('user-types.index');
    }
}
