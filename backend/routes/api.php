<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\Lecturer\LecturerSubmissionSlotController; // Existing
use App\Http\Controllers\Student\StudentSubmissionController; // New

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// --- Public Routes ---
Route::get('/csrf-token', function () {
    return response()->json(['csrf_token' => csrf_token()]);
});
Route::post('/register', [RegisteredUserController::class, 'store']);
Route::post('/login', [LoginController::class, 'store']);
Route::get('/check-login', function (Request $request) {
    if (session()->has('user')) {
        return response()->json(['user' => session('user')], 200);
    }
    return response()->json(['error' => 'Not logged in'], 401);
});


// --- Authenticated Routes ---
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });
    Route::post('/logout', [LoginController::class, 'destroy']);

    // --- Student Task Management ---
    Route::prefix('tasks')->group(function () {
        Route::get('/', [TaskController::class, 'index']);
        Route::post('/', [TaskController::class, 'store']);
        Route::get('/progress', [TaskController::class, 'getProgress']);
        Route::patch('/{task}/status', [TaskController::class, 'updateStatus']); // For main task status
        Route::delete('/{task}', [TaskController::class, 'destroy']);
        // Sub-tasks
        Route::post('/{task}/subtasks', [TaskController::class, 'storeSubTask']);
        Route::patch('/subtasks/{subTask}/status', [TaskController::class, 'updateSubTaskStatus']);
        Route::delete('/subtasks/{subTask}', [TaskController::class, 'destroySubTask']);
    });


    // --- Admin User Management ---
    Route::prefix('admin')->middleware(['auth:sanctum'/*, 'isAdmin'*/])->group(function () { // Add isAdmin middleware if you have one
        Route::get('/users', [AdminController::class, 'index']);
        Route::patch('/users/{user}/role', [AdminController::class, 'updateRole']);
        Route::patch('/users/{student}/assign-supervisor', [AdminController::class, 'assignSupervisor']);
        Route::delete('/users/{user}', [AdminController::class, 'destroy']);
        Route::get('/lecturers', [AdminController::class, 'getLecturers']);
    });

    /// --- Lecturer Routes ---
    Route::prefix('lecturer')->middleware(['auth:sanctum'/*, 'isLecturer'*/])->group(function () {

        // --- Submission Slot Management (Existing) ---
        Route::prefix('submission-slots')->group(function() {
            Route::get('/', [LecturerSubmissionSlotController::class, 'index']);
            Route::post('/', [LecturerSubmissionSlotController::class, 'store']);
            Route::get('/students', [LecturerSubmissionSlotController::class, 'getLecturerStudents']); // Used by both features
            Route::get('/{submissionSlot}', [LecturerSubmissionSlotController::class, 'show']);
            Route::put('/{submissionSlot}', [LecturerSubmissionSlotController::class, 'update']);
            Route::delete('/{submissionSlot}', [LecturerSubmissionSlotController::class, 'destroy']);
            Route::post('/{submissionSlot}/post', [LecturerSubmissionSlotController::class, 'postToStudents']);
            Route::patch('/student-submissions/{studentSubmission}/acknowledge', [LecturerSubmissionSlotController::class, 'acknowledgeSubmission']);
            Route::post('/student-submissions/{studentSubmission}/comment', [LecturerSubmissionSlotController::class, 'addComment']);
            Route::get('/submission-files/{submissionFile}/download', [LecturerSubmissionSlotController::class, 'downloadFile']);
        });

        // --- NEW: Student Task Check-up Route ---
        // This route should be directly under the 'lecturer' prefix, not nested further
        // unless intended. The path 'supervised-students/{student}/tasks' is relative to '/lecturer'.
        Route::get('supervised-students/{student}/tasks', [TaskController::class, 'getTasksForStudentByLecturer'])
            ->name('lecturer.student.tasks.show'); // Naming the route is good practice

    });

    

    // --- Student Submission Management ---
    Route::prefix('student/submission-slots')->middleware(['auth:sanctum'/*, 'isStudent'*/])->group(function () { // Add isStudent middleware
        Route::get('/', [StudentSubmissionController::class, 'index'])->name('student.slots.index'); // List assigned slots
        Route::post('/{submissionSlot}/submit', [StudentSubmissionController::class, 'submit'])->name('student.slots.submit'); // Submit work
        // Route to view a specific submission made by the student (including files and comments)
        Route::get('/my-submissions/{studentSubmission}', [StudentSubmissionController::class, 'showMySubmission'])
            ->name('student.submissions.show');
    });

});

