<?php

use App\Http\Controllers\PublicController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\LearnerController;
use App\Http\Controllers\InstructorController;
use App\Http\Controllers\CourseInstructorController;
// Authentication Routes
Route::post('/register', [RegisterController::class, 'register'])->name('register');
Route::patch('/learner/profile', [LearnerController::class, 'profile'])->name('learner.profile');
Route::patch('/instructor/profile', [InstructorController::class, 'profile'])->name('instructor.profile');

Route::post('/contact', [PublicController::class, 'contact'])->name('contact');

Route::post('/login', [LoginController::class, 'login'])->name('login');
Route::post('/logout', [LoginController::class, 'logout'])->middleware('auth:sanctum')->name('logout');

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    //Account completion
    Route::patch('/learner/profile', [LearnerController::class, 'profile'])->name('learner.profile');
    Route::patch('/instructor/profile', [InstructorController::class, 'profile'])->name('instructor.profile');
    Route::patch('/instructor/completeRegister', [InstructorController::class, 'completeRegister'])->name('instructor.completeRegister');
    //Dashboard get
    Route::get('/learner', [LearnerController::class, 'dashboard'])->name('learner.dashboard');

    //courses routes
    Route::get('/learner/all-courses', [CourseController::class, 'getAllCourses'])->name('learner.enrolled-courses');
    Route::get('/learner/all-enrolled-courses', [CourseController::class, 'getEnrolledCourses'])->name('learner.enrolled-courses');
    Route::get('/courses/{id}', [CourseController::class, 'getCourseDetails']);
    Route::post('/courses/{id}/enroll', [CourseController::class, 'enrollNow']);
    Route::delete('/courses/{course}/leave', [CourseController::class, 'leave']);

    // course creation
    Route::post('/createCourse', [CourseInstructorController::class, 'createCourse'])->name('instructor.createCourse');
    //settings
    Route::get('/learner/settings', [LearnerController::class, 'settings'])->name('learner.settings');
    Route::patch('/learner/settings', [LearnerController::class, 'updateSettings'])->name('learner.settings.update');

    Route::patch('/instructor/availability', [InstructorController::class, 'availability'])->name('instructor.availability');
    Route::patch('/instructor/bankInfo', [InstructorController::class, 'bankInfo'])->name('instructor.bankInfo');



    // Instructor Routes
    Route::get('/instructor/dashboard', [InstructorController::class, 'dashboard'])->name('instructor.dashboard');
});
