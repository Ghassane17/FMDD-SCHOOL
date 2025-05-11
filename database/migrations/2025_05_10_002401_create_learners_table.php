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

// Academic info


//            $table->string('field_of_study')->nullable();
//            $table->string('school')->nullable();
//            $table->string('university')->nullable();
//            $table->string('degree')->nullable(); // e.g., Bachelor, Master, etc.
//            $table->year('year_of_study')->nullable(); // e.g., 2025
//            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');


        });
    }


    public function down(): void
    {
        Schema::dropIfExists('learners');
    }
};
