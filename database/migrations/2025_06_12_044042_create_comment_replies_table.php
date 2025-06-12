<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('comment_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('comment_id')
                  ->constrained('comments')
                  ->onDelete('cascade');
            $table->foreignId('instructor_id')
                  ->constrained('instructors')
                  ->onDelete('cascade');
            $table->text('reply');     // the instructor’s reply text
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comment_replies');
    }
};

