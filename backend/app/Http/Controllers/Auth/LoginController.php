<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest; // Import the LoginRequest
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

use App\Models\User;


class LoginController extends Controller
{
     /**
     * Handle an incoming login request.
     */
    public function store(Request $request): JsonResponse
    {
        // Validate input
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $credentials = $request->only('email', 'password');

        // Check if user exists
        $user = User::where('email', $credentials['email'])->first();

        if (!$user) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        // Verify password
        if (!Hash::check($credentials['password'], $user->password)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        // Store user in session
        session(['user' => $user]);

        // Determine redirection based on role
        $redirectPath = match ($user->user_role) {
            'admin' => '/admin/dashboard',
            'lecturer' => '/lecturer/dashboard',
            'student' => '/student/dashboard',
            default => '/login',
        };

        // Return response with token, user data, and redirection path
        return response()->json([
            'message' => 'Login successful!',
            'user' => $user,
            'redirect' => $redirectPath,
        ], 200);
    }

    /**
     * Handle an incoming logout request.
     */
    public function destroy(Request $request): JsonResponse
    {
        // Remove user from session
        session()->forget('user');

        return response()->json([
            'message' => 'Logout successful!',
        ]);
    }
}