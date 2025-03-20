<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// CSRF Token Authentication
Route::get('/csrf-token', function () {
    return response()->json(['csrf_token' => csrf_token()]);
});


//User Registeration
use App\Http\Controllers\Auth\RegisteredUserController;

Route::post('/register', [RegisteredUserController::class, 'store']);

//User Login
use App\Http\Controllers\Auth\LoginController;

Route::post('/login', [LoginController::class, 'store']);

Route::get('/check-login', function (Request $request) {
    if (session()->has('user')) {
        return response()->json(['user' => session('user')], 200);
    }
    return response()->json(['error' => 'Not logged in'], 401);
});