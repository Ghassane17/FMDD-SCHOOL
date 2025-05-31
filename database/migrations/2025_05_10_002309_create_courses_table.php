<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instructor_id')->constrained('instructors')->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->string('course_thumbnail')->nullable();
            $table->enum('level', ['beginner', 'intermediate', 'advanced'])->default('beginner');
            $table->string('category')->nullable(); //that one should be an enum with the categories of the courses
            $table->float('rating')->nullable(); // Statique
            $table->boolean('is_published')->default(true); //Going to be used for the admin panel
            $table->integer('duration_min')->nullable();
            //$table->string('language')->default('fr');
            $table->timestamps();

            $table->index('instructor_id');

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
