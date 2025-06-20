<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Instructor;
use App\Models\Course;
use App\Models\Module;
use App\Models\QuizQuestion;
use App\Models\Exam;
use App\Models\ExamQuestion;
use App\Models\Resource;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class MachineLearningCourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        // --- 0. Préparation des répertoires de stockage (pour la démo) ---
        // Crée des dossiers pour simuler le stockage si non existants
        $storagePaths = [
            'public/courses/',
        ];
        foreach ($storagePaths as $path) {
            if (!Storage::exists($path)) {
                Storage::makeDirectory($path);
            }
        }

        // --- 1. Récupération ou création de l'instructeur principal ---
        // Nous allons utiliser Sanae pour ce cours. Si elle n'existe pas, on la crée.
        $instructorUser = User::where('email', 'sanae@example.com')->first();

        if (!$instructorUser) {
            $instructorUser = User::create([
                'username' => 'prof.sanae',
                'email' => 'sanae@example.com',
                'password' => Hash::make('password'),
                'role' => 'instructor',
                'nom' => 'Sanae',
                'prenom' => 'Sanae',
                'avatar' => '/storage/avatars/sanae.png',
            ]);
            Instructor::create(['user_id' => $instructorUser->id, 'specialisation' => 'Intelligence Artificielle, Cybersécurité, Python Avancé']);
            $this->command->info('Instructeur Sanae créé.');
        } else {
            $this->command->info('Instructeur Sanae déjà existant.');
        }

        $instructor = $instructorUser->instructor;

        // --- 2. Définition des détails du cours ---
        $courseTitle = "Introduction au Machine Learning : Premiers Pas dans l'Apprentissage Automatique";
        $courseSlug = Str::slug($courseTitle);

        $course = Course::create([
            'instructor_id' => $instructor->id,
            'title' => $courseTitle,
            'description' => "Ce cours est une porte d'entrée progressive dans le monde fascinant du Machine Learning. Apprenez les concepts fondamentaux, explorez les types d'apprentissage (supervisé, non supervisé) et mettez en œuvre vos premiers algorithmes avec des exemples concrets.",
            'level' => 'beginner',
            'course_thumbnail' => '/storage/courses/' . $courseSlug . '/thumbnail/' . $courseSlug . '_thumb.png',
            'category' => 'Intelligence Artificielle',
            'is_published' => true,
            'rating' => 4.8,
            'duration_min' => 240, // 4 heures
            'language' => 'English',
        ]);

        // --- Création des dossiers de cours simulés ---
        Storage::makeDirectory('public/courses/' . $courseSlug . '/modules');
        Storage::makeDirectory('public/courses/' . $courseSlug . '/resources');
        Storage::makeDirectory('public/courses/' . $courseSlug . '/thumbnail');

        $this->command->info('Cours "' . $course->title . '" créé.');

        // --- 3. Création des Modules ---

        // Module 1: Introduction (Image)
        Module::create([
            'course_id' => $course->id,
            'title' => 'Bienvenue au Machine Learning',
            'type' => 'image',
            'text_content' => null,
            'file_path' => '/storage/courses/' . $courseSlug . '/modules/module_1_introduction_ml.png',
            'order' => 1,
        ]);
        $this->command->info('Module 1 (Introduction - Image) créé.');

        // Module 2: Basic Concepts (Large HTML Text)
        $basicConceptsText = '
            <h1>Comprendre les Fondamentaux du Machine Learning</h1>
            <p>Le <strong>Machine Learning (ML)</strong>, ou apprentissage automatique, est une branche de l\'intelligence artificielle (IA) qui permet aux systèmes d\'apprendre à partir de données, d\'identifier des modèles et de prendre des décisions avec une intervention humaine minimale.</p>

            <h2>Qu\'est-ce que l\'Apprentissage Automatique ?</h2>
            <p>Au lieu d\'être explicitement programmé pour chaque tâche, un algorithme de ML est "entraîné" sur un grand ensemble de données. Cet entraînement lui permet de :</p>
            <ul>
                <li><strong>Reconnaître des schémas :</strong> Trouver des corrélations ou des structures cachées dans les données.</li>
                <li><strong>Faire des prédictions :</strong> Estimer des valeurs futures ou classer de nouvelles données.</li>
                <li><strong>S\'améliorer avec l\'expérience :</strong> Plus il y a de données et d\'interactions, plus l\'algorithme devient précis.</li>
            </ul>

            <h2>Les Types d\'Apprentissage Principal</h2>
            <h3>1. Apprentissage Supervisé (Supervised Learning)</h3>
            <p>C\'est le type le plus courant. L\'algorithme apprend à partir d\'un ensemble de données "étiquetées", c\'est-à-dire des données où la bonne réponse (l\'étiquette) est déjà connue. L\'objectif est de prédire cette étiquette pour de nouvelles données.</p>
            <p><strong>Exemples :</strong></p>
            <ul>
                <li><strong>Régression :</strong> Prédire une valeur continue (ex: prix d\'une maison, température).</li>
                <li><strong>Classification :</strong> Prédire une catégorie discrète (ex: spam/non-spam, chien/chat).</li>
            </ul>

            <h3>2. Apprentissage Non Supervisé (Unsupervised Learning)</h3>
            <p>Ici, l\'algorithme travaille avec des données non étiquetées. Son but est de trouver des structures cachées, des regroupements ou des associations au sein des données.</p>
            <p><strong>Exemples :</strong></p>
            <ul>
                <li><strong>Clustering (Regroupement) :</strong> Diviser les données en groupes similaires (ex: segmentation client).</li>
                <li><strong>Réduction de dimensionnalité :</strong> Simplifier des données complexes en réduisant le nombre de variables.</li>
            </ul>

            <h3>3. Apprentissage par Renforcement (Reinforcement Learning)</h3>
            <p>Un agent apprend à prendre des décisions dans un environnement pour maximiser une récompense. Il n\'y a pas d\'ensemble de données prédéfini ; l\'agent apprend par essais et erreurs.</p>
            <p><strong>Exemple :</strong> Robots apprenant à naviguer, IA de jeux vidéo.</p>

            <h2>Les Étapes Clés d\'un Projet ML</h2>
            <ol>
                <li><strong>Collecte et Préparation des Données :</strong> C\'est l\'étape la plus cruciale. Les données doivent être propres, pertinentes et bien formatées.</li>
                <li><strong>Choix du Modèle :</strong> Sélectionner l\'algorithme approprié à la tâche (régression linéaire, arbres de décision, réseaux de neurones, etc.).</li>
                <li><strong>Entraînement du Modèle :</strong> Alimenter l\'algorithme avec les données pour qu\'il apprenne les schémas.</li>
                <li><strong>Évaluation du Modèle :</strong> Tester le modèle sur de nouvelles données pour s\'assurer qu\'il généralise bien et qu\'il est précis.</li>
                <li><strong>Déploiement et Suivi :</strong> Mettre le modèle en production et le surveiller pour s\'assurer de ses performances continues.</li>
            </ol>

            <p>Le Machine Learning est une discipline en constante évolution, avec un potentiel immense pour transformer de nombreux secteurs, de la médecine à la finance, en passant par le marketing et les transports.</p>
        ';

        Module::create([
            'course_id' => $course->id,
            'title' => 'Concepts Fondamentaux du Machine Learning',
            'type' => 'text',
            'text_content' => $basicConceptsText,
            'file_path' => null,
            'order' => 2,
        ]);
        $this->command->info('Module 2 (Concepts Basiques - Texte HTML) créé.');

        // Module 3: Video Animation
        Module::create([
            'course_id' => $course->id,
            'title' => 'Animation : Comment un Algorithme Apprend',
            'type' => 'video',
            'text_content' => null,
            'file_path' => '/storage/courses/' . $courseSlug . '/modules/module_3_animation_learning.mp4',
            'order' => 3,
        ]);
        $this->command->info('Module 3 (Animation Vidéo) créé.');

        // Module 4: Quiz (3 questions basées sur le Module 2)
        $quizModule = Module::create([
            'course_id' => $course->id,
            'title' => 'Quiz : Testez vos Connaissances du Module 2',
            'type' => 'quiz',
            'order' => 4,
        ]);
        $this->command->info('Module 4 (Quiz) créé.');

        QuizQuestion::create([
            'module_id' => $quizModule->id,
            'question' => "Quelle est la branche de l'IA qui permet aux systèmes d'apprendre à partir de données ?",
            'options' => [
                'Robotique',
                'Développement Web',
                'Machine Learning (Apprentissage Automatique)',
                'Analyse de données classique',
            ],
            'correct_option' => 2, // Index 2: 'Machine Learning (Apprentissage Automatique)'
        ]);

        QuizQuestion::create([
            'module_id' => $quizModule->id,
            'question' => "Dans l'apprentissage supervisé, quel type de données est utilisé pour entraîner l'algorithme ?",
            'options' => [
                'Données non structurées',
                'Données étiquetées (avec la bonne réponse connue)',
                'Données générées aléatoirement',
                'Données uniquement textuelles',
            ],
            'correct_option' => 1, // Index 1: 'Données étiquetées (avec la bonne réponse connue)'
        ]);

        QuizQuestion::create([
            'module_id' => $quizModule->id,
            'question' => "Lequel de ces exemples correspond à un problème de classification en Machine Learning ?",
            'options' => [
                'Prédire le prix futur d\'une action',
                'Regrouper des clients par comportement d\'achat',
                'Déterminer si un email est un spam ou non',
                'Estimer le temps de trajet d\'un véhicule',
            ],
            'correct_option' => 2, // Index 2: 'Déterminer si un email est un spam ou non'
        ]);
        $this->command->info('Questions du Quiz créées.');

        // Module 5 : PDF
        Module::create([
            'course_id' => $course->id,
            'title' => 'PDF : Machine Learning - Types et Applications',
            'type' => 'pdf',
            'text_content' => null,
            'file_path' => '/storage/courses/' . $courseSlug . '/modules/module_5_pdf_ml.pdf',
            'order' => 5,
        ]);

        // Module 6: Conclusion Image
        Module::create([
            'course_id' => $course->id,
            'title' => 'Prochaines Étapes en Machine Learning',
            'type' => 'image',
            'text_content' => null,
            'file_path' => '/storage/courses/' . $courseSlug . '/modules/module_6_conclusion_ml.png',
            'order' => 6,
        ]);
        $this->command->info('Module 6 (Conclusion - Image) créé.');

        // --- 4. Examen Final (10 questions) ---
        $exam = Exam::create([
            'course_id' => $course->id,
            'title' => 'Examen Final : Introduction au Machine Learning',
            'instructions' => 'Cet examen final teste votre compréhension générale des concepts d\'apprentissage automatique abordés dans ce cours. Répondez avec précision. Un score de 70% est requis pour valider le cours.',
            'duration_min' => 45, // Temps raisonnable pour 10 questions introductives
            'passing_score' => 70,
        ]);
        $this->command->info('Examen final créé.');

        $examQuestionsData = [
            [
                'question_text' => "Qu'est-ce que la principale différence entre l'apprentissage supervisé et l'apprentissage non supervisé ?",
                'options' => [
                    'L\'apprentissage supervisé utilise des données étiquetées, l\'apprentissage non supervisé non.',
                    'L\'apprentissage supervisé est pour la prédiction, le non supervisé pour la classification.',
                    'L\'apprentissage supervisé ne nécessite pas d\'algorithmes.',
                    'Le non supervisé est toujours plus précis.',
                ],
                'correct_index' => 0,
            ],
            [
                'question_text' => "Quel type de problème de Machine Learning est adapté pour prédire une valeur continue, comme le prix d'une maison ?",
                'options' => [
                    'Classification',
                    'Clustering',
                    'Régression',
                    'Apprentissage par renforcement',
                ],
                'correct_index' => 2,
            ],
            [
                'question_text' => "Laquelle de ces affirmations est vraie concernant l'apprentissage par renforcement ?",
                'options' => [
                    'Il utilise toujours des données étiquetées.',
                    'L\'agent apprend en interagissant avec son environnement et en maximisant une récompense.',
                    'Son objectif principal est de regrouper les données en catégories.',
                    'Il est principalement utilisé pour la réduction de dimensionnalité.',
                ],
                'correct_index' => 1,
            ],
            [
                'question_text' => "Pourquoi la **préparation des données** est-elle une étape cruciale en Machine Learning ?",
                'options' => [
                    'Elle rend le code plus complexe.',
                    'Des données propres et pertinentes sont essentielles pour un modèle précis.',
                    'Elle n\'affecte que très peu les performances du modèle.',
                    'Elle n\'est nécessaire que pour l\'apprentissage supervisé.',
                ],
                'correct_index' => 1,
            ],
            [
                'question_text' => "Quel est le but du **clustering** (regroupement) dans l'apprentissage non supervisé ?",
                'options' => [
                    'Prédire une valeur numérique exacte.',
                    'Classer les données dans des catégories prédéfinies.',
                    'Identifier des structures cachées et diviser les données en groupes similaires.',
                    'Réduire le nombre d\'observables dans les données.',
                ],
                'correct_index' => 2,
            ],
            [
                'question_text' => "Un modèle de Machine Learning est 'entraîné' pour :",
                'options' => [
                    'Écrire du code source automatiquement.',
                    'Apprendre des modèles à partir des données fournies.',
                    'Supprimer toutes les erreurs d\'une base de données.',
                    'Analyser des données sans aucune logique.',
                ],
                'correct_index' => 1,
            ],
            [
                'question_text' => "Quel est l'objectif principal de la **réduction de dimensionnalité** ?",
                'options' => [
                    'Augmenter la complexité des données.',
                    'Simplifier des données complexes en réduisant le nombre de variables, tout en conservant l\'information importante.',
                    'Ajouter de nouvelles variables aux données.',
                    'Convertir des données numériques en données textuelles.',
                ],
                'correct_index' => 1,
            ],
            [
                'question_text' => "Quel terme désigne le processus d'amélioration continue d'un modèle de Machine Learning ?",
                'options' => [
                    'Déploiement',
                    'Initialisation',
                    'Surveillance et ré-entraînement (si nécessaire)',
                    'Ignorance des performances',
                ],
                'correct_index' => 2,
            ],
            [
                'question_text' => "Parmi les applications suivantes, laquelle est un bon exemple d'utilisation du Machine Learning ?",
                'options' => [
                    'Créer une présentation PowerPoint.',
                    'Envoyer des e-mails manuellement.',
                    'Détection de fraudes bancaires.',
                    'Écrire une lettre à la main.',
                ],
                'correct_index' => 2,
            ],
            [
                'question_text' => "Un ensemble de données où chaque entrée est associée à une 'bonne réponse' est typique de quel type d'apprentissage ?",
                'options' => [
                    'Non supervisé',
                    'Semi-supervisé',
                    'Supervisé',
                    'Par renforcement',
                ],
                'correct_index' => 2,
            ],
        ];

        foreach ($examQuestionsData as $qData) {
            ExamQuestion::create([
                'exam_id' => $exam->id,
                'question_text' => $qData['question_text'],
                'options' => $qData['options'],
                'correct_index' => $qData['correct_index'],
            ]);
        }
        $this->command->info('Questions de l\'examen créées.');

        $this->command->info('Seeder pour le cours "Introduction au Machine Learning" terminé avec succès !');

        // --- Ajout des Ressources de cours ---
        $resourcesData = [
                        [
                            'course_id' => $course->id,
                            'name' => 'Deep Learning - introduction',
                            'type' => 'link',
                            'url' => 'https://www.youtube.com/watch?v=aircAruvnKk/',
                        ],
                        [
                            'course_id' => $course->id,
                            'name' => 'Machine Learning - Classification',
                            'type' => 'pdf',
                            'url' => '/storage/courses/resources/cheatsheet.pdf',
                        ],
                        [
                            'course_id' => $course->id,
                            'name' => 'Différence entre Machine Learning et Deep Learning',
                            'type' => 'image',
                            'url' => '/storage/courses/resources/code_examples.png',
                        ],
                    ];
        
                    foreach ($resourcesData as $rData) {
                        Resource::create($rData);
                    }
        
    }
}