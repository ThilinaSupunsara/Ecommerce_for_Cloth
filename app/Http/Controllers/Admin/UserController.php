<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{

    public function index(): Response
    {

        $users = User::with('roles')
                    ->whereDoesntHave('roles', function ($query) {
                        $query->where('name', 'super_admin');
                    })
                    ->latest()
                    ->paginate(10);

        return Inertia::render('Admin/Users/Index', [
            'users' => $users
        ]);
    }


    public function store(StoreUserRequest $request): RedirectResponse
    {

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);


        $user->assignRole($request->role);

        return redirect()->back()->with('success', 'User created successfully.');
    }

   public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {


        $user->update([
            'name' => $request->name,
            'email' => $request->email,
           
            'password' => $request->password ? Hash::make($request->password) : $user->password,
        ]);

        $user->syncRoles($request->role);

        return redirect()->back()->with('success', 'User updated successfully.');
    }


     public function destroy(User $user): RedirectResponse
    {
        $user->delete();
        return redirect()->back()->with('success', 'User deleted successfully.');
    }
}
