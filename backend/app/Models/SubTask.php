<?php
// app/Models/SubTask.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubTask extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'task_id',
        'title',
        'status',
        // 'description', // Add if you included it in the migration
    ];

    /**
     * Get the parent task that owns the sub-task.
     * Defines an inverse one-to-many relationship.
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }
}