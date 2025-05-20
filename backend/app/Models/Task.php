<?php
// app/Models/Task.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo; 
use Illuminate\Database\Eloquent\Relations\HasMany; 

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
    public function subTasks(): HasMany 
    {
        return $this->hasMany(SubTask::class);
    }

    /**
     * Scope a query to only include tasks without sub-tasks.
     * 
     */
    public function scopeDoesntHaveSubTasks($query)
    {
        return $query->whereDoesntHave('subTasks');
    }

    /**
     * Scope a query to only include tasks with sub-tasks.
     * 
     */
     public function scopeHasSubTasks($query)
     {
         return $query->whereHas('subTasks');
     }
}
