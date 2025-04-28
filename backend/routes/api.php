<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\AdminController;


//Student Task Management

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// CSRF Token Authentication
Route::get('/csrf-token', function () {
    return response()->json(['csrf_token' => csrf_token()]);
});


//User Registeration
Route::post('/register', [RegisteredUserController::class, 'store']);


//User Login
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

    // --- ADMIN USER MANAGEMENT ROUTES ---
    // Apply 'isAdmin' middleware if you have one, or add checks within controller
    Route::prefix('admin')->middleware(['auth:sanctum'/*, 'isAdmin'*/])->group(function () {
        Route::get('/users', [AdminController::class, 'index']); // Get all users (with search/filter)
        Route::patch('/users/{user}/role', [AdminController::class, 'updateRole']); // Change user role
        Route::patch('/users/{student}/assign-supervisor', [AdminController::class, 'assignSupervisor']); // Assign supervisor
        Route::delete('/users/{user}', [AdminController::class, 'destroy']); // Delete user
        Route::get('/lecturers', [AdminController::class, 'getLecturers']); // Get list of lecturers for supervisor assignment
    });
});

