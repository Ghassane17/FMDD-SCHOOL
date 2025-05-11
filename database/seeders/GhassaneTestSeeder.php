<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Learner;
use App\Models\Ghassane_test_instructor;
use App\Models\Course;
use Illuminate\Support\Facades\Hash;

class GhassaneTestSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::create([
            'username' => 'Ghassane',
            'email' => 'ghassane@example.com',
            'password' => Hash::make('191192'),
            'role' => 'learner',
            'avatar' => 'https://via.placeholder.com/50',
            'bio' => 'Passionate about tech and data',
        ]);

        $learner = Learner::create([
            'user_id' => $user->id,
            'courses_enrolled' => 3,
            'courses_completed' => 1,
            'last_connection' => now(),
        ]);

        $instructor1 = Ghassane_test_instructor::create([
            'username' => 'Hassane',
            'email' => 'instructor1@example.com',
        ]);

        $instructor2 = Ghassane_test_instructor::create([
            'username' => 'Amina',
            'email' => 'instructor2@example.com',
        ]);

        $courses = [
            [
                'title' => 'Programming 101',
                'description' => 'Learn the basics of coding',
                'instructor_id' => $instructor1->id,
                "course_thumbnail" => "https://via.placeholder.com/51",
            ],
            [
                'title' => 'Web Development',
                'description' => 'Build modern websites',
                'instructor_id' => $instructor1->id,
                "course_thumbnail" => "https://via.placeholder.com/52",
            ],
            [
                'title' => 'Data Science Intro',
                'description' => 'Explore data analysis',
                'instructor_id' => $instructor2->id,
                "course_thumbnail" => "https://via.placeholder.com/53",
            ],
        ];

        foreach ($courses as $courseData) {
            Course::create($courseData);
        }

        $learner->courses()->attach([
            1 => ['progress' => 80],
            2 => ['progress' => 50],
            3 => ['progress' => 20],
        ]);
    }
}
