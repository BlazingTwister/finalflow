<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::create('submission_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_submission_id')->constrained('student_submissions')->onDelete('cascade');
            $table->string('file_name'); // Original file name
            $table->string('file_path'); // Stored path
            $table->unsignedBigInteger('file_size');
            $table->string('mime_type')->nullable();
            $table->timestamp('uploaded_at')->useCurrent();
            $table->timestamps();
        });
    }

    
    public function down(): void
    {
        Schema::dropIfExists('submission_files');
    }
};
