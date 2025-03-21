<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


//Student Task Management
use App\Http\Controllers\TaskController;

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



// PROTECTED ROUTES (Require Authentication)
Route::middleware(['auth:sanctum'])->group(function () {

    // USER PROFILE ROUTE (Protected)
    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });

    // STUDENT TASK MANAGEMENT ROUTES (Protected)
    Route::get('/tasks', [TaskController::class, 'index']); // Get tasks
    Route::post('/tasks', [TaskController::class, 'store']); // Add task
    Route::patch('/tasks/{task}', [TaskController::class, 'updateStatus']); // Update task status
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy']); // Delete task

    // LOGOUT ROUTE
    Route::post('/logout', [LoginController::class, 'destroy']);
});

