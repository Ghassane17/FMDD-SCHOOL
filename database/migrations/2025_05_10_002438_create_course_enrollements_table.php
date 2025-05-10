<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('learner_id')->constrained()->onDelete('cascade');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');

            // Enrollment details
            $table->timestamp('enrolled_at')->useCurrent();
            $table->timestamp('last_accessed_at')->nullable();
            $table->timestamp('completed_at')->nullable();

            // Progress tracking
            $table->float('progress_percentage')->default(0); // 0-100%
            $table->integer('completed_lessons_count')->default(0);
            $table->integer('total_time_spent_seconds')->default(0); // Track time spent in course

            // Access and last position
            $table->foreignId('last_lesson_id')->nullable()->constrained('lessons')->nullOnDelete();
            $table->string('last_position')->nullable(); // For video: timestamp, for text: paragraph ID

            // Performance metrics
            $table->float('average_quiz_score')->nullable();
            $table->integer('attempts_count')->default(0); // Count of quiz attempts

            // Status and flags
            $table->enum('status', ['not_started', 'in_progress', 'completed', 'dropped'])->default('not_started');
            $table->boolean('certificate_issued')->default(false);
            $table->timestamp('certificate_issued_at')->nullable();
            $table->string('certificate_number')->nullable();

            // Feedback
            $table->integer('rating')->nullable(); // User's rating of the course (1-5)
            $table->text('feedback')->nullable(); // User's feedback on the course

            $table->timestamps();

            // Prevent duplicate enrollments
            $table->unique(['learner_id', 'course_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_enrollments');
    }
};
