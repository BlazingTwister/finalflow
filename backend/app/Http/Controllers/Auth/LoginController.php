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

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }
    
        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken; // Generate token

        // Determine redirection based on role
        $redirectPath = match ($user->user_role) {
            'admin' => '/admin/dashboard',
            'lecturer' => '/lecturer/dashboard',
            'student' => '/student/dashboard',
            default => '/login',
        };
    
        return response()->json([
            'message' => 'Login successful!',
            'user' => $user,
            'token' => $token,
            'redirect' => $redirectPath,
        ], 200);
    }

    /**
     * Handle an incoming logout request.
     */
    public function destroy(Request $request): JsonResponse
    {
        // Revoke the current access token
        $request->user()->currentAccessToken()->delete();

        
        session()->forget('user');

        return response()->json([
            'message' => 'Logout successful!',
        ], 200);
        
    }
}
