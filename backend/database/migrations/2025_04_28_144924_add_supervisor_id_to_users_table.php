<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add supervisor_id column
            $table->foreignId('supervisor_id')
                  ->nullable() // Students will not have a supervisor initially
                  ->after('user_role') 
                  ->constrained('users') // Foreign key links to the id column on the 'users' table
                  ->onDelete('set null'); // If supervisor is deleted, set student's supervisor_id to null
        });
    }

    
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            
            $table->dropForeign(['supervisor_id']);
          
            $table->dropColumn('supervisor_id');
        });
    }
};
