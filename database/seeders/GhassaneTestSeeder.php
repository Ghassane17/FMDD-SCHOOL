<?php

namespace Database\Seeders;

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
                'level' => 'intermédiaire',
                'category' => 'Développement Web',

                'is_published' => true,
                'duration_hours' => 40
            ],
            [
                'title' => 'React.js Avancé',
                'description' => 'Maîtrisez les concepts avancés de React et Redux pour créer des applications robustes',
                'instructor_id' => $instructors[0]->id,
                'course_thumbnail' => 'https://via.placeholder.com/151',
                'level' => 'avancé',
                'category' => 'Développement Web',

                'is_published' => true,
                'duration_hours' => 30
            ],
            [
                'title' => 'Introduction au Développement Web',
                'description' => 'Les bases du HTML, CSS et JavaScript pour débutants',
                'instructor_id' => $instructors[0]->id,
                'course_thumbnail' => 'https://via.placeholder.com/152',
                'level' => 'débutant',
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
                'level' => 'intermédiaire',
                'category' => 'Data Science',

                'is_published' => true,
                'duration_hours' => 45
            ],
            [
                'title' => 'Machine Learning Fondamentaux',
                'description' => 'Introduction aux algorithmes de machine learning et leur implémentation',
                'instructor_id' => $instructors[1]->id,
                'course_thumbnail' => 'https://via.placeholder.com/154',
                'level' => 'avancé',
                'category' => 'Data Science',

                'is_published' => true,
                'duration_hours' => 35
            ],
            [
                'title' => 'Python pour Débutants',
                'description' => 'Apprenez les bases de Python pour la science des données',
                'instructor_id' => $instructors[1]->id,
                'course_thumbnail' => 'https://via.placeholder.com/155',
                'level' => 'débutant',
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
                'level' => 'intermédiaire',
                'category' => 'Cybersécurité',

                'is_published' => true,
                'duration_hours' => 40
            ],
            [
                'title' => 'Ethical Hacking',
                'description' => 'Techniques de test d\'intrusion et de sécurité offensive',
                'instructor_id' => $instructors[2]->id,
                'course_thumbnail' => 'https://via.placeholder.com/157',
                'level' => 'avancé',
                'category' => 'Cybersécurité',

                'is_published' => true,
                'duration_hours' => 50
            ],
            [
                'title' => 'Sécurité des Réseaux',
                'description' => 'Fondamentaux de la sécurité réseau et des protocoles',
                'instructor_id' => $instructors[2]->id,
                'course_thumbnail' => 'https://via.placeholder.com/158',
                'level' => 'débutant',
                'category' => 'Cybersécurité',

                'is_published' => true,
                'duration_hours' => 30
            ]
        ];

        foreach ($courses as $courseData) {
            Course::create($courseData);
        }


    }
}
