<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
 
    public function up(): void
    {
        Schema::create('submission_slot_student', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_slot_id')->constrained('submission_slots')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade'); // Links to the student
            $table->timestamp('posted_at')->useCurrent(); 
            $table->unique(['submission_slot_id', 'student_id']); // Ensure a student is assigned to a slot only once
            $table->timestamps();
        });
    }

  
    public function down(): void
    {
        Schema::dropIfExists('submission_slot_student');
    }
};
