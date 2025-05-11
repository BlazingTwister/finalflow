<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubmissionSlot extends Model
{
    use HasFactory;

    protected $fillable = [
        'lecturer_id',
        'name',
        'description',
        'due_date',
        'status',
    ];

    protected $casts = [
        'due_date' => 'datetime',
    ];

    /**
     * The lecturer who created this submission slot.
     */
    public function lecturer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'lecturer_id');
    }

    /**
     * The students to whom this slot is posted.
     */
    public function assignedStudents(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'submission_slot_student', 'submission_slot_id', 'student_id')
                    ->withPivot('posted_at')
                    ->withTimestamps();
    }

    /**
     * All student submissions for this slot.
     */
    public function studentSubmissions(): HasMany
    {
        return $this->hasMany(StudentSubmission::class);
    }

    /**
     * Scope a query to only include open slots.
     */
    public function scopeOpen($query)
    {
        return $query->where('status', 'open')->where('due_date', '>', now());
    }

    /**
     * Scope a query to only include closed slots.
     */
    public function scopeClosed($query)
    {
        return $query->where('status', 'closed')->orWhere('due_date', '<=', now());
    }
}