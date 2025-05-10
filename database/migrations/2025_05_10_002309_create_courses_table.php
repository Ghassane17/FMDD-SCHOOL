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
            $table->foreignId('instructor_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->string('cover_image')->nullable();
            $table->string('thumbnail_image')->nullable();

            $table->enum('niveau', ['débutant', 'intermediare', 'avancé'])->default('débutant');            // beginner, intermediate, advanced
            $table->float('rating')->default(0);
            $table->boolean('is_for_members')->default(false); // restrict access to paying users
            $table->enum('media_type', ['text', 'video', 'audio', 'multimedia'])->default('text');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
