<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\SubmissionSlot;
use App\Models\StudentSubmission;
use App\Models\SubmissionFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class StudentSubmissionController extends Controller
{
    // Helper to ensure user is a student
    private function ensureStudent()
    {
        if (Auth::user()->user_role !== 'student') {
            abort(403, 'Unauthorized. Only students can perform this action.');
        }
    }

    /**
     * Display a listing of submission slots assigned to the authenticated student.
     * Only open and not past due slots are shown.
     */
    public function index(Request $request)
    {
        $this->ensureStudent();
        $student = Auth::user();

        $assignedSlots = $student->assignedSubmissionSlots()
            ->where('submission_slots.status', 'open') // From the submission_slots table
            ->where('submission_slots.due_date', '>', Carbon::now()) // Due date is in the future
            ->with(['lecturer:id,fname,lname', 'studentSubmissions' => function ($query) use ($student) {
                // Load only this student's submissions for each slot
                $query->where('student_id', $student->id)
                      ->with('files:id,student_submission_id,file_name,uploaded_at') // Load files for their submission
                      ->orderBy('submitted_at', 'desc'); // Get the latest submission first if multiple
            }])
            ->orderBy('submission_slots.due_date', 'asc')
            ->get();
            
        // Further process to easily get submission status for each slot
        $slotsData = $assignedSlots->map(function($slot) use ($student) {
            $mySubmission = $slot->studentSubmissions->first(); // Get the primary/latest submission by this student for this slot
            return [
                'id' => $slot->id,
                'name' => $slot->name,
                'description' => $slot->description,
                'due_date' => $slot->due_date->format('Y-m-d H:i:s'),
                'lecturer_name' => $slot->lecturer->fname . ' ' . $slot->lecturer->lname,
                'status' => $slot->status, // Slot status (open/closed)
                'my_submission_details' => $mySubmission ? [
                    'id' => $mySubmission->id,
                    'submitted_at' => $mySubmission->submitted_at->format('Y-m-d H:i:s'),
                    'acknowledgement_status' => $mySubmission->acknowledgement_status,
                    'lecturer_comment' => $mySubmission->lecturer_comment,
                    'files' => $mySubmission->files->map(fn($f) => ['name' => $f->file_name, 'uploaded_at' => $f->uploaded_at->format('Y-m-d H:i:s')])
                ] : null,
                'has_submitted' => !is_null($mySubmission)
            ];
        });


        return response()->json($slotsData);
    }

    /**
     * Store a new submission (files) for a given slot by the authenticated student.
     */
    public function submit(Request $request, SubmissionSlot $submissionSlot)
    {
        $this->ensureStudent();
        $student = Auth::user();

        // 1. Check if student is assigned to this slot
        if (!$student->assignedSubmissionSlots()->where('submission_slot_id', $submissionSlot->id)->exists()) {
            return response()->json(['error' => 'You are not assigned to this submission slot.'], 403);
        }

        // 2. Check if slot is open and not past due
        if ($submissionSlot->status !== 'open' || $submissionSlot->due_date->isPast()) {
            return response()->json(['error' => 'This submission slot is closed or past its due date.'], 403);
        }

        // 3. Validate request (files)
        try {
            $validatedData = $request->validate([
                'files' => 'required|array|min:1',
                // Max 5 files, each max 10MB. Adjust as needed.
                'files.*' => 'file|mimes:pdf,doc,docx,txt,zip,jpg,png|max:10240',
            ]);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }

        
        // For simplicity, this example allows creating a new submission record.
        // If only one submission is allowed, you'd first check and potentially block or update.
        $existingSubmission = StudentSubmission::where('submission_slot_id', $submissionSlot->id)
                                               ->where('student_id', $student->id)
                                               ->first();
        if ($existingSubmission) {
            // return response()->json(['error' => 'You have already submitted to this slot.'], 400);
            // Or, if allowing overwrite: delete old files and the submission record.
            // $existingSubmission->files()->each(function($file) {
            //     Storage::disk('local')->delete($file->file_path);
            //     $file->delete();
            // });
            // $existingSubmission->delete();
        }


        // 4. Create StudentSubmission record
        $studentSubmission = StudentSubmission::create([
            'submission_slot_id' => $submissionSlot->id,
            'student_id' => $student->id,
            'submitted_at' => now(),
            'acknowledgement_status' => 'pending', // Default
        ]);

        // 5. Store files and create SubmissionFile records
        $uploadedFilesInfo = [];
        foreach ($request->file('files') as $file) {
            // Store file in storage/app/submissions/{student_id}/{slot_id}/{filename}
            $filePath = $file->store("submissions/{$student->id}/{$submissionSlot->id}", 'local');

            SubmissionFile::create([
                'student_submission_id' => $studentSubmission->id,
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $filePath,
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'uploaded_at' => now(),
            ]);
            $uploadedFilesInfo[] = ['name' => $file->getClientOriginalName()];
        }

        return response()->json([
            'message' => 'Submission successful!',
            'submission_details' => $studentSubmission->load('files'), // Return submission with files
            'uploaded_files' => $uploadedFilesInfo
        ], 201);
    }

    /**
     * Display a specific submission made by the authenticated student.
     */
    public function showMySubmission(Request $request, StudentSubmission $studentSubmission)
    {
        $this->ensureStudent();
        $student = Auth::user();

        // Ensure the student owns this submission
        if ($studentSubmission->student_id !== $student->id) {
            return response()->json(['error' => 'Unauthorized. This is not your submission.'], 403);
        }

        $studentSubmission->load(['submissionSlot:id,name,due_date', 'files:id,student_submission_id,file_name,uploaded_at']);

        return response()->json($studentSubmission);
    }
}
