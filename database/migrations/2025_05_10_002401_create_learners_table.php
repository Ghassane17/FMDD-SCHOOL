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
        Schema::create('learners', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

// Academic info
            $table->string('field_of_study')->nullable();
            $table->string('school')->nullable();
            $table->string('university')->nullable();
            $table->string('degree')->nullable(); // e.g., Bachelor, Master, etc.
            $table->year('year_of_study')->nullable(); // e.g., 2025

// Learning statistics
            $table->integer('courses_enrolled')->default(0);
            $table->integer('courses_completed')->default(0);

// Activity
            $table->timestamp('last_connection')->nullable();

// Status
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');

            $table->timestamps();
            $table->softDeletes();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('learners');
    }
};
