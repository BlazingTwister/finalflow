<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate; // For authorization
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    // Basic admin check (replace with proper middleware/policy if needed)
    private function ensureAdmin(Request $request)
    {
        if ($request->user()->user_role !== 'admin') {
            abort(403, 'Unauthorized action.');
        }
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->ensureAdmin($request);

        $query = User::query()->with('supervisor:id,fname,lname'); // Eager load supervisor name

        // Search functionality
        if ($request->has('search') && $request->search != '') {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('fname', 'like', "%{$searchTerm}%")
                  ->orWhere('lname', 'like', "%{$searchTerm}%")
                  ->orWhere('email', 'like', "%{$searchTerm}%");
            });
        }

        // Filter by role
        if ($request->has('role') && in_array($request->role, ['student', 'lecturer', 'admin'])) {
            $query->where('user_role', $request->role);
        }

        // Exclude the current admin user from the list if desired
        // $query->where('id', '!=', $request->user()->id);

        $users = $query->orderBy('lname')->orderBy('fname')->paginate(15); // Paginate results

        return response()->json($users);
    }

    /**
     * Update the user's role.
     */
    public function updateRole(Request $request, User $user)
    {
         $this->ensureAdmin($request);

        // Prevent admin from changing their own role via this endpoint
        if ($request->user()->id === $user->id) {
             return response()->json(['message' => 'Admin cannot change their own role here.'], 400);
        }

        $validated = $request->validate([
            'user_role' => ['required', Rule::in(['student', 'lecturer', 'admin'])],
        ]);

        // If changing role away from student, remove supervisor link
        if ($user->user_role === 'student' && $validated['user_role'] !== 'student') {
            $user->supervisor_id = null;
        }
        // If changing role TO student from something else, supervisor_id remains null (must be assigned separately)

        $user->update(['user_role' => $validated['user_role']]);

        // Return the updated user (without supervisor relation unless requested)
         $user->load('supervisor:id,fname,lname'); // Reload with supervisor if needed
        return response()->json(['message' => 'User role updated successfully.', 'user' => $user]);
    }

    /**
    * Assign a supervisor (lecturer) to a student.
    */
    public function assignSupervisor(Request $request, User $student) // Use route model binding
    {
         $this->ensureAdmin($request);

        // Ensure the target user is a student
        if ($student->user_role !== 'student') {
            return response()->json(['message' => 'Can only assign supervisors to students.'], 400);
        }

        $validated = $request->validate([
            // Ensure the supervisor_id exists in the users table and has the 'lecturer' role
            'supervisor_id' => [
                'required',
                'nullable', // Allow unassigning by sending null
                Rule::exists('users', 'id')->where(function ($query) {
                    return $query->where('user_role', 'lecturer');
                }),
             ]
        ]);

        $student->update(['supervisor_id' => $validated['supervisor_id']]);

        // Return the updated student with the supervisor info loaded
        $student->load('supervisor:id,fname,lname');
        return response()->json(['message' => 'Supervisor assigned successfully.', 'user' => $student]);
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, User $user)
    {
        $this->ensureAdmin($request);

        // Prevent admin from deleting themselves
        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'Admin cannot delete themselves.'], 400);
        }

        // Optional: Add logic here if deleting a lecturer needs to reassign their students

        $user->delete();

        return response()->json(['message' => 'User deleted successfully.']);
    }

    /**
    * Get a list of users with the 'lecturer' role.
    */
    public function getLecturers(Request $request)
    {
         $this->ensureAdmin($request);

         $lecturers = User::where('user_role', 'lecturer')
                          ->select('id', 'fname', 'lname') // Select only needed fields
                          ->orderBy('lname')
                          ->orderBy('fname')
                          ->get();

        return response()->json($lecturers);
    }
}
