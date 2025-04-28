<?php
// app/Models/Task.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo; // Keep this
use Illuminate\Database\Eloquent\Relations\HasMany; // <-- Add this import

class Task extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'student_id',
        'title',
        'description',
        'due_date',
        'status' // Statuses from migration: pending, in_progress, completed
    ];

    /**
     * Get the student (User) that owns the Task.
     * (Your original file named this 'student', we keep it, assuming User model is used)
     *
     */
    public function student(): BelongsTo
    {
        // Ensure this links correctly to your User model
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the sub-tasks associated with the Task.
     * Defines a one-to-many relationship.
     */
    public function subTasks(): HasMany // <-- NEW relationship
    {
        return $this->hasMany(SubTask::class);
    }

    /**
     * Scope a query to only include tasks without sub-tasks.
     * (Optional helper scope)
     */
    public function scopeDoesntHaveSubTasks($query)
    {
        return $query->whereDoesntHave('subTasks');
    }

    /**
     * Scope a query to only include tasks with sub-tasks.
     * (Optional helper scope)
     */
     public function scopeHasSubTasks($query)
     {
         return $query->whereHas('subTasks');
     }
}