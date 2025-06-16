<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Learner;
use App\Models\Instructor;
use App\Models\Course;
use App\Models\Module;
use App\Models\Resource;
use App\Models\QuizQuestion;
use App\Models\Exam;
use App\Models\ExamQuestion;
use App\Models\Comment;
use App\Models\Notification;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class GhassaneTestSeeder extends Seeder
{
    public function run(): void
    {
        // Create learner user and profile
        $learnerUser = User::create([
            'username' => 'ghassane',
            'email' => 'ghassanehmimou2003@gmail.com',
            'password' => Hash::make('123456789'),
            'role' => 'learner',
            'avatar' => '/storage/Test.png',
        ]);
        Learner::create(['user_id' => $learnerUser->id]);

        // Define multiple instructors
        $instructorsData = [
            [
                'username' => 'instructor1',
                'email' => 'instructor1@example.com',
                'password' => 'password',
                'courses' => [
                    [
                        'title' => 'Introduction to Laravel',
                        'description' => 'Learn the basics of Laravel framework.',
                        'level' => 'beginner',
                        'category' => 'Web Development',
                        'duration_min' => 120,
                    ],
                    [
                        'title' => 'Advanced Laravel Techniques',
                        'description' => 'Master advanced Laravel concepts.',
                        'level' => 'advanced',
                        'category' => 'Web Development',
                        'duration_min' => 180,
                    ],
                ],
            ],
            [
                'username' => 'instructor2',
                'email' => 'instructor2@example.com',
                'password' => 'password2',
                'courses' => [
                    [
                        'title' => 'Python for Beginners',
                        'description' => 'Introduction to Python programming.',
                        'level' => 'beginner',
                        'category' => 'Programming',
                        'duration_min' => 100,
                    ],
                    [
                        'title' => 'Data Science with Python',
                        'description' => 'Learn data science techniques using Python.',
                        'level' => 'intermediate',
                        'category' => 'Data Science',
                        'duration_min' => 150,
                    ],
                ],
            ],
            [
                'username' => 'instructor3',
                'email' => 'instructor3@example.com',
                'password' => 'password3',
                'courses' => [
                    [
                        'title' => 'React Fundamentals',
                        'description' => 'Build dynamic UIs with React.',
                        'level' => 'beginner',
                        'category' => 'Frontend Development',
                        'duration_min' => 90,
                    ],
                ],
            ],
        ];

        foreach ($instructorsData as $instructorData) {
            // Create instructor user and profile
            $instructorUser = User::create([
                'username' => $instructorData['username'],
                'email' => $instructorData['email'],
                'password' => Hash::make($instructorData['password']),
                'role' => 'instructor',
                'avatar' => '/storage/Test.png',
            ]);
            $instructor = Instructor::create(['user_id' => $instructorUser->id]);

            // Create courses for the instructor
            foreach ($instructorData['courses'] as $courseData) {
                $course = Course::create([
                    'instructor_id' => $instructor->id,
                    'title' => $courseData['title'],
                    'description' => $courseData['description'],
                    'level' => $courseData['level'],
                    'course_thumbnail' => '/storage/Test.png',
                    'category' => $courseData['category'],
                    'is_published' => true,
                    'rating' => 0.00,
                    'duration_min' => $courseData['duration_min'],
                    'language' => 'Français',
                ]);

                // Create modules for the course
                $modulesData = [
                    [
                        'course_id' => $course->id,
                        'title' => 'Introduction Text',
                        'type' => 'text',
                        'text_content' => '<p>Welcome to ' . $course->title . '.</p>',
                        'file_path' => null,
                        'order' => 1,
                    ],
                    [
                        'course_id' => $course->id,
                        'title' => 'Getting Started Video',
                        'type' => 'video',
                        'file_path' => '/storage/Test.mp4',
                        'order' => 2,
                    ],
                    [
                        'course_id' => $course->id,
                        'title' => 'Course PDF',
                        'type' => 'pdf',
                        'text_content' => null,
                        'file_path' => '/storage/Test.pdf',
                        'order' => 3,
                    ],
                    [
                        'course_id' => $course->id,
                        'title' => 'Diagram',
                        'type' => 'image',
                        'text_content' => null,
                        'file_path' => '/storage/Test.png',
                        'order' => 4,
                    ],
                    [
                        'course_id' => $course->id,
                        'title' => $course->title . ' Quiz',
                        'type' => 'quiz',
                        'order' => 5,
                    ],
                ];

                $modules = [];
                foreach ($modulesData as $moduleData) {
                    $modules[] = Module::create($moduleData);
                }

                // Add quiz questions for the quiz module
                $quizModule = collect($modules)->first(fn($m) => $m->type === 'quiz');
                if ($quizModule) {
                    $quizQuestions = [
                        [
                            'question' => 'What is the main focus of ' . $course->title . '?',
                            'options' => [
                                ['id' => 1, 'text' => $course->category . ' basics'],
                                ['id' => 2, 'text' => 'Advanced database management'],
                                ['id' => 3, 'text' => 'Graphic design'],
                            ],
                            'correct_option' => 0,
                        ],
                        [
                            'question' => 'Which tool is commonly used in ' . $course->category . '?',
                            'options' => [
                                ['id' => 1, 'text' => 'A relevant tool'],
                                ['id' => 2, 'text' => 'An irrelevant tool'],
                                ['id' => 3, 'text' => 'Another irrelevant tool'],
                            ],
                            'correct_option' => 0,
                        ],
                    ];

                    foreach ($quizQuestions as $question) {
                        QuizQuestion::create([
                            'module_id' => $quizModule->id,
                            'question' => $question['question'],
                            'options' => $question['options'],
                            'correct_option' => $question['correct_option'],
                        ]);
                    }
                }

                // Add final exam for the course
                $exam = Exam::create([
                    'course_id' => $course->id,
                    'title' => $course->title . ' Final Exam',
                    'instructions' => 'Complete all questions within 60 minutes. Passing score is 70%.',
                    'duration_min' => 60,
                    'passing_score' => 70,
                ]);

                // Add exam questions
                $examQuestions = [
                    [
                        'question_text' => 'What is a key feature of ' . $course->title . '?',
                        'options' => [
                            ['id' => 1, 'text' => 'Feature A'],
                            ['id' => 2, 'text' => 'Feature B'],
                            ['id' => 3, 'text' => 'Feature C'],
                            ['id' => 4, 'text' => 'Feature D'],
                        ],
                        'correct_index' => 1,
                    ],
                    [
                        'question_text' => 'Why is ' . $course->category . ' important?',
                        'options' => [
                            ['id' => 1, 'text' => 'Reason A'],
                            ['id' => 2, 'text' => 'Reason B'],
                            ['id' => 3, 'text' => 'Reason C'],
                            ['id' => 4, 'text' => 'Reason D'],
                        ],
                        'correct_index' => 2,
                    ],
                ];

                foreach ($examQuestions as $question) {
                    ExamQuestion::create([
                        'exam_id' => $exam->id,
                        'question_text' => $question['question_text'],
                        'options' => $question['options'],
                        'correct_index' => $question['correct_index'],
                    ]);
                }

                // Add course resources
                $resources = [
                    [
                        'course_id' => $course->id,
                        'name' => $course->title . ' Reference PDF',
                        'type' => 'pdf',
                        'url' => '/storage/Test.pdf',
                    ],
                    [
                        'course_id' => $course->id,
                        'name' => $course->title . ' Cheat Sheet',
                        'type' => 'image',
                        'url' => '/storage/Test.png',
                    ],
                ];

                foreach ($resources as $resource) {
                    Resource::create($resource);
                }

                // Add course comments
                $comments = [
                    [
                        'course_id' => $course->id,
                        'user_id' => $learnerUser->id,
                        'text' => 'Great course! I learned a lot.',
                        'rating' => 5,
                    ],
                ];

                foreach ($comments as $comment) {
                    Comment::create($comment);
                }

                // Add Notifications
                $notifications = [
                    [
                        'user_id' => $instructorUser->id,
                        'type' => 'course_approved',
                        'text' => 'Your course has been approved.',
                        'read' => false,
                        'data' => [
                            'course_id' => $course->id,
                            'message' => 'Your course is now live on the platform thank you for your patience.',
                        ],
                    ],
                ];

                foreach ($notifications as $notification) {
                    Notification::create($notification);
                }
            }
        }
    }
}
