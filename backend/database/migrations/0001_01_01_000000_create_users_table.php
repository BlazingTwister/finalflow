<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * To test connection between Laravel and react:
     */
    public function up()
{
    Schema::create('users', function (Blueprint $table) {
        $table->id();
        $table->string('fname'); // first name
        $table->string('lname'); // last name
        $table->string('email')->unique(); // User email
        $table->string('password'); // User password
        $table->enum('user_role', ['student', 'lecturer', 'admin'])->default('student'); // User role
        $table->boolean('is_verified')->default(false); // User is verified
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
