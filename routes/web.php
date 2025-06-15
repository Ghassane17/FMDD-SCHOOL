<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CertificateController;
use Illuminate\Support\Facades\Storage;

Route::get('/', function () {
    return view('welcome');
});

// Certificate routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/certificates/{certificate}/download', [CertificateController::class, 'download'])->name('certificates.download');
    Route::get('/certificates/{certificate}/preview', [CertificateController::class, 'preview'])->name('certificates.preview');
    Route::get('/certificates/verify/{code}', [CertificateController::class, 'verify'])->name('certificates.verify');
});

// Secure route for serving private certificates
Route::get('/certificates/private/{filename}', function ($filename) {
    $path = 'certificates/' . $filename;

    if (!Storage::disk('private')->exists($path)) {
        abort(404);
    }

    return Storage::disk('private')->response($path);
})->middleware(['auth', 'verified'])->name('certificates.private');
