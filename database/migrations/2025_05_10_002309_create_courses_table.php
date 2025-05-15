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
            $table->foreignId('instructor_id')->constrained('ghassane_test_instructors')->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->string('course_thumbnail');

            $table->timestamps();

//            //new cols
           $table->string('level')->default('intermédiaire') ;
           $table->integer('students')->default(0);
           $table->float('rating')->nullable();



        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
