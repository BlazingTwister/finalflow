<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    public function up(): void
    {
        Schema::create('student_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_slot_id')->constrained('submission_slots')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('submitted_at')->useCurrent();
            $table->enum('acknowledgement_status', ['pending', 'acknowledged'])->default('pending');
            $table->text('lecturer_comment')->nullable();
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamps();

          
        });
    }

    
    public function down(): void
    {
        Schema::dropIfExists('student_submissions');
    }
};
