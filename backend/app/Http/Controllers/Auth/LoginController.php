<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest; // Import the LoginRequest
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    /**
     * Handle an incoming login request.
     */
    public function store(LoginRequest $request): JsonResponse
    {
        // Authenticate the user using the LoginRequest
        $request->authenticate();

        // Regenerate the session ID for security
        $request->session()->regenerate();

        // Return a JSON response
        return response()->json([
            'message' => 'Login successful!',
            'user' => Auth::user(),
        ]);
    }

    /**
     * Handle an incoming logout request.
     */
    public function destroy(Request $request): JsonResponse
    {
        // Log the user out
        Auth::guard('web')->logout();

        // Invalidate the session
        $request->session()->invalidate();

        // Regenerate the CSRF token
        $request->session()->regenerateToken();

        // Return a JSON response
        return response()->json([
            'message' => 'Logout successful!',
        ]);
    }
}