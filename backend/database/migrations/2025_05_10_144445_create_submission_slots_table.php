<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('submission_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lecturer_id')->constrained('users')->onDelete('cascade'); // Links to the lecturer who created it
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamp('due_date');
            $table->enum('status', ['open', 'closed'])->default('open'); // status set to 'open' by default
            $table->timestamps();
        });
    }


    public function down(): void
    {
        Schema::dropIfExists('submission_slots');
    }
};
