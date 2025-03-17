<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class RegisteredUserController extends Controller
{
    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): Response
    {
        $request->validate([
            'username' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'passwd' => ['required', 'confirmed', Rules\Password::defaults()],
            'user_role' => 'required|in:student,lecturer,admin',
        ]);

        $user = User::create([
            'username' => $request->name,
            'email' => $request->email,
            'passwd' => Hash::make($request->string('passwd')),
            'user_role' => $request->user_role, // Changed from 'role'
            'is_verified' => $request->user_role === 'student' ? true : false,
        ]);

        event(new Registered($user));

        return response()->json([
            'message' => 'Registration successful!',
            'user' => $user,
        ], 201);


        
        Auth::login($user);

        return response()->noContent();
    }
}
