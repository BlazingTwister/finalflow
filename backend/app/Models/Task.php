<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id', 
        'title', 
        'description', 
        'due_date', 
        'status'
    ];

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

}
