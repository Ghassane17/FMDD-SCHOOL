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
            'avatar' => 'storage/avatars/WsuhBYEJy9VT5lSb3yV2IlyugJvzt7OEEtmsFeXH.jpg',
        ]);
        Learner::create(['user_id' => $learnerUser->id]);

        // Create instructor user and profile
        $instructorUser = User::create([
            'username' => 'instructor1',
            'email' => 'instructor1@example.com',
            'password' => Hash::make('password'),
            'role' => 'instructor',
            'avatar' => 'storage/avatars/WsuhBYEJy9VT5lSb3yV2IlyugJvzt7OEEtmsFeXH.jpg',
        ]);
        $instructor = Instructor::create(['user_id' => $instructorUser->id]);

        // Create course
        $course = Course::create([
            'instructor_id' => $instructor->id,
            'title' => 'Introduction to Laravel',
            'description' => 'Learn the basics of Laravel framework.',
            'level' => 'beginner',
            'category' => 'Web Development',
            'is_published' => true,
            'rating' => 0.00,
            'duration_min' => 120,
        ]);

        // Create modules
        $modulesData = [
            [
                'course_id' => $course->id,
                'title' => 'Introduction Text',
                'type' => 'text',
                'text_content' => '<p>This is an introduction to the course.</p>',
                'file_path' => null,
                'order' => 1,
            ],
            [
                'course_id' => $course->id,
                'title' => 'Getting Started with Laravel',
                'type' => 'video',
                'file_path' => 'http://localhost/storage/videos/Enregistrement_2025-05-15_002632.mp4',
                'order' => 2,
            ],
            [
                'course_id' => $course->id,
                'title' => 'Course PDF',
                'type' => 'pdf',
                'text_content' => null,
                'file_path' => 'http://localhost/storage/pdfs/course.pdf',
                'order' => 3,
            ],
            [
                'course_id' => $course->id,
                'title' => 'Diagram',
                'type' => 'image',
                'text_content' => null,
                'file_path' => 'http://localhost/storage/images/diagram.jpg',
                'order' => 4,
            ],
            [
                'course_id' => $course->id,
                'title' => 'Laravel Basics Quiz',
                'type' => 'quiz',
                'order' => 5,
            ],
        ];

        $modules = [];
        foreach ($modulesData as $moduleData) {
            $modules[] = Module::create($moduleData);
        }

        // Add quiz questions
        $quizModule = collect($modules)->first(fn($m) => $m->type === 'quiz');
        if ($quizModule) {
            $quizQuestions = [
                [
                    'question' => 'What is Laravel?',
                    'options' => [
                        ['id' => 1, 'text' => 'A PHP framework'],
                        ['id' => 2, 'text' => 'A CSS library'],
                        ['id' => 3, 'text' => 'A database'],
                    ],
                    'correct_option' => 1,
                ],
                [
                    'question' => 'What command creates a new controller?',
                    'options' => [
                        ['id' => 1, 'text' => 'php artisan make:model'],
                        ['id' => 2, 'text' => 'php artisan make:controller'],
                        ['id' => 3, 'text' => 'php artisan new controller'],
                    ],
                    'correct_option' => 2,
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

        // Add final exam
        $exam = Exam::create([
            'course_id' => $course->id,
            'title' => 'Laravel Final Exam',
            'instructions' => 'Complete all questions within 60 minutes. Passing score is 70%.',
            'duration_min' => 60,
            'passing_score' => 70,
        ]);

        // Add exam questions
        $examQuestions = [
            [
                'question_text' => 'Which Laravel component handles HTTP requests?',
                'options' => [
                    ['id' => 1, 'text' => 'Middleware'],
                    ['id' => 2, 'text' => 'Eloquent'],
                    ['id' => 3, 'text' => 'Blade'],
                    ['id' => 4, 'text' => 'Artisan'],
                ],
                'correct_index' => 1,
            ],
            [
                'question_text' => 'What is the purpose of Laravel\'s Eloquent?',
                'options' => [
                    ['id' => 1, 'text' => 'Template rendering'],
                    ['id' => 2, 'text' => 'Database ORM'],
                    ['id' => 3, 'text' => 'Routing'],
                    ['id' => 4, 'text' => 'Authentication'],
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
                'name' => 'Laravel Docs PDF',
                'type' => 'pdf',
                'url' => 'https://example.com/docs/laravel.pdf',
            ],
            [
                'course_id' => $course->id,
                'name' => 'Cheat Sheet',
                'type' => 'image',
                'url' => 'http://localhost/storage/images/cheat_sheet.jpg',
            ],
        ];

        foreach ($resources as $resource) {
            Resource::create($resource);
        }
    }
}
