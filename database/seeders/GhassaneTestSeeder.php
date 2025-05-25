<?php

namespace Database\Seeders;


use App\Models\Resource;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Instructor;
use App\Models\Course;
use App\Models\Learner;



use Illuminate\Support\Facades\Hash;

class GhassaneTestSeeder extends Seeder
{
    public function run(): void
    {
        // Create test learner user
        $learnerUser = User::create([
            'username' => 'ghassane',
            'email' => 'ghassane@example.com',
            'password' => Hash::make('123456789'),
            'role' => 'learner',
            'avatar' => 'https://via.placeholder.com/50',
            'bio' => 'Test learner account',
            'phone' => null,
            'notifications' => [
                'email' => true,
                'push' => true
            ]
        ]);

        // Create learner profile with proper initial state
        $learner = Learner::create([
            'user_id' => $learnerUser->id,
            'courses_enrolled' => 0,
            'courses_completed' => 0,
            'last_connection' => now(),
            'fields_of_interest' => ['Web Development', 'Data Science'],
            'languages' => [
                ['name' => 'Français', 'code' => 'FR'],
                ['name' => 'Anglais', 'code' => 'EN']
            ],
            'certifications' => [],
            'bank_info' => null
        ]);

        // Create instructor users
        $instructorUsers = [
            [
                'username' => 'Amine',
                'email' => 'amine@example.com',
                'password' => Hash::make('password'),
                'role' => 'instructor',
                'avatar' => 'https://via.placeholder.com/51',
                'bio' => 'Expert en développement web et mobile',
                'phone' => null,
                'notifications' => [
                    'email' => true,
                    'push' => true
                ]
            ],
            [
                'username' => 'Sarah',
                'email' => 'sarah@example.com',
                'password' => Hash::make('password'),
                'role' => 'instructor',
                'avatar' => 'https://via.placeholder.com/52',
                'bio' => 'Spécialiste en Data Science et Machine Learning',
                'phone' => null,
                'notifications' => [
                    'email' => true,
                    'push' => true
                ]
            ],
            [
                'username' => 'Karim',
                'email' => 'karim@example.com',
                'password' => Hash::make('password'),
                'role' => 'instructor',
                'avatar' => 'https://via.placeholder.com/53',
                'bio' => 'Expert en cybersécurité et réseaux',
                'phone' => null,
                'notifications' => [
                    'email' => true,
                    'push' => true
                ]
            ]
        ];

        $instructors = [];
        foreach ($instructorUsers as $userData) {
            $user = User::create($userData);
            $instructor = Instructor::create([
                'user_id' => $user->id,
                'skills' => [
                    $userData['username'] === 'Amine' ? ['JavaScript', 'React', 'Node.js', 'MongoDB'] : ($userData['username'] === 'Sarah' ? ['Python', 'TensorFlow', 'Pandas', 'Scikit-learn'] :
                        ['Network Security', 'Ethical Hacking', 'Linux', 'Cloud Security'])
                ],
                'languages' => [
                    ['name' => 'Français', 'code' => 'FR'],
                    ['name' => 'Anglais', 'code' => 'EN']
                ],
                'certifications' => [
                    $userData['username'] === 'Amine' ? [
                        ['name' => 'Full Stack Developer', 'institution' => 'MongoDB University'],
                        ['name' => 'React Advanced', 'institution' => 'Meta']
                    ] : ($userData['username'] === 'Sarah' ? [
                        ['name' => 'Data Science Professional', 'institution' => 'IBM'],
                        ['name' => 'Machine Learning Engineer', 'institution' => 'Google']
                    ] : [
                        ['name' => 'Certified Ethical Hacker', 'institution' => 'EC-Council'],
                        ['name' => 'CISSP', 'institution' => 'ISC2']
                    ])
                ],
                'availability' => [
                    ['day' => 'Lundi', 'slots' => ['10:00', '14:00', '16:00']],
                    ['day' => 'Mercredi', 'slots' => ['09:00', '11:00']],
                    ['day' => 'Vendredi', 'slots' => ['10:00', '13:00']]
                ],
                'bank_info' => [
                    'iban' => 'FR76 **** **** **** **** 1234',
                    'bankName' => 'CIH Bank',
                    'paymentMethod' => 'Virement bancaire'
                ]
            ]);
            $instructors[] = $instructor;
        }

        // Create courses
        $courses = [
            // Amine's courses (Web Development)
            [
                'title' => 'Développement Web Full Stack',
                'description' => 'Apprenez à créer des applications web modernes avec React, Node.js et MongoDB',
                'instructor_id' => $instructors[0]->id,
                'course_thumbnail' => 'https://via.placeholder.com/150',
                'level' => 'intermediate',
                'category' => 'Développement Web',

                'is_published' => true,
                'duration_hours' => 40
            ],
            [
                'title' => 'React.js Avancé',
                'description' => 'Maîtrisez les concepts avancés de React et Redux pour créer des applications robustes',
                'instructor_id' => $instructors[0]->id,
                'course_thumbnail' => 'https://via.placeholder.com/151',
                'level' => 'advanced',
                'category' => 'Développement Web',

                'is_published' => true,
                'duration_hours' => 30
            ],
            [
                'title' => 'Introduction au Développement Web',
                'description' => 'Les bases du HTML, CSS et JavaScript pour débutants',
                'instructor_id' => $instructors[0]->id,
                'course_thumbnail' => 'https://via.placeholder.com/152',
                'level' => 'beginner',
                'category' => 'Développement Web',

                'is_published' => true,
                'duration_hours' => 20
            ],

            // Sarah's courses (Data Science)
            [
                'title' => 'Data Science avec Python',
                'description' => 'Analyse de données et visualisation avec Python, Pandas et Matplotlib',
                'instructor_id' => $instructors[1]->id,
                'course_thumbnail' => 'https://via.placeholder.com/153',
                'level' => 'intermediate',
                'category' => 'Data Science',

                'is_published' => true,
                'duration_hours' => 45
            ],
            [
                'title' => 'Machine Learning Fondamentaux',
                'description' => 'Introduction aux algorithmes de machine learning et leur implémentation',
                'instructor_id' => $instructors[1]->id,
                'course_thumbnail' => 'https://via.placeholder.com/154',
                'level' => 'advanced',
                'category' => 'Data Science',

                'is_published' => true,
                'duration_hours' => 35
            ],
            [
                'title' => 'Python pour Débutants',
                'description' => 'Apprenez les bases de Python pour la science des données',
                'instructor_id' => $instructors[1]->id,
                'course_thumbnail' => 'https://via.placeholder.com/155',
                'level' => 'beginner',
                'category' => 'Data Science',

                'is_published' => true,
                'duration_hours' => 25
            ],

            // Karim's courses (Cybersecurity)
            [
                'title' => 'Cybersécurité Essentielle',
                'description' => 'Protection des systèmes et réseaux contre les menaces cybernétiques',
                'instructor_id' => $instructors[2]->id,
                'course_thumbnail' => 'https://via.placeholder.com/156',
                'level' => 'intermediate',
                'category' => 'Cybersécurité',

                'is_published' => true,
                'duration_hours' => 40
            ],
            [
                'title' => 'Ethical Hacking',
                'description' => 'Techniques de test d\'intrusion et de sécurité offensive',
                'instructor_id' => $instructors[2]->id,
                'course_thumbnail' => 'https://via.placeholder.com/157',
                'level' => 'advanced',
                'category' => 'Cybersécurité',

                'is_published' => true,
                'duration_hours' => 50
            ],
            [
                'title' => 'Sécurité des Réseaux',
                'description' => 'Fondamentaux de la sécurité réseau et des protocoles',
                'instructor_id' => $instructors[2]->id,
                'course_thumbnail' => 'https://via.placeholder.com/158',
                'level' => 'beginner',
                'category' => 'Cybersécurité',

                'is_published' => true,
                'duration_hours' => 30
            ]
        ];

        foreach ($courses as $courseData) {
            $course = Course::create($courseData);

            // Create modules for each course based on its category
            $modules = [];
            if ($courseData['category'] === 'Développement Web') {
                $modules = [
                    ['title' => 'Introduction au HTML et CSS', 'duration' => 120, 'order' => 1 , 'file_path'=>storage_path('app/public/Enregistrement 2025-05-15 002632.mp4')],
                    ['title' => 'JavaScript Fondamentaux', 'duration' => 180, 'order' => 2 ,'file_path'=>storage_path('app/public/Enregistrement 2025-05-15 002632.mp4') ],
                    ['title' => 'React.js Basics', 'duration' => 240, 'order' => 3,'file_path'=>storage_path('app/public/Enregistrement 2025-05-15 002632.mp4')],
                    ['title' => 'Node.js et Express', 'duration' => 180, 'order' => 4, 'file_path'=>storage_path('app/public/Enregistrement 2025-05-15 002632.mp4')],
                    ['title' => 'MongoDB et Base de Données', 'duration' => 150, 'order' => 5, 'file_path'=>storage_path('app/public/Enregistrement 2025-05-15 002632.mp4')]
                ];
            } elseif ($courseData['category'] === 'Data Science') {
                $modules = [
                    ['title' => 'Introduction à Python', 'duration' => 120, 'order' => 1],
                    ['title' => 'Pandas et Numpy', 'duration' => 180, 'order' => 2],
                    ['title' => 'Visualisation de Données', 'duration' => 150, 'order' => 3],
                    ['title' => 'Machine Learning Basics', 'duration' => 240, 'order' => 4],
                    ['title' => 'Projets Pratiques', 'duration' => 180, 'order' => 5]
                ];
            } else { // Cybersécurité
                $modules = [
                    ['title' => 'Fondamentaux de la Sécurité', 'duration' => 120, 'order' => 1],
                    ['title' => 'Sécurité des Réseaux', 'duration' => 180, 'order' => 2],
                    ['title' => 'Cryptographie', 'duration' => 150, 'order' => 3],
                    ['title' => 'Test d\'Intrusion', 'duration' => 240, 'order' => 4],
                    ['title' => 'Sécurité des Applications', 'duration' => 180, 'order' => 5]
                ];
            }

            // Create modules for the course
            foreach ($modules as $moduleData) {
                $course->modules()->create($moduleData);
            }

            // Create course resources
            $resources = [];
            if ($courseData['category'] === 'Développement Web') {
                $resources = [
                    [
                        'name' => 'Vidéo de présentation',
                        'type' => 'video',
                        'url' => 'https://example.com/videos/intro.mp4'
                    ],
                    [
                        'name' => 'Documentation PDF',
                        'type' => 'pdf',
                        'url' => 'https://example.com/docs/tutorial.pdf'
                    ],
                    [
                        'name' => 'Exercices pratiques',
                        'type' => 'pdf',
                        'url' => 'https://example.com/exercises/practice.pdf'
                    ]
                ];
            } elseif ($courseData['category'] === 'Data Science') {
                $resources = [
                    [
                        'name' => 'Tutoriel vidéo',
                        'type' => 'video',
                        'url' => 'https://example.com/videos/tutorial.mp4'
                    ],
                    [
                        'name' => 'Notebook Jupyter',
                        'type' => 'pdf',
                        'url' => 'https://example.com/notebooks/analysis.ipynb'
                    ],
                    [
                        'name' => 'Dataset d\'exercice',
                        'type' => 'pdf',
                        'url' => 'https://example.com/datasets/exercise.csv'
                    ]
                ];
            } else { // Cybersécurité
                $resources = [
                    [
                        'name' => 'Démonstration vidéo',
                        'type' => 'video',
                        'url' => 'https://example.com/videos/demo.mp4'
                    ],
                    [
                        'name' => 'Guide de laboratoire',
                        'type' => 'pdf',
                        'url' => 'https://example.com/labs/guide.pdf'
                    ],
                    [
                        'name' => 'Outils de pratique',
                        'type' => 'pdf',
                        'url' => 'https://example.com/tools/practice.zip'
                    ]
                ];
            }

            // Create resources for the course
            foreach ($resources as $resourceData) {
                Resource::create([
                    'course_id' => $course->id,
                    'name' => $resourceData['name'],
                    'type' => $resourceData['type'],
                    'url' => $resourceData['url']
                ]);
            }
        }

        // Add a test comment for the first course
        $firstCourse = Course::first();
        if ($firstCourse) {
            $firstCourse->comments()->create([
                'user_id' => $learnerUser->id,
                'text' => 'Ceci est un commentaire de test.',
                'rating' => 5
            ]);
        }
    }
}
