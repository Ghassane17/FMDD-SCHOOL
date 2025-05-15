<?php

use App\Http\Controllers\Auth\RegisterController;

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\LearnerController ;

use Illuminate\Support\Facades\Route;

// Authentication Routes
Route::post('/login',   [LoginController::class, 'login']);
Route::post('/register', [RegisterController::class, 'register']);

Route::post('/logout',  [LoginController::class, 'logout'])->middleware('auth:sanctum');


// Learner dashboard Route
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/learner', [LearnerController::class, 'dashboard']);
    Route::get('/learner/all-enrolled-courses' , [LearnerController::class,'allEnrolledCourses'] );
   Route::get('/learner/settings' , [LearnerController::class,'settings'] );
   Route::patch('/learner/settings' , [LearnerController::class,'updateSettings'] );
    Route::post('/learner/contact', [LearnerController::class, 'contact'])->name('learner.contact');
});
// TODO: get the id after authentication to show each individual his actual real data
