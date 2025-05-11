<?php
// File: app/Models/User.php
// Add the 'tasks' relationship if it's not already present.
// Ensure 'HasMany' is imported: use Illuminate\Database\Eloquent\Relations\HasMany;

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany; // Ensure this is present
use Illuminate\Database\Eloquent\Relations\BelongsTo; // Ensure this is present
use Illuminate\Database\Eloquent\Relations\BelongsToMany; // Ensure this is present


class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'fname',
        'lname',
        'email',
        'password',
        'user_role',
        'is_verified',
        'supervisor_id', // This was added for supervisor assignment
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_verified' => 'boolean',
        ];
    }

    // Relationship: A supervisor (lecturer) has many students
    public function supervisees(): HasMany
    {
        return $this->hasMany(User::class, 'supervisor_id');
    }

    // Relationship: A student belongs to one supervisor (lecturer)
    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    // Relationship: Tasks created by this user (if student)
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class, 'student_id');
    }

    // --- Relationships from Submission Slots Feature (ensure they are present) ---
    public function createdSubmissionSlots(): HasMany
    {
        return $this->hasMany(SubmissionSlot::class, 'lecturer_id');
    }

    public function assignedSubmissionSlots(): BelongsToMany
    {
        return $this->belongsToMany(SubmissionSlot::class, 'submission_slot_student', 'student_id', 'submission_slot_id')
                    ->withPivot('posted_at')
                    ->withTimestamps();
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(StudentSubmission::class, 'student_id');
    }
}