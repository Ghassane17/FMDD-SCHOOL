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

            $table->integer('courses_enrolled')->default(0);
            $table->integer('courses_completed')->default(0);
            $table->timestamp('last_connection')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->json('fields_of_interest')->nullable();
            $table->json('languages')->nullable();
            $table->json('certifications')->nullable();
            $table->json('bank_info')->nullable();
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
        });
    }


    public function down(): void
    {
        Schema::dropIfExists('learners');
    }
};
