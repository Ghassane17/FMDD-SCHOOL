<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Learner;
use App\Models\Instructor;
use App\Models\Module;
use App\Models\Resource;
use App\Models\QuizQuestion;
use App\Models\Exam;
use App\Models\ExamQuestion;
use App\Models\Course;
use App\Models\Notification;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str; // Pour générer des strings aléatoires ou slugs
use Illuminate\Support\Facades\Storage; // Pour simuler la création de dossiers si besoin

class ProfessionalDemoSeeder extends Seeder
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
            'public/avatars/',
        ];
        foreach ($storagePaths as $path) {
            if (!Storage::exists($path)) {
                Storage::makeDirectory($path);
            }
        }

        // --- 1. Création des Utilisateurs Apprenants ---
        $learnerUsers = [];
        $learnerData = [
            [
                'username' => 'Khalid EL alami',
                'email' => 'khalid@example.com',
                'password' => 'password',
                'prenom' => 'Khalid',
            ],
            [
                'username' => 'Aymane Ettaouil',
                'email' => 'aymane@example.com',
                'password' => 'password',
                'prenom' => 'Aymane',
            ],
        ];

        foreach ($learnerData as $data) {
            $user = User::create([
                'username' => $data['username'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => 'learner',
                'avatar' => '/storage/avatars/' . Str::lower($data['prenom']) . '.png',
            ]);
            Learner::create(['user_id' => $user->id]);
            $learnerUsers[] = $user;
        }

        // --- 2. Création des Utilisateurs Instructeurs ---
        $instructorUsers = [];
        $instructorsSeedData = [
            [
                'username' => 'Prof. Sanae',
                'email' => 'sanae@example.com',
                'password' => 'password',
                'prenom' => 'Sanae',
            ],
            [
                'username' => 'Prof. Youssef',
                'email' => 'youssef@example.com',
                'password' => 'password',
                'prenom' => 'Youssef',
            ],
             [
                'username' => 'Prof. Abdelhamid',
                'email' => 'abdelhamid@example.com',
                'password' => 'password',
                'prenom' => 'Abdelhamid',
            ],
        ];

        foreach ($instructorsSeedData as $data) {
            $user = User::create([
                'username' => $data['username'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => 'instructor',
                'avatar' => '/storage/avatars/' . Str::lower($data['prenom']) . '.png',
            ]);
            Instructor::create(['user_id' => $user->id]);
            $instructorUsers[] = $user;
        }

        // --- 3. Définition des Catégories ---
        $categories = [
            "Informatique", "Développement Web", "Programmation", "Science des données",
            "Intelligence Artificielle", "Cybersécurité", "Mathématiques", "Physique",
            "Chimie", "Biologie", "Design Graphique", "Marketing Digital", "Entrepreneuriat",
            "Finance et Comptabilité", "Langues étrangères", "Psychologie", "Photographie",
            "Musique", "Histoire", "Écriture Créative", "Autre"
        ];

        // --- 4. Création de Formations (15-20) ---
        $coursesData = [
            // Formations par Elara Vidal (instructeur 1 - Développement Web / Programmation)
            [
                'instructor_user_id' => $instructorUsers[0]->id,
                'title' => 'Maîtrise de React.js : Concepts Avancés et Hooks',
                'description' => 'Plongez dans React.js avec une approche approfondie des Hooks, du Context API, et de la gestion d\'état complexe. Créez des applications web performantes et modulaires.',
                'level' => 'intermediate',
                'category' => 'Développement Web',
                'duration_min' => 240, // 4h
                'is_certifiante' => true,
            ],
            [
                'instructor_user_id' => $instructorUsers[0]->id,
                'title' => 'API RESTful avec Laravel et Sanctum',
                'description' => 'Apprenez à construire des API RESTful robustes et sécurisées avec Laravel. Maîtrisez l\'authentification via Laravel Sanctum pour vos applications modernes.',
                'level' => 'intermediate',
                'category' => 'Développement Web',
                'duration_min' => 200, // 3h 20min
                'is_certifiante' => true,
            ],
            [
                'instructor_user_id' => $instructorUsers[0]->id,
                'title' => 'Principes du Clean Code et Refactoring en PHP',
                'description' => 'Améliorez la qualité de votre code PHP en appliquant les principes du Clean Code. Découvrez les techniques de refactoring pour rendre vos applications plus maintenables et évolutives.',
                'level' => 'advanced',
                'category' => 'Programmation',
                'duration_min' => 180, // 3h
                'is_certifiante' => false,
            ],
            [
                'instructor_user_id' => $instructorUsers[0]->id,
                'title' => 'Développement Web pour Débutants : HTML, CSS, JavaScript',
                'description' => 'Commencez votre parcours dans le développement web en apprenant les fondations : structurer avec HTML, styliser avec CSS, et interagir avec JavaScript.',
                'level' => 'beginner',
                'category' => 'Développement Web',
                'duration_min' => 300, // 5h
                'is_certifiante' => true,
            ],
            // Formations par Marc Dubois (instructeur 2 - IA / Cybersécurité)
            [
                'instructor_user_id' => $instructorUsers[1]->id,
                'title' => 'Introduction à l\'Intelligence Artificielle avec Python',
                'description' => 'Découvrez les concepts fondamentaux de l\'IA et du Machine Learning. Explorez les algorithmes clés avec des exemples pratiques en Python.',
                'level' => 'beginner',
                'category' => 'Intelligence Artificielle',
                'duration_min' => 280, // 4h 40min
                'is_certifiante' => true,
            ],
            [
                'instructor_user_id' => $instructorUsers[1]->id,
                'title' => 'Cybersécurité : Les Fondamentaux de la Protection des Données',
                'description' => 'Comprenez les menaces cybernétiques courantes et apprenez les meilleures pratiques pour protéger vos systèmes et vos informations personnelles.',
                'level' => 'beginner',
                'category' => 'Cybersécurité',
                'duration_min' => 150, // 2h 30min
                'is_certifiante' => false,
            ],
            [
                'instructor_user_id' => $instructorUsers[1]->id,
                'title' => 'Programmation Python Avancée : Optimisation et Design Patterns',
                'description' => 'Approfondissez vos connaissances en Python en explorant des sujets avancés tels que les décorateurs, les générateurs, et les design patterns pour un code plus efficace.',
                'level' => 'advanced',
                'category' => 'Programmation',
                'duration_min' => 220, // 3h 40min
                'is_certifiante' => true,
            ],
             // Formations par Sophie Legrand (instructeur 3 - Science des données)
            [
                'instructor_user_id' => $instructorUsers[2]->id,
                'title' => 'Analyse de Données avec Pandas et NumPy',
                'description' => 'Maîtrisez les bibliothèques Python Pandas et NumPy pour l\'analyse et la manipulation de grands ensembles de données. Idéal pour les data scientists en herbe.',
                'level' => 'intermediate',
                'category' => 'Science des données',
                'duration_min' => 180, // 3h
                'is_certifiante' => true,
            ],
            [
                'instructor_user_id' => $instructorUsers[2]->id,
                'title' => 'Visualisation de Données avec Matplotlib et Seaborn',
                'description' => 'Apprenez à créer des visualisations de données percutantes et informatives en Python à l\'aide de Matplotlib et Seaborn.',
                'level' => 'intermediate',
                'category' => 'Science des données',
                'duration_min' => 160, // 2h 40min
                'is_certifiante' => false,
            ],
            // Quelques formations d'autres catégories
             [
                'instructor_user_id' => $instructorUsers[0]->id, // Elara
                'title' => 'Bases de Données Relationnelles et SQL',
                'description' => 'Introduction aux concepts des bases de données relationnelles et maîtrise des requêtes SQL fondamentales pour interagir avec les données.',
                'level' => 'beginner',
                'category' => 'Informatique',
                'duration_min' => 120, // 2h
                'is_certifiante' => true,
            ],
            [
                'instructor_user_id' => $instructorUsers[1]->id, // Marc
                'title' => 'Introduction à la Cryptographie Moderne',
                'description' => 'Découvrez les principes de la cryptographie, les algorithmes de chiffrement et leur application dans la sécurité des communications.',
                'level' => 'intermediate',
                'category' => 'Cybersécurité',
                'duration_min' => 140, // 2h 20min
                'is_certifiante' => false,
            ],
             [
                'instructor_user_id' => $instructorUsers[2]->id, // Sophie
                'title' => 'Éthique en Intelligence Artificielle',
                'description' => 'Explorez les implications éthiques et sociales de l\'IA, y compris les biais algorithmiques, la vie privée et la responsabilité.',
                'level' => 'advanced',
                'category' => 'Intelligence Artificielle',
                'duration_min' => 90, // 1h 30min
                'is_certifiante' => false,
            ],
        ];

        $allCourses = [];
        foreach ($coursesData as $courseData) {
            $instructor = User::find($courseData['instructor_user_id'])->instructor; // Get the Instructor model
            $course = Course::create([
                'instructor_id' => $instructor->id,
                'title' => $courseData['title'],
                'description' => $courseData['description'],
                'level' => $courseData['level'],
                'course_thumbnail' => '/storage/courses/' . Str::slug($courseData['title']) . '/thumbnail/' . Str::slug($courseData['title']) . '_thumb.png',
                'category' => $courseData['category'],
                'is_published' => true,
                'rating' => round(rand(30, 50) / 10, 2), // Rating between 3.0 and 5.0 (optional)
                'duration_min' => $courseData['duration_min'],
                'language' => 'Français',
            ]);
            $allCourses[] = $course;

            // --- Création des dossiers de cours simulés ---
            Storage::makeDirectory('public/courses/modules');
            Storage::makeDirectory('public/courses/resources');
            Storage::makeDirectory('public/courses/' . Str::slug($course->title) . '/thumbnail');


            // --- Création des Modules pour chaque formation ---
            $moduleContents = [
                'video' => '/storage/courses/modules/video.mp4',
                'pdf' => '/storage/courses/modules/document.pdf',
                'image' => '/storage/courses/modules/diagram.png',
            ];

            $modules = [];

            // Module 1: Introduction text
            $modules[] = Module::create([
                'course_id' => $course->id,
                'title' => 'Bienvenue au cours : ' . Str::limit($course->title, 40),
                'type' => 'text',
                'text_content' => '<p>Bienvenue dans ce cours essentiel sur <strong>' . $course->title . '</strong>. Ce module vous introduira aux concepts fondamentaux et aux objectifs d\'apprentissage.</p><p>Préparez-vous à acquérir des compétences pratiques et théoriques qui transformeront votre approche de ' . Str::lower($course->category) . '.</p>',
                'file_path' => null,
                'order' => 1,
            ]);

            // Module 2: Core Video Content
            $modules[] = Module::create([
                'course_id' => $course->id,
                'title' => 'Concepts Clés en ' . $course->category,
                'type' => 'video',
                'file_path' => $moduleContents['video'],
                'order' => 2,
            ]);

            // Module 3: Detailed PDF Guide
            $modules[] = Module::create([
                'course_id' => $course->id,
                'title' => 'Guide Approfondi : ' . Str::limit($course->title, 40) . ' (PDF)',
                'type' => 'pdf',
                'text_content' => null,
                'file_path' => $moduleContents['pdf'],
                'order' => 3,
            ]);

            // Module 4: Illustrative Diagram
            $modules[] = Module::create([
                'course_id' => $course->id,
                'title' => 'Schéma Récapitulatif : ' . Str::limit($course->title, 40),
                'type' => 'image',
                'text_content' => null,
                'file_path' => $moduleContents['image'],
                'order' => 4,
            ]);

            // Module 5: Quiz
            $quizModule = Module::create([
                'course_id' => $course->id,
                'title' => 'Quiz du Cours : Vérifiez vos Connaissances',
                'type' => 'quiz',
                'order' => 5,
            ]);
            $modules[] = $quizModule;

            // --- Ajout des Questions de Quiz (2 par quiz) ---
            $quizQuestionsData = [
                [
                    'question' => "Quelle est la technologie principale enseignée dans ce cours de " . $course->category . " ?",
                    'options' => [
                        ($course->category === 'Développement Web' ? 'React.js' : ($course->category === 'Intelligence Artificielle' ? 'Python & Machine Learning' : 'Concept Général A')),
                        'Une technologie non pertinente',
                        'Une technologie obsolète',
                    ],
                    'correct_option' => 0, // Index 0 of the options array
                ],
                [
                    'question' => "Quel est l'avantage clé de maîtriser " . $course->title . " ?",
                    'options' => [
                        'Améliorer ses compétences en jardinage',
                        'Créer des applications web performantes et sécurisées',
                        'Devenir un expert en cuisine moléculaire',
                    ],
                    'correct_option' => 1, // Index 1 of the options array
                ],
            ];

            foreach ($quizQuestionsData as $qData) {
                QuizQuestion::create([
                    'module_id' => $quizModule->id,
                    'question' => $qData['question'],
                    'options' => $qData['options'],
                    'correct_option' => $qData['correct_option'],
                ]);
            }

            // --- Ajout de l'Examen Final (5 questions) ---
            $exam = Exam::create([
                'course_id' => $course->id,
                'title' => 'Examen Final : ' . $course->title,
                'instructions' => 'Cet examen final teste votre compréhension des concepts clés du cours. Veuillez répondre à toutes les questions dans le temps imparti. Un score de 70% ou plus est requis pour l\'obtention du certificat.',
                'duration_min' => 60,
                'passing_score' => 70,
            ]);

            $examQuestionsData = [
                [
                    'question_text' => "Décrivez brièvement le rôle de " . ($course->category === 'Développement Web' ? 'Laravel' : 'un concept clé de ' . $course->category) . " dans une application web.",
                    'options' => [
                        'Framework pour la gestion de bases de données',
                        'Langage de script client-side',
                        'Un framework PHP pour le développement d\'applications robustes',
                        'Un outil de design graphique',
                    ],
                    'correct_index' => 2,
                ],
                [
                    'question_text' => "Quelle est l'importance de la sécurité dans le développement web, et comment " . ($course->category === 'Développement Web' ? 'Sanctum' : 'un principe de sécurité') . " y contribue ?",
                    'options' => [
                        'Non importante, le backend gère tout',
                        'Cruciale pour protéger les données et les utilisateurs; Sanctum offre une authentification basée sur les tokens.',
                        'Uniquement pour les grandes entreprises',
                        'Implique l\'utilisation de pare-feu uniquement',
                    ],
                    'correct_index' => 1,
                ],
                [
                    'question_text' => "Expliquez le concept de " . ($course->category === 'Développement Web' ? 'middleware' : 'abstraction') . " en " . $course->category . ".",
                    'options' => [
                        'Un type de base de données non-relationnelle',
                        'Un logiciel pour l\'édition de code',
                        'Une couche de filtrage des requêtes HTTP avant qu\'elles n\'atteignent le contrôleur',
                        'Une méthode de compression de fichiers',
                    ],
                    'correct_index' => 2,
                ],
                [
                    'question_text' => "Quels sont les avantages de la programmation orientée objet dans le contexte de " . $course->category . " ?",
                    'options' => [
                        'Rend le code plus difficile à lire',
                        'Favorise la réutilisation du code, la modularité et la maintenabilité',
                        'Augmente la consommation de mémoire',
                        'N\'est utile que pour les petits projets',
                    ],
                    'correct_index' => 1,
                ],
                [
                    'question_text' => "Comment gérez-vous les erreurs et les exceptions en " . ($course->category === 'Programmation' ? 'PHP' : 'Programmation') . "?",
                    'options' => [
                        'En ignorant simplement les erreurs',
                        'Via des blocs try-catch et des logs d\'erreurs',
                        'En redémarrant le serveur à chaque erreur',
                        'En utilisant des commentaires pour les masquer',
                    ],
                    'correct_index' => 1,
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

            // --- Ajout des Ressources de cours ---
            $resourcesData = [
                [
                    'course_id' => $course->id,
                    'name' => 'Documentation Officielle ' . Str::limit($course->title, 20),
                    'type' => 'link',
                    'url' => 'https://www.youtube.com/watch?v=CgkZ7MvWUAA/',
                ],
                [
                    'course_id' => $course->id,
                    'name' => 'Cheatsheet ' . $course->category,
                    'type' => 'pdf',
                    'url' => '/storage/courses/resources/cheatsheet.pdf',
                ],
                [
                    'course_id' => $course->id,
                    'name' => 'Exemples de Code Source',
                    'type' => 'image',
                    'url' => '/storage/courses/resources/code_examples.png',
                ],
            ];

            foreach ($resourcesData as $rData) {
                Resource::create($rData);
            }

            // --- Ajout de Messages de Chat (pour le chat de cours) ---
/*            if ($course->title === 'Maîtrise de React.js : Concepts Avancés et Hooks') {
                $chatMsg1 = ChatMessage::create([
                    'formation_id' => $course->id,
                    'user_id' => $learnerUsers[0]->id, // Alice
                    'content' => 'Bonjour, j\'ai du mal à comprendre le concept des "render props" dans React. Quelqu\'un pourrait m\'éclairer ?',
                ]);

                ChatMessage::create([
                    'formation_id' => $course->id,
                    'user_id' => $learnerUsers[1]->id, // Bob
                    'content' => 'Salut Alice ! Les render props sont une technique pour partager du code entre composants React en utilisant une prop dont la valeur est une fonction.',
                    'parent_message_id' => $chatMsg1->id,
                ]);

                ChatMessage::create([
                    'formation_id' => $course->id,
                    'user_id' => $instructorUsers[0]->id, // Elara (instructeur du cours)
                    'content' => 'Bonne question Alice ! Bob a bien résumé. Pensez-y comme un moyen de passer la "manière de rendre" à un composant enfant.',
                    'parent_message_id' => $chatMsg1->id,
                ]);

                 $chatMsg2 = ChatMessage::create([
                    'formation_id' => $course->id,
                    'user_id' => $instructorUsers[0]->id, // Elara (instructeur du cours)
                    'content' => 'Rappel pour le module 3 : assurez-vous de bien comprendre le cycle de vie des composants avec les Hooks.',
                ]);
            }
            if ($course->title === 'API RESTful avec Laravel et Sanctum') {
                ChatMessage::create([
                    'formation_id' => $course->id,
                    'user_id' => $learnerUsers[1]->id, // Bob
                    'content' => 'Quelqu\'un a une bonne ressource externe sur l\'utilisation de Postman avec les API Laravel Sanctum ?',
                ]);
            }
*/
            // --- Ajout de Notifications ---
            // Notifications pour l'instructeur Elara
            if ($instructor->user_id === $instructorUsers[0]->id) {
                 Notification::create([
                    'user_id' => $instructorUsers[0]->id,
                    'type' => 'course_approved',
                    'text' => 'Votre cours "' . $course->title . '" a été approuvé et est maintenant en ligne !',
                    'read' => false,
                    'data' => [
                        'course_id' => $course->id,
                        'message' => 'Félicitations ! Votre cours "' . $course->title . '" est désormais visible par tous les apprenants. Merci pour votre contribution.',
                    ],
                ]);
            }
            // Notifications pour l'instructeur  (demande de modifications)
            if ($instructor->user_id === $instructorUsers[2]->id) {
                 Notification::create([
                    'user_id' => $instructorUsers[2]->id,
                    'type' => 'changes_requested',
                    'text' => 'Votre cours "' . $course->title . '" a été modifié. Veuillez vérifier les modifications.',
                    'read' => false,
                    'data' => [
                        'course_id' => $course->id,
                        'message' => 'Votre cours "' . $course->title . '" a été modifié. Veuillez vérifier les modifications.',
                    ],
                ]);
            }
             // Notification pour l'instructeur Youssef (rejet)
            if ($instructor->user_id === $instructorUsers[1]->id) {
                Notification::create([
                    'user_id' => $instructorUsers[1]->id,
                    'type' => 'course_rejected',
                    'text' => 'Votre cours "' . $course->title . '" a été rejeté. Veuillez corriger les erreurs et réessayer.',
                    'read' => false,
                    'data' => [
                        'course_id' => $course->id,
                        'message' => 'Votre cours "' . $course->title . '" a été rejeté. Veuillez corriger les erreurs et réessayer.',
                        //'chat_message_id' => ChatMessage::where('formation_id', $course->id)->latest()->first()->id, // Last message in that course
                    ],
                ]);
            }
        }

        $this->command->info('Base de données remplie avec succès pour la démo professionnelle !');
    }
}