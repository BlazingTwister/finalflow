<?php
// app/Http/Controllers/TaskController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Task;
use App\Models\User; 
use App\Models\SubTask; // Add SubTask model
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB; // Add for database transactions
use Illuminate\Validation\Rule; // Add for Rule::in validation

class TaskController extends Controller
{
    // Valid statuses for main tasks
    private $mainTaskStatuses = ['pending', 'in_progress', 'completed'];
    // Valid statuses for sub-tasks (as defined in sub_tasks migration)
    private $subTaskStatuses = ['pending', 'completed'];

    /**
     * Get all tasks (including sub-tasks) for the authenticated student.
     */
    public function index()
    {
        // Eager load sub-tasks to avoid N+1 query problem when accessing $task->subTasks later
        $tasks = Task::with('subTasks') // Eager load the relationship defined in Task model
                   ->where('student_id', Auth::id())
                   ->orderBy('due_date', 'asc') 
                   ->get();

        // Return tasks with their sub-tasks nested within the JSON response
        return response()->json($tasks);
    }

    /**
     * Add a new task, potentially with sub-tasks.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'required|date',
            'sub_tasks' => 'nullable|array', // Expect an array of sub-task titles (if provided)
            'sub_tasks.*' => 'sometimes|required|string|max:255' // Validate each sub-task title if 'sub_tasks' array exists and is not empty
        ]);

        // Use a database transaction to ensure that either the task and all its
        // sub-tasks are created, or none of them are (atomicity).
        $task = DB::transaction(function () use ($validated, $request) {
            // Create the main task
            $task = Task::create([
                'student_id' => Auth::id(), // Assign to the currently authenticated user
                'title' => $validated['title'],
                'description' => $validated['description'],
                'due_date' => $validated['due_date'],
                // 'status' defaults to 'pending' as per the tasks migration
            ]);

            // If sub-tasks were provided in the request, create them and associate with the main task
            if (!empty($validated['sub_tasks'])) {
                $subTaskData = [];
                foreach ($validated['sub_tasks'] as $subTaskTitle) {
                     // Prepare data for batch insertion if needed, or create one by one
                     // Using the relationship method create() automatically sets the task_id
                    $task->subTasks()->create([
                        'title' => $subTaskTitle,
                        // 'status' defaults to 'pending' as per sub_tasks migration
                    ]);
                }
            
                // $subTaskModels = [];
                // foreach ($validated['sub_tasks'] as $subTaskTitle) {
                //     $subTaskModels[] = new SubTask(['title' => $subTaskTitle]);
                // }
                // $task->subTasks()->saveMany($subTaskModels);
            }
            return $task; // Return the created task from the transaction closure
        });

        // Load the sub-tasks relationship for the response, even if none were added initially
         $task->load('subTasks');

        return response()->json(['message' => 'Task added successfully!', 'task' => $task], 201); // 201 Created status
    }

    /**
     * Update the status of a MAIN task.
     * This action marks the parent task complete/pending/in_progress directly.
     */
    public function updateStatus(Request $request, Task $task)
    {
        // Authorization check: Ensure the task belongs to the authenticated user
        if ($task->student_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized action.'], 403); // 403 Forbidden
        }

        $validated = $request->validate([
            // Ensure the provided status is one of the allowed values for main tasks
            'status' => ['required', Rule::in($this->mainTaskStatuses)],
        ]);

        $task->update(['status' => $validated['status']]);

        $task->load('subTasks'); // Reload sub-tasks for the response
        return response()->json(['message' => 'Task status updated!', 'task' => $task]);
    }

    /**
     * Delete a MAIN task.
     * Sub-tasks will be deleted automatically due to the 'onDelete('cascade')' constraint
     * set in the `create_sub_tasks_table` migration.
     */
    public function destroy(Task $task)
    {
         // Authorization check
        if ($task->student_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized action.'], 403);
        }

        // Deleting the task will trigger the cascade delete for related sub-tasks in the database
        $task->delete();

        // Use 200 OK or 204 No Content for successful deletion
        return response()->json(['message' => 'Task and its sub-tasks deleted successfully!'], 200);
        // Alternatively: return response()->noContent(); // If no message body is needed
    }

    

