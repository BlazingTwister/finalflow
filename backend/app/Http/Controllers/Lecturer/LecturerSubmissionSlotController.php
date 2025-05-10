<?php

namespace App\Http\Controllers\Lecturer;

use App\Http\Controllers\Controller;
use App\Models\SubmissionSlot;
use App\Models\User; // For fetching lecturer's students
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class LecturerSubmissionSlotController extends Controller
{
    /**
     * Display a listing of the submission slots created by the authenticated lecturer.
     */
    public function index()
    {
        $lecturer = Auth::user();
        if ($lecturer->user_role !== 'lecturer') {
            return response()->json(['error' => 'Unauthorized. Only lecturers can view submission slots.'], 403);
        }

        $submissionSlots = SubmissionSlot::where('lecturer_id', $lecturer->id)
            ->orderBy('due_date', 'desc')
            ->get();

        return response()->json($submissionSlots);
    }

    /**
     * Store a newly created submission slot in storage.
     */
    public function store(Request $request)
    {
        $lecturer = Auth::user();
        if ($lecturer->user_role !== 'lecturer') {
            return response()->json(['error' => 'Unauthorized. Only lecturers can create submission slots.'], 403);
        }

        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'due_date' => 'required|date|after_or_equal:today',
                // 'post_to_students' will be handled in a separate method or an update after creation
            ]);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }

        $submissionSlot = SubmissionSlot::create([
            'lecturer_id' => $lecturer->id,
            'name' => $validatedData['name'],
            'description' => $validatedData['description'],
            'due_date' => $validatedData['due_date'],
            'status' => 'open', // Default status
        ]);

        return response()->json(['message' => 'Submission slot created successfully!', 'submission_slot' => $submissionSlot], 201);
    }

    /**
     * Display the specified submission slot.
     * This will also include information about student submissions for this slot.
     */
    public function show(SubmissionSlot $submissionSlot)
    {
        $lecturer = Auth::user();
        if ($submissionSlot->lecturer_id !== $lecturer->id || $lecturer->user_role !== 'lecturer') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Load assigned students and their submission status for this slot
        $slotDetails = $submissionSlot->load([
            'assignedStudents' => function ($query) {
                $query->select('users.id', 'users.fname', 'users.lname', 'users.email'); // Select only necessary student fields
            },
            'assignedStudents.submissions' => function ($query) use ($submissionSlot) {
                $query->where('submission_slot_id', $submissionSlot->id)
                      ->with('files:id,student_submission_id,file_name,uploaded_at'); // Load files for each submission
            }
        ]);
        
        // Process to easily see who submitted and who hasn't
        $studentsData = $submissionSlot->lecturer->supervisees()->get(['id', 'fname', 'lname', 'email']); // Get all students supervised by this lecturer. Adjust if your student fetching logic is different.
        
        $assignedStudentIds = $slotDetails->assignedStudents->pluck('id')->toArray();

        $submissionStatus = $studentsData->map(function ($student) use ($slotDetails, $assignedStudentIds) {
            $isAssigned = in_array($student->id, $assignedStudentIds);
            $submission = null;
            if ($isAssigned) {
                 $assignedStudent = $slotDetails->assignedStudents->firstWhere('id', $student->id);
                 if($assignedStudent && $assignedStudent->submissions){
                    // A student can have multiple submission entries if re-submissions are allowed,
                    // for simplicity, we take the latest. Or if unique constraint is set, there will be only one.
                    $submission = $assignedStudent->submissions->first(); // Get the first (or only) submission
                 }
            }

            return [
                'student_id' => $student->id,
                'fname' => $student->fname,
                'lname' => $student->lname,
                'email' => $student->email,
                'is_assigned_to_slot' => $isAssigned,
                'has_submitted' => !is_null($submission),
                'submission_details' => $submission ? [
                    'id' => $submission->id,
                    'submitted_at' => $submission->submitted_at->format('Y-m-d H:i:s'),
                    'acknowledgement_status' => $submission->acknowledgement_status,
                    'lecturer_comment' => $submission->lecturer_comment,
                    'acknowledged_at' => $submission->acknowledged_at ? $submission->acknowledged_at->format('Y-m-d H:i:s') : null,
                    'files' => $submission->files->map(fn($file) => ['name' => $file->file_name, 'uploaded_at' => $file->uploaded_at->format('Y-m-d H:i:s')])
                ] : null,
            ];
        });


        return response()->json([
            'slot' => [ // Basic slot info
                'id' => $slotDetails->id,
                'name' => $slotDetails->name,
                'description' => $slotDetails->description,
                'due_date' => $slotDetails->due_date->format('Y-m-d H:i:s'),
                'status' => $slotDetails->status,
                'created_at' => $slotDetails->created_at->format('Y-m-d H:i:s'),
            ],
            'submission_statuses' => $submissionStatus // Detailed status for each of the lecturer's students
        ]);
    }


    /**
     * Update the specified submission slot in storage.
     */
    public function update(Request $request, SubmissionSlot $submissionSlot)
    {
        $lecturer = Auth::user();
        if ($submissionSlot->lecturer_id !== $lecturer->id || $lecturer->user_role !== 'lecturer') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Prevent updates if past due date and not just changing status to 'closed'
        if ($submissionSlot->due_date->isPast() && $submissionSlot->status === 'open') {
             // Allow updating status to 'closed' or other non-content fields if needed.
            if (!($request->has('status') && count($request->all()) === 1)) {
                 return response()->json(['error' => 'Cannot update slot details after the due date has passed, unless closing it.'], 403);
            }
        }

        try {
            $validatedData = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'due_date' => 'sometimes|required|date|after_or_equal:today', // Allow update only if not past
                'status' => 'sometimes|required|in:open,closed',
            ]);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
        
        // If due_date is being updated, ensure it's not set to past for an open slot
        if (isset($validatedData['due_date'])) {
            $newDueDate = \Carbon\Carbon::parse($validatedData['due_date']);
            if ($newDueDate->isPast() && (isset($validatedData['status']) ? $validatedData['status'] === 'open' : $submissionSlot->status === 'open')) {
                 return response()->json(['errors' => ['due_date' => ['Due date cannot be set to the past for an open slot.']]], 422);
            }
        }


        $submissionSlot->update($validatedData);

        return response()->json(['message' => 'Submission slot updated successfully!', 'submission_slot' => $submissionSlot]);
    }

    /**
     * Remove the specified submission slot from storage.
     */
    public function destroy(SubmissionSlot $submissionSlot)
    {
        $lecturer = Auth::user();
        if ($submissionSlot->lecturer_id !== $lecturer->id || $lecturer->user_role !== 'lecturer') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Add any other checks, e.g., if submissions exist, maybe prevent deletion or archive instead.
        // For now, we'll allow deletion. Cascade delete should handle related records if set up in migrations/DB.

        $submissionSlot->delete();

        return response()->json(['message' => 'Submission slot deleted successfully!'], 200);
    }

    /**
     * Post a submission slot to specified students or all students of the lecturer.
     */
    public function postToStudents(Request $request, SubmissionSlot $submissionSlot)
    {
        $lecturer = Auth::user();
        if ($submissionSlot->lecturer_id !== $lecturer->id || $lecturer->user_role !== 'lecturer') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($submissionSlot->status === 'closed' || $submissionSlot->due_date->isPast()) {
            return response()->json(['error' => 'Cannot post a slot that is closed or past its due date.'], 400);
        }

        $validatedData = $request->validate([
            'student_ids' => 'sometimes|array', // Array of student IDs
            'student_ids.*' => 'exists:users,id', // Each ID must exist in users table
            'post_to_all_students' => 'sometimes|boolean',
        ]);

        $studentIdsToPost = [];

        if (!empty($validatedData['post_to_all_students']) && $validatedData['post_to_all_students'] === true) {
            // Fetch all students supervised by this lecturer.
            // This assumes you have a 'supervisees' relationship on your User model that returns students.
            $studentIdsToPost = $lecturer->supervisees()->pluck('id')->toArray();
        } elseif (!empty($validatedData['student_ids'])) {
            // Ensure these students are actually supervised by this lecturer for security/consistency
            $lecturerStudentIds = $lecturer->supervisees()->pluck('id')->toArray();
            $studentIdsToPost = collect($validatedData['student_ids'])->filter(function ($studentId) use ($lecturerStudentIds) {
                return in_array($studentId, $lecturerStudentIds);
            })->toArray();
        } else {
            return response()->json(['error' => 'No students specified or "post_to_all_students" not set to true.'], 400);
        }

        if (empty($studentIdsToPost)) {
            return response()->json(['message' => 'No valid students found or selected to post the slot to.'], 400);
        }

        // Sync students for this slot. 'syncWithoutDetaching' ensures we don't remove already posted students if API is called multiple times.
        // Or use 'sync' if you want the provided list to be the definitive list of assigned students.
        // For posting, 'syncWithoutDetaching' is often preferred.
        $now = now();
        $syncData = collect($studentIdsToPost)->mapWithKeys(function ($studentId) use ($now) {
            return [$studentId => ['posted_at' => $now]];
        })->toArray();
        
        $submissionSlot->assignedStudents()->syncWithoutDetaching($syncData);

        return response()->json(['message' => 'Submission slot posted to students successfully!', 'posted_to_student_ids' => array_keys($syncData)]);
    }


    /**
     * Get a list of students supervised by the lecturer (for selection).
     */
    public function getLecturerStudents()
    {
        $lecturer = Auth::user();
        if ($lecturer->user_role !== 'lecturer') {
            return response()->json(['error' => 'Unauthorized.'], 403);
        }

        // Assuming 'supervisees' relationship exists on User model
        $students = $lecturer->supervisees()->select('id', 'fname', 'lname', 'email')->get();
        return response()->json($students);
    }
}