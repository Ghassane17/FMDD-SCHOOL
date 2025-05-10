<?php

use App\Http\Controllers\Auth\RegisterController;

use App\Http\Controllers\Auth\LoginController;

use Illuminate\Support\Facades\Route;

// Authentication Routes
Route::post('/register', [RegisterController::class, 'register']);

Route::post('login',   [LoginController::class, 'login']);
Route::post('logout',  [LoginController::class, 'logout'])->middleware('auth:sanctum');

// TODO: Friend - Add LoginController logic for /login
