<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_learner', function (Blueprint $table) {

            // Clés étrangères
            $table->foreignId('learner_id')->constrained('learners')->cascadeOnDelete();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();

            // Métadonnées
            $table->timestamp('enrolled_at')->useCurrent(); // Date d'inscription
            $table->unsignedInteger('progress')->default(0); // Progression en % (0-100)
            $table->timestamp('last_accessed')->nullable(); // Dernière activité (affichée dans l'UI)
            $table->timestamps(); // created_at et updated_at conservés

            //exam et certificats
            $table->boolean('exam_success')->default(false);
            $table->boolean('certificate_generated')->default(false);



            // Contraintes
            $table->primary(['course_id', 'learner_id']);
            $table->index('learner_id');
            $table->index('course_id'); // Optimisation pour les requêtes instructeurs

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_learner');
    }
};
