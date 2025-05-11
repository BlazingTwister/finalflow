<?php

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
        Schema::table('users', function (Blueprint $table) {
            // Add supervisor_id column, make it nullable and constrained
            $table->foreignId('supervisor_id')
                  ->nullable() // Students might not have a supervisor initially
                  ->after('user_role') // Place it after the user_role column
                  ->constrained('users') // Foreign key links to the id column on the 'users' table
                  ->onDelete('set null'); // If supervisor is deleted, set student's supervisor_id to null
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop the foreign key constraint first
            $table->dropForeign(['supervisor_id']);
            // Then drop the column
            $table->dropColumn('supervisor_id');
        });
    }
};