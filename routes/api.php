<?php

use App\Http\Controllers\Auth\RegisterController;

use Illuminate\Support\Facades\Route;

// Authentication Routes
Route::post('/register', [RegisterController::class, 'register']);


// TODO: Friend - Add LoginController logic for /login
