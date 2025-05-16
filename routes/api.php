<?php

use App\Http\Controllers\Auth\RegisterController;

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\LearnerController ;
use App\Http\Controllers\InstructorController;  // ← add this

use Illuminate\Support\Facades\Route;

// Authentication Routes
Route::post('/register', [RegisterController::class, 'register']);
Route::post('/login',   [LoginController::class, 'login']);
/*Route::post('/logout',  [LoginController::class, 'logout'])->middleware('auth:sanctum');*/


// Learner dashboard Route
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/learner/dashboard', [LearnerController::class, 'dashboard']);

    // Instructor dashboard
    Route::get('/instructor/dashboard', [InstructorController::class, 'dashboard']);
});
// TODO: get the id after authentication to show each individual his actual real data
