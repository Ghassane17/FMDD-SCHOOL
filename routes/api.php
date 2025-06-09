<?php

use App\Http\Controllers\CommentController;
use App\Http\Controllers\CourseInstructorController;
use App\Http\Controllers\CourseResourceController;
use App\Http\Controllers\DownloadController;
use App\Http\Controllers\ExamController;
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
Route::post('/instructor/profile', [InstructorController::class, 'profile'])->name('instructor.profile');
Route::post('/login', [LoginController::class, 'login'])->name('login');
Route::post('/logout', [LoginController::class, 'logout'])->middleware('auth:sanctum')->name('logout');

Route::post('/contact', [PublicController::class, 'contact'])->name('contact');



// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    //Account completion
    Route::patch('/learner/profile', [LearnerController::class, 'profile'])->name('learner.profile');
    Route::post('/instructor/profile', [InstructorController::class, 'profile'])->name('instructor.profile');
    Route::patch('/instructor/completeRegister', [InstructorController::class, 'completeRegister'])->name('instructor.completeRegister');
    //Dashboard learner
    Route::get('/learner', [LearnerController::class, 'dashboard'])->name('learner.dashboard');


    //courses routes
    Route::get('/learner/all-courses', [CourseController::class, 'getAllCourses'])->name('learner.all-courses');
    Route::get('/learner/all-enrolled-courses', [CourseController::class, 'getEnrolledCourses'])->name('learner.enrolled-courses');
    Route::get('/courses/{id}', [CourseController::class, 'getCourseDetails']);

    // Course module routes - single endpoint for all course/module data
    Route::get('/learner/courses/{course}/{module?}', [CourseResourceController::class, 'getModule'])
        ->where('course', '[0-9]+');

    // Mark module as completed
    Route::post('/learner/courses/{course}/modules/{module}/complete', [CourseResourceController::class, 'markModuleAsCompleted'])
        ->where(['course' => '[0-9]+', 'module' => '[0-9]+']);

    Route::post('/courses/{course}/comments', [CommentController::class, 'store']);
    Route::put('/courses/{course}', [CourseResourceController::class, 'updateCourseRating']);
    Route::post('/courses/{id}/enroll', [CourseController::class, 'enrollNow']);
    Route::delete('/courses/{course}/leave', [CourseController::class, 'leave']);


    // Exam routes (specific)
    Route::get('/courses/{course}/exam', [ExamController::class, 'getExam']);
    Route::post('/courses/{course}/exam', [ExamController::class, 'submitExam']);


    // course creation
    Route::post('/createCourse', [CourseInstructorController::class, 'createCourse'])->name('instructor.createCourse');
    //settings
    Route::get('/learner/settings', [LearnerController::class, 'settings'])->name('learner.settings');
    Route::patch('/learner/personal-info', [LearnerController::class, 'updatePersonalInfo'])->name('learner.personal-info');
    Route::patch('/learner/password', [LearnerController::class, 'updatePassword'])->name('learner.password');
    Route::patch('/learner/additional-info', [LearnerController::class, 'updateAdditionalInfo'])->name('learner.additional-info');
    Route::patch('/learner/notifications', [LearnerController::class, 'updateNotifications'])->name('learner.notifications');



    // Instructor Routes
    Route::get('/instructor/dashboard', [InstructorController::class, 'dashboard'])->name('instructor.dashboard');
    Route::patch('/instructor/availability', [InstructorController::class, 'updateAvailability'])->name('instructor.updateAvailability');
    Route::patch('/instructor/bankInfo', [InstructorController::class, 'updateBankInfo'])->name('instructor.updateBankInfo');
    Route::get('/instructor/statistics', [InstructorController::class, 'getInstructorStatistics'])->name('instructor.getInstructorStatistics');
    Route::patch('/instructor/skills', [InstructorController::class, 'updateInstructorSkills'])->name('instructor.updateInstructorSkills');
    Route::patch('/instructor/languages', [InstructorController::class, 'updateInstructorLanguages'])->name('instructor.updateInstructorLanguages');
    Route::patch('/instructor/certifications', [InstructorController::class, 'updateInstructorCertifications'])->name('instructor.updateInstructorCertifications');

    // Instructor Courses Routes
    Route::get('/instructor/courses', [CourseInstructorController::class, 'getInstructorCourses'])->name('instructor.getInstructorCourses');
    Route::delete('/instructor/courses/{courseId}', [CourseInstructorController::class, 'deleteCourse'])->name('instructor.deleteCourse');
    Route::get('/instructor/courses/{courseId}', [CourseInstructorController::class, 'getCourseById'])->name('instructor.getCourseById');
    Route::get('/instructor/comments', [InstructorController::class, 'getInstructorComments'])->name('instructor.getInstructorComments');
    Route::get('/instructor/courses/{courseId}/content', [CourseInstructorController::class, 'getAllContentCourse'])->name('instructor.getAllContentCourse');


    // Download file by path
    Route::get('/download-resource', [DownloadController::class, 'downloadResource']);
});
