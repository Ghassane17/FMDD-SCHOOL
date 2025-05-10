<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // First, make absolutely sure that the learners table exists
        if (!Schema::hasTable('learners')) {
            throw new Exception('The learners table must exist before creating the members table');
        }

        Schema::create('members', function (Blueprint $table) {
            $table->id();
            // Make sure the data type matches exactly - using unsignedBigInteger to match Laravel's default id type
            $table->unsignedBigInteger('learner_id');

            // Define the foreign key constraint after creating the column
            $table->foreign('learner_id')
                ->references('id')
                ->on('learners')
                ->onDelete('cascade');

            // Personal Info
            $table->string('first_name', 50);
            $table->string('last_name', 50);
            $table->date('date_of_birth');
            $table->enum('gender', ['male', 'female', 'other', 'prefer_not_to_say']);
            $table->string('phone');
            $table->string('city', 100);
            $table->string('province', 100);
            $table->string('current_status');
            $table->string('education_level');
            $table->string('field_of_study', 100);
            $table->json('interests');
            $table->text('motivation');
            $table->boolean('previously_participated');
            $table->json('hear_about_us');
            $table->boolean('receive_newsletter');

            // File Uploads
            $table->string('cv_path');
            $table->string('cin_path');
            $table->string('motivation_letter_path')->nullable();

            // Consent
            $table->boolean('data_consent');
            $table->boolean('values_consent');

            // Payment
            $table->enum('payment_mode', ['online', 'bank_transfer'])->nullable();
            $table->string('payment_proof_path')->nullable();
            $table->string('payment_reference')->nullable();
            $table->timestamp('payment_date')->nullable();
            $table->boolean('has_paid')->default(false);
            $table->boolean('fmdd_consent')->default(false);
            $table->enum('payment_status', ['pending', 'approved', 'rejected'])->nullable();

            // Status
            $table->enum('status', ['pending_payment', 'payment_received', 'completed'])->default('pending_payment');
            $table->timestamp('registration_date')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};
