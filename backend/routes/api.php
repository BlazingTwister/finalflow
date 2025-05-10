<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\Lecturer\LecturerSubmissionSlotController; // <-- Add this
use App\Http\Controllers\Student\StudentSubmissionSlotController;


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

    // --- STUDENT TASK & SUB-TASK MANAGEMENT ROUTES ---
    Route::get('/tasks', [TaskController::class, 'index']); // Get tasks (now includes sub-tasks)
    Route::post('/tasks', [TaskController::class, 'store']); // Add task (can include sub-tasks)

    // Use a specific route for updating ONLY the status of the main task
    Route::patch('/tasks/{task}/status', [TaskController::class, 'updateStatus']); // Refined from original

    Route::delete('/tasks/{task}', [TaskController::class, 'destroy']); // Delete task (and its sub-tasks via cascade)

    // --- NEW Sub-Task Routes ---
    Route::post('/tasks/{task}/subtasks', [TaskController::class, 'storeSubTask']);    // Add sub-task to a task
    Route::patch('/subtasks/{subTask}/status', [TaskController::class, 'updateSubTaskStatus']); // Update status of a specific sub-task
    Route::delete('/subtasks/{subTask}', [TaskController::class, 'destroySubTask']); // Delete a specific sub-task

    // --- NEW Progress Route ---
    Route::get('/tasks/progress', [TaskController::class, 'getProgress']); // Get overall progress percentage

    // --- LECTURER SUBMISSION SLOT MANAGEMENT ROUTES ---
    Route::prefix('lecturer')->middleware(['auth:sanctum'/*, 'isLecturer'*/])->name('lecturer.')->group(function () {
    Route::get('/submission-slots/students', [LecturerSubmissionSlotController::class, 'getLecturerStudents'])->name('submission-slots.students'); // For fetching lecturer's students
    Route::get('/submission-slots', [LecturerSubmissionSlotController::class, 'index'])->name('submission-slots.index');
    Route::post('/submission-slots', [LecturerSubmissionSlotController::class, 'store'])->name('submission-slots.store');
    Route::get('/submission-slots/{submissionSlot}', [LecturerSubmissionSlotController::class, 'show'])->name('submission-slots.show');
    Route::put('/submission-slots/{submissionSlot}', [LecturerSubmissionSlotController::class, 'update'])->name('submission-slots.update'); // Using PUT for full update, PATCH for partial
    Route::delete('/submission-slots/{submissionSlot}', [LecturerSubmissionSlotController::class, 'destroy'])->name('submission-slots.destroy');
    Route::post('/submission-slots/{submissionSlot}/post', [LecturerSubmissionSlotController::class, 'postToStudents'])->name('submission-slots.post');
    
    }); 

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

