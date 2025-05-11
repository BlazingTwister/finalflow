<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudentSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'submission_slot_id',
        'student_id',
        'submitted_at',
        'acknowledgement_status',
        'lecturer_comment',
        'acknowledged_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'acknowledged_at' => 'datetime',
    ];

    /**
     * The submission slot this submission belongs to.
     */
    public function submissionSlot(): BelongsTo
    {
        return $this->belongsTo(SubmissionSlot::class);
    }

    /**
     * The student who made this submission.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
    * The files attached to this submission.
    */
    public function files(): HasMany
    {
        return $this->hasMany(SubmissionFile::class);
    }
}