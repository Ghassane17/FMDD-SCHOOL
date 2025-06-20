<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            GhassaneTestSeeder::class,
        ]);
        $this->call([
            ProfessionalDemoSeeder::class,
        ]);
        $this->call([
            MachineLearningCourseSeeder::class,
        ]);
    }
}
