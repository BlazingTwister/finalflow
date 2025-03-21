<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Task;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    // Get all tasks for the authenticated student
    public function index()
    {
        $tasks = Task::where('student_id', Auth::id())->get();
        return response()->json($tasks);
    }

    // Add a new task
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'required|date',
        ]);

        $task = Task::create([
            'student_id' => Auth::id(), // ✅ Automatically assign to logged-in student
            'title' => $request->title,
            'description' => $request->description,
            'due_date' => $request->due_date,
        ]);

        return response()->json(['message' => 'Task added successfully!', 'task' => $task], 201);
    }

    // Update task status
    public function updateStatus(Request $request, Task $task)
    {
        if ($task->student_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $task->update(['status' => $request->status]);
        return response()->json(['message' => 'Task status updated!', 'task' => $task]);
    }

    // Delete task
    public function destroy(Task $task)
    {
        if ($task->student_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $task->delete();
        return response()->json(['message' => 'Task deleted!']);
    }
}
