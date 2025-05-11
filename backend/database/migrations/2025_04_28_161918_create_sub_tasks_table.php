<?php
// database/migrations/YYYY_MM_DD_HHMMSS_create_sub_tasks_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sub_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('tasks')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('status', ['pending', 'completed'])->default('pending'); // Simple status for sub-tasks
            $table->timestamps(); // Adds created_at and updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the foreign key constraint before dropping the table if necessary,
        // but usually `dropIfExists` handles it. If not, uncomment the next line.
        // Schema::table('sub_tasks', function (Blueprint $table) {
        //     $table->dropForeign(['task_id']);
        // });
        Schema::dropIfExists('sub_tasks');
    }
};