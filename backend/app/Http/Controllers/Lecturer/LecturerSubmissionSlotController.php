<?php

namespace App\Http\Controllers\Lecturer;

use App\Http\Controllers\Controller;
use App\Models\SubmissionSlot;
use App\Models\StudentSubmission;
use App\Models\SubmissionFile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Gate; // For authorization

class LecturerSubmissionSlotController extends Controller
{
    // Helper to ensure user is a lecturer
    private function ensureLecturer()
    {
        if (Auth::user()->user_role !== 'lecturer') {
            abort(403, 'Unauthorized. Only lecturers can perform this action.');
        }
    }

    /**
     * Display a listing of the submission slots created by the authenticated lecturer.
     */
    public function index()
    {
        $this->ensureLecturer();
        $lecturer = Auth::user();

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
        $this->ensureLecturer();
        $lecturer = Auth::user();

        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'due_date' => 'required|date|after_or_equal:today',
            ]);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }

        $submissionSlot = SubmissionSlot::create([
            'lecturer_id' => $lecturer->id,
            'name' => $validatedData['name'],
            'description' => $validatedData['description'],
            'due_date' => $validatedData['due_date'],
            'status' => 'open',
        ]);

        return response()->json(['message' => 'Submission slot created successfully!', 'submission_slot' => $submissionSlot], 201);
    }

    /**
     * Display the specified submission slot with student submission statuses.
     */
    public function show(SubmissionSlot $submissionSlot)
    {
        $this->ensureLecturer();
        $lecturer = Auth::user();

        if ($submissionSlot->lecturer_id !== $lecturer->id) {
            return response()->json(['error' => 'Unauthorized. You did not create this slot.'], 403);
        }

        // Eager load relationships
        $submissionSlot->load([
            'assignedStudents:id,fname,lname,email', // Students assigned to this slot
            // Load submissions for these assigned students specifically for this slot
            'studentSubmissions' => function ($query) {
                $query->with('student:id,fname,lname,email', 'files:id,student_submission_id,file_name,file_path,uploaded_at')
                      ->orderBy('submitted_at', 'desc');
            }
        ]);
        
        // Get all students supervised by this lecturer
        $allSupervisees = $lecturer->supervisees()->get(['id', 'fname', 'lname', 'email']);
        $assignedStudentIds = $submissionSlot->assignedStudents->pluck('id')->toArray();

        $submissionStatus = $allSupervisees->map(function ($student) use ($submissionSlot, $assignedStudentIds) {
            $isAssigned = in_array($student->id, $assignedStudentIds);
            $submission = null;

            if ($isAssigned) {
                // Find the submission(s) by this student for this specific slot
                $studentSubmissionForSlot = $submissionSlot->studentSubmissions
                    ->where('student_id', $student->id)
                    ->first(); // Get the latest or primary submission
                
                if ($studentSubmissionForSlot) {
                    $submission = [
                        'id' => $studentSubmissionForSlot->id,
                        'submitted_at' => $studentSubmissionForSlot->submitted_at->format('Y-m-d H:i:s'),
                        'acknowledgement_status' => $studentSubmissionForSlot->acknowledgement_status,
                        'lecturer_comment' => $studentSubmissionForSlot->lecturer_comment,
                        'acknowledged_at' => $studentSubmissionForSlot->acknowledged_at ? $studentSubmissionForSlot->acknowledged_at->format('Y-m-d H:i:s') : null,
                        'files' => $studentSubmissionForSlot->files->map(fn($file) => [
                            'id' => $file->id, // Include file ID for download
                            'name' => $file->file_name,
                            'uploaded_at' => $file->uploaded_at->format('Y-m-d H:i:s')
                        ])
                    ];
                }
            }

            return [
                'student_id' => $student->id,
                'fname' => $student->fname,
                'lname' => $student->lname,
                'email' => $student->email,
                'is_assigned_to_slot' => $isAssigned,
                'has_submitted' => !is_null($submission),
                'submission_details' => $submission,
            ];
        });

        return response()->json([
            'slot' => [
                'id' => $submissionSlot->id,
                'name' => $submissionSlot->name,
                'description' => $submissionSlot->description,
                'due_date' => $submissionSlot->due_date->format('Y-m-d H:i:s'),
                'status' => $submissionSlot->status,
                'created_at' => $submissionSlot->created_at->format('Y-m-d H:i:s'),
            ],
            'submission_statuses' => $submissionStatus,
        ]);
    }


    /**
     * Update the specified submission slot.
     */
    public function update(Request $request, SubmissionSlot $submissionSlot)
    {
        $this->ensureLecturer();
        if ($submissionSlot->lecturer_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $isPastDue = $submissionSlot->due_date->isPast();
        $isClosed = $submissionSlot->status === 'closed';

        // More granular validation based on slot state
        $rules = [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => ['sometimes', 'required', 'date', function ($attribute, $value, $fail) use ($isClosed, $submissionSlot) {
                if (\Carbon\Carbon::parse($value)->isPast() && !$isClosed && $submissionSlot->status === 'open') {
                    $fail('Due date cannot be set to the past for an open slot unless you are also closing it.');
                }
            }],
            'status' => 'sometimes|required|in:open,closed',
        ];

        // If slot is past due or closed, only allow changing status to 'closed' or other non-critical fields
        if ($isPastDue || $isClosed) {
            if ($request->has('name') || $request->has('description') || ($request->has('due_date') && \Carbon\Carbon::parse($request->due_date)->isFuture())) {
                 // Allow editing name/description even if past due.
                 // Allow extending due date only if it's being moved to the future AND slot is not already 'closed'.
                if ($isClosed && $request->status !== 'closed' && $request->has('status')) {
                     return response()->json(['error' => 'Cannot reopen a closed slot by changing its status if other fields are also modified.'], 403);
                }
            }
             if ($request->has('due_date') && \Carbon\Carbon::parse($request->due_date)->isPast() && $submissionSlot->status === 'open' && $request->status !== 'closed'){
                 return response()->json(['error' => 'Cannot set due date to past for an open slot unless also setting status to closed.'], 403);
             }
        }


        try {
            $validatedData = $request->validate($rules);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }

        $submissionSlot->update($validatedData);
        return response()->json(['message' => 'Submission slot updated successfully!', 'submission_slot' => $submissionSlot->fresh()]);
    }

    /**
     * Remove the specified submission slot.
     */
    public function destroy(SubmissionSlot $submissionSlot)
    {
        $this->ensureLecturer();
        if ($submissionSlot->lecturer_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        // Consider if submissions exist, should it be archived instead?
        // For now, direct delete. DB cascade should handle related records.
        $submissionSlot->delete();
        return response()->json(['message' => 'Submission slot deleted successfully!']);
    }

    /**
     * Post a submission slot to specified students or all students of the lecturer.
     */
    public function postToStudents(Request $request, SubmissionSlot $submissionSlot)
    {
        $this->ensureLecturer();
        $lecturer = Auth::user();
        if ($submissionSlot->lecturer_id !== $lecturer->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($submissionSlot->status === 'closed' || $submissionSlot->due_date->isPast()) {
            return response()->json(['error' => 'Cannot post a slot that is closed or past its due date.'], 400);
        }

        $validatedData = $request->validate([
            'student_ids' => 'sometimes|array',
            'student_ids.*' => 'exists:users,id',
            'post_to_all_students' => 'sometimes|boolean',
        ]);

        $studentIdsToPost = [];
        if (!empty($validatedData['post_to_all_students'])) {
            $studentIdsToPost = $lecturer->supervisees()->pluck('id')->toArray();
        } elseif (!empty($validatedData['student_ids'])) {
            $lecturerStudentIds = $lecturer->supervisees()->pluck('id')->toArray();
            $studentIdsToPost = collect($validatedData['student_ids'])->filter(fn($id) => in_array($id, $lecturerStudentIds))->toArray();
        } else {
            return response()->json(['error' => 'No students specified or "post_to_all_students" not set.'], 400);
        }

        if (empty($studentIdsToPost)) {
            return response()->json(['message' => 'No valid students found or selected.'], 400);
        }

        $now = now();
        $syncData = collect($studentIdsToPost)->mapWithKeys(fn($id) => [$id => ['posted_at' => $now]])->toArray();
        $submissionSlot->assignedStudents()->syncWithoutDetaching($syncData);

        return response()->json(['message' => 'Submission slot posted successfully!', 'posted_to_student_ids' => array_keys($syncData)]);
    }

    /**
     * Get a list of students supervised by the lecturer.
     */
    public function getLecturerStudents()
    {
        $this->ensureLecturer();
        $students = Auth::user()->supervisees()->select('id', 'fname', 'lname', 'email')->get();
        return response()->json($students);
    }


    /**
     * Acknowledge receipt of a student's submission.
     */
    public function acknowledgeSubmission(Request $request, StudentSubmission $studentSubmission)
    {
        $this->ensureLecturer();
        // Authorization: Ensure the lecturer is the one who created the slot for this submission
        if ($studentSubmission->submissionSlot->lecturer_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized. You cannot acknowledge this submission.'], 403);
        }

        if ($studentSubmission->acknowledgement_status === 'acknowledged') {
            return response()->json(['message' => 'Submission already acknowledged.', 'submission' => $studentSubmission], 200);
        }

        $studentSubmission->update([
            'acknowledgement_status' => 'acknowledged',
            'acknowledged_at' => now(),
        ]);

        return response()->json(['message' => 'Submission acknowledged successfully.', 'submission' => $studentSubmission->fresh()]);
    }

    /**
     * Add or update a comment on a student's submission.
     */
    public function addComment(Request $request, StudentSubmission $studentSubmission)
    {
        $this->ensureLecturer();
        // Authorization
        if ($studentSubmission->submissionSlot->lecturer_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized. You cannot comment on this submission.'], 403);
        }

        $validatedData = $request->validate([
            'comment' => 'required|string|max:5000', // Max comment length
        ]);

        $studentSubmission->update([
            'lecturer_comment' => $validatedData['comment'],
        ]);

        return response()->json(['message' => 'Comment added successfully.', 'submission' => $studentSubmission->fresh()]);
    }

    /**
     * Download a specific file from a student's submission.
     * File download is only allowed if the submission has been acknowledged.
     */
    public function downloadFile(Request $request, SubmissionFile $submissionFile)
    {
        $this->ensureLecturer();
        $studentSubmission = $submissionFile->studentSubmission; // Get parent submission

        // Authorization
        if ($studentSubmission->submissionSlot->lecturer_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized. You cannot download this file.'], 403);
        }

        // Check for acknowledgement
        if ($studentSubmission->acknowledgement_status !== 'acknowledged') {
            return response()->json(['error' => 'Submission must be acknowledged before downloading files.'], 403);
        }

        // Ensure file exists on disk
        if (!Storage::disk('local')->exists($submissionFile->file_path)) { // Assuming 'local' disk for submissions
            return response()->json(['error' => 'File not found.'], 404);
        }

        // Stream the download
        return Storage::disk('local')->download($submissionFile->file_path, $submissionFile->file_name);
    }
}
