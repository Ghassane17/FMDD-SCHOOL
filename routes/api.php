<?php

use App\Http\Controllers\CommentController;
use App\Http\Controllers\CourseInstructorController;
use App\Http\Controllers\CourseResourceController;
use App\Http\Controllers\PublicController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\LearnerController;
use App\Http\Controllers\InstructorController;

// Authentication Routes
Route::post('/register', [RegisterController::class, 'register'])->name('register');
Route::patch('/learner/profile', [LearnerController::class, 'profile'])->name('learner.profile');
Route::patch('/instructor/profile', [InstructorController::class, 'profile'])->name('instructor.profile');
Route::post('/login', [LoginController::class, 'login'])->name('login');
Route::post('/logout', [LoginController::class, 'logout'])->middleware('auth:sanctum')->name('logout');

Route::post('/contact', [PublicController::class, 'contact'])->name('contact');



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
    Route::get('/courses/{id}/{module}', [CourseResourceController::class, 'getModule'])
        ->where('id', '[0-9]+'); // Ensure {id} is numeric
    Route::post('/courses/{course}/comments', [CommentController::class, 'store']);
    Route::put('/courses/{course}', [CourseResourceController::class, 'updateCourseRating']);

    Route::post('/courses/{id}/enroll', [CourseController::class, 'enrollNow']);
    Route::delete('/courses/{course}/leave', [CourseController::class, 'leave']);


    // course creation
    Route::post('/createCourse', [CourseInstructorController::class, 'createCourse'])->name('instructor.createCourse');
    //settings
    Route::get('/learner/settings', [LearnerController::class, 'settings'])->name('learner.settings');



    // Instructor Routes
    Route::get('/instructor/dashboard', [InstructorController::class, 'dashboard'])->name('instructor.dashboard');
    Route::patch('/instructor/availability', [InstructorController::class, 'updateAvailability'])->name('instructor.updateAvailability');
    Route::patch('/instructor/bankInfo', [InstructorController::class, 'updateBankInfo'])->name('instructor.updateBankInfo');
    
});
