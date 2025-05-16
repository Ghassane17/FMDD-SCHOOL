<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('instructors', function (Blueprint $table) {
            $table->id(); // Primary key for the instructors table
            $table->unsignedBigInteger('user_id')->unique(); // Foreign key to users table, unique for one-to-one relationship
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->json('skills')->nullable(); // Array of skills, e.g., ["JavaScript", "React"]
            $table->json('languages')->nullable(); // Array of language objects, e.g., [{name: "Français", code: "FR"}]
            $table->json('certifications')->nullable(); // Array of certification objects, e.g., [{name: "Master en IA", institution: "École Polytechnique"}]
            $table->json('availability')->nullable(); // Array of availability objects, e.g., [{day: "Lundi", slots: ["10:00"]}]
            $table->text('bank_info')->nullable(); // Encrypted bank info stored as text, e.g., JSON string of {iban, bankName, paymentMethod}
            $table->timestamps(); // Created_at and updated_at columns
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instructors');
    }
};