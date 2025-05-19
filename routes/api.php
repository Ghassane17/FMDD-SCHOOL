<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\LearnerController;
use App\Http\Controllers\InstructorController;

// Authentication Routes
Route::post('/register', [RegisterController::class, 'register'])->name('register');
Route::patch('/learner/profile', [LearnerController::class, 'profile'] )->name('learner.profile');
//Route::patch('/instructor/profile', [InstructorController::class, 'profile'] )->name('instructor.profile'); THIS ROUTE IS TO MODIFY


Route::post('/login', [LoginController::class, 'login'])->name('login');
Route::post('/logout', [LoginController::class, 'logout'])->middleware('auth:sanctum')->name('logout');

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {

    Route::patch('/learner/profile', [LearnerController::class, 'profile'] )->name('learner.profile');
    Route::patch('/instructor/profile', [InstructorController::class, 'profile'] )->name('instructor.profile');

    // Learner Routes
    Route::get('/learner', [LearnerController::class, 'dashboard'])->name('learner.dashboard');

    Route::get('/learner/all-enrolled-courses', [CourseController::class, 'getEnrolledCourses'])->name('learner.enrolled-courses');
    Route::get('/courses/{id}', [CourseController::class, 'show'])->name('courses.show');

    Route::get('/learner/settings', [LearnerController::class, 'settings'])->name('learner.settings');
    Route::patch('/learner/settings', [LearnerController::class, 'updateSettings'])->name('learner.settings.update');
    Route::post('/learner/contact', [LearnerController::class, 'contact'])->name('learner.contact');

    // Instructor Routes
    Route::get('/instructor/dashboard', [InstructorController::class, 'dashboard'])->name('instructor.dashboard');
});