    /**
     * Add a single sub-task to an existing task.
     * Useful if you allow adding sub-tasks after the main task is created.
     */
    public function storeSubTask(Request $request, Task $task)
    {
        // Authorization: Ensure the parent task belongs to the user
        if ($task->student_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized to add sub-task to this task.'], 403);
        }

        // Prevent adding sub-tasks if the main task is already marked 'completed'
        if ($task->status === 'completed') {
             return response()->json(['error' => 'Cannot add sub-tasks to a task already marked as completed.'], 400); // 400 Bad Request
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
        ]);

        // Create the sub-task using the relationship
        $subTask = $task->subTasks()->create([
            'title' => $validated['title'],
             // status defaults to 'pending'
        ]);

        // Return the newly created sub-task
        return response()->json(['message' => 'Sub-task added successfully!', 'sub_task' => $subTask], 201);
    }

    /**
     * Update the status of a specific sub-task.
     * Handles checking if the parent task should be auto-completed.
     */
    public function updateSubTaskStatus(Request $request, SubTask $subTask) // Route model binding for SubTask
    {
         // Authorization: Ensure the sub-task's parent task belongs to the authenticated user
        if ($subTask->task->student_id !== Auth::id()) {
             return response()->json(['error' => 'Unauthorized action.'], 403);
        }

        $validated = $request->validate([
            'status' => ['required', Rule::in($this->subTaskStatuses)], // Validate against allowed sub-task statuses
        ]);

        // Prevent updating sub-task if the main task is already marked 'completed'
        if ($subTask->task->status === 'completed') {
            return response()->json(['error' => 'Cannot update sub-task status; parent task is already marked completed.'], 400);
        }

        // Update the sub-task status
        $subTask->update(['status' => $validated['status']]);

        
        $parentTask = $subTask->task; // Get the parent task instance

        // Check if ALL sibling sub-tasks (including the one just updated) are now 'completed'
        $allSubTasksCompleted = $parentTask->subTasks() // Query the relationship
                                          ->where('status', '!=', 'completed') // Look for any that are NOT completed
                                          ->doesntExist(); // Returns true if no pending sub-tasks are found

        if ($allSubTasksCompleted) {
            // If all sub-tasks are completed, update the parent task's status
            $parentTask->update(['status' => 'completed']);
            // Refresh the parentTask instance variable with the new status
            $parentTask->refresh();
        }
         

        // Return the updated sub-task and the (potentially updated) parent task status
        return response()->json([
            'message' => 'Sub-task status updated!',
            'sub_task' => $subTask, // Send back the updated sub-task
            'parent_task_status' => $parentTask->status // Send back the current status of the parent
         ]);
    }

    /**
     * Delete a specific sub-task.
     * Handles checking if the parent task should be auto-completed after deletion.
     */
    public function destroySubTask(SubTask $subTask) // Route model binding
    {
         // Authorization check
        if ($subTask->task->student_id !== Auth::id()) {
             return response()->json(['error' => 'Unauthorized action.'], 403);
        }

         
         // if ($subTask->task->status === 'completed') {
         //     return response()->json(['error' => 'Cannot delete sub-task from a completed parent task.'], 400);
         // }

        $parentTask = $subTask->task; // Get parent task instance BEFORE deleting sub-task
        $subTask->delete();

         
         // This logic runs only if the parent task was NOT already 'completed'.
         if ($parentTask->status !== 'completed') {
             // Check if any sub-tasks still exist for this parent task
             $hasRemainingSubTasks = $parentTask->subTasks()->exists();

            if ($hasRemainingSubTasks) {
                 // If sub-tasks remain, check if all of them are now completed
                 $allRemainingSubTasksCompleted = $parentTask->subTasks()
                                                             ->where('status', '!=', 'completed')
                                                             ->doesntExist();
                if ($allRemainingSubTasksCompleted) {
                    // If all remaining sub-tasks are complete, mark the parent as complete
                    $parentTask->update(['status' => 'completed']);
                }
            }
            
            // Should the parent task revert to 'pending' or stay 'in_progress'?
            // else {
            //    // If needed, handle the case where the last sub-task was deleted.
            //    // $parentTask->update(['status' => 'pending']); // Example: revert to pending
            // }
         }
         // Refresh the parent task instance to get the latest status after potential update
        $parentTask->refresh();
        

        return response()->json([
            'message' => 'Sub-task deleted successfully!',
            'parent_task_status' => $parentTask->status // Return the final status of the parent
            ], 200);
    }

    
    /**
     * Calculate and return the overall project progress percentage for the student.
     */
    public function getProgress()
    {
        $studentId = Auth::id(); // Get the authenticated student's ID

        // Fetch all tasks for the student, making sure to include sub-tasks
        $tasks = Task::with('subTasks') // Eager load sub-tasks
                   ->where('student_id', $studentId)
                   ->get();

        // Handle the case where the student has no tasks yet
        if ($tasks->isEmpty()) {
            return response()->json(['progress' => 0]); // 0% progress if no tasks
        }

        $totalProgressItems = 0; // The denominator for the percentage calculation
        $completedProgressItems = 0; // The numerator

        foreach ($tasks as $task) {
             // Case 1: The main task itself is marked as 'completed'.
             // In this case, it counts as 1 completed item, regardless of sub-tasks.
            if ($task->status === 'completed') {
                $totalProgressItems++;
                $completedProgressItems++;
             }
            // Case 2: The main task is NOT 'completed', AND it HAS sub-tasks.
             // Progress is determined by the completion of its sub-tasks.
             // Need ->count() check because ->isNotEmpty() can be true for an empty but loaded relation.
             elseif ($task->subTasks->count() > 0) {
                // Add the number of sub-tasks to the total items
                $totalProgressItems += $task->subTasks->count();
                // Add the number of *completed* sub-tasks to the completed items
                $completedProgressItems += $task->subTasks->where('status', 'completed')->count();
             }
            // Case 3: The main task is NOT 'completed', AND it has NO sub-tasks.
             // This task counts as 1 total item, but 0 completed items.
             else { // Task status is 'pending' or 'in_progress', and no sub-tasks exist
                $totalProgressItems++;
                // Completed items count doesn't increase for this task
             }
        }

        // Calculate the percentage. Avoid division by zero if $totalProgressItems is 0 (though handled by isEmpty check earlier).
        $progressPercentage = ($totalProgressItems > 0) ? round(($completedProgressItems / $totalProgressItems) * 100) : 0;

        // Return the calculated progress percentage
        return response()->json(['progress' => $progressPercentage]);
    }

    
    /**
     * Get all tasks (including sub-tasks) for a specific student,
     * accessible by their authenticated supervisor.
     *
     * @param \Illuminate\Http\Request $request
     * @param \App\Models\User $student The student user model instance (route-model bound).
     * @return \Illuminate\Http\JsonResponse
     */
    public function getTasksForStudentByLecturer(Request $request, User $student)
    {
        $lecturer = Auth::user();

        // 1. Ensure authenticated user is a lecturer
        if (!$lecturer || $lecturer->user_role !== 'lecturer') {
            return response()->json(['error' => 'Unauthorized. Only lecturers can perform this action.'], 403);
        }

        // 2. Ensure the target student is supervised by this lecturer
        // This relies on the 'supervisor_id' field on the student's User model.
        if ($student->supervisor_id !== $lecturer->id) {
            // Alternative check using the relationship (might be slightly less direct if supervisor_id is already loaded):
            // if (!$lecturer->supervisees()->where('id', $student->id)->exists()) {
            return response()->json(['error' => 'You do not supervise this student, or the student was not found.'], 403);
        }

        // 3. Ensure the target user is actually a student
        if ($student->user_role !== 'student') {
            return response()->json(['error' => 'The specified user is not a student.'], 400); // Bad Request
        }

        // 4. Fetch tasks for the student, including sub-tasks
        $tasks = $student->tasks() // Uses the 'tasks' relationship defined in the User model
                         ->with('subTasks') // Eager load sub-tasks
                         ->orderBy('due_date', 'asc') // Order by due date, or any other preference
                         ->get();

        return response()->json($tasks);
    }
}
