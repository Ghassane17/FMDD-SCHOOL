<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use App\Models\Course;
use App\Models\Learner;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CertificateController extends Controller
{
    public static function issueCertificate($learnerId, $courseId)
    {
        // Prevent duplicates
        if (Certificate::where('learner_id', $learnerId)->where('course_id', $courseId)->exists()) {
            return null;
        }

        // Load learner with user relationship
        $learner = Learner::with(['user' => function ($query) {
            $query->select('id', 'username', 'email');
        }])->findOrFail($learnerId);

        // Load course with necessary fields
        $course = Course::select('id', 'title', 'description')->findOrFail($courseId);

        // Generate unique certificate code
        $certificateCode = strtoupper(Str::random(10));

        // Create certificate record first
        $certificate = Certificate::create([
            'learner_id' => $learnerId,
            'course_id' => $courseId,
            'issued_at' => now(),
            'certificate_code' => $certificateCode,
            'url_path' => '', // Will be updated after PDF generation
        ]);

        // Load the certificate with all necessary relationships
        $certificate = $certificate->load([
            'learner.user' => function ($query) {
                $query->select('id', 'username', 'email');
            },
            'course' => function ($query) {
                $query->select('id', 'title', 'description');
            }
        ]);

        // Generate PDF
        $pdf = Pdf::loadView('certificates.certificate', [
            'certificate' => $certificate
        ]);

        // Set PDF options
        $pdf->setPaper('a4', 'landscape');
        $pdf->setOptions([
            'isHtml5ParserEnabled' => true,
            'isRemoteEnabled' => true,
            'dpi' => 300,
            'defaultFont' => 'sans-serif',
            'margin-top' => 0,
            'margin-right' => 0,
            'margin-bottom' => 0,
            'margin-left' => 0,
            'page-size' => 'A4',
            'orientation' => 'landscape',
            'encoding' => 'UTF-8',
            'enable-local-file-access' => true
        ]);

        // Generate filename and path
        $filename = "certificate_{$certificateCode}.pdf";
        $path = 'certificates/' . $filename;

        // Store PDF
        Storage::put('private/' . $path, $pdf->output());

        // Update certificate with the path
        $certificate->update([
            'url_path' => '/storage/' . $path
        ]);

        return $certificate;
    }

    public function download($certificateId)
    {
        try {
            $certificate = Certificate::with(['course', 'learner.user'])->findOrFail($certificateId);

            // Check if the authenticated user is the owner of the certificate
            if (auth()->id() !== $certificate->learner->user_id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // Ensure issued_at is a Carbon instance
            if (is_string($certificate->issued_at)) {
                $certificate->issued_at = \Carbon\Carbon::parse($certificate->issued_at);
            }

            // Generate PDF
            $pdf = Pdf::loadView('certificates.certificate', [
                'certificate' => $certificate
            ]);

            // Simple PDF settings
            $pdf->setPaper('a4', 'landscape');
            $pdf->setOptions([
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled' => true,
                'defaultFont' => 'sans-serif'
            ]);

            // Return the PDF for download
            return $pdf->download("certificate-{$certificate->certificate_code}.pdf");
        } catch (\Exception $e) {
            \Log::error('Certificate download error: ' . $e->getMessage());
            return response()->json(['message' => 'Error downloading certificate'], 500);
        }
    }

    public function verify($certificateCode)
    {
        $certificate = Certificate::where('certificate_code', $certificateCode)
            ->with(['learner.user', 'course'])
            ->first();

        if (!$certificate) {
            return response()->json([
                'valid' => false,
                'message' => 'Invalid certificate code.'
            ], 404);
        }

        return response()->json([
            'valid' => true,
            'data' => [
                'learner_name' => $certificate->learner->user->username,
                'course_title' => $certificate->course->title,
                'issued_at' => $certificate->issued_at->format('F j, Y'),
                'certificate_code' => $certificate->certificate_code
            ]
        ]);
    }

    public function preview($certificateId)
    {
        $certificate = Certificate::with(['course', 'learner.user'])->findOrFail($certificateId);

        // Check if the authenticated user is the owner of the certificate
        if (auth()->id() !== $certificate->learner->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $pdf = Pdf::loadView('certificates.certificate', [
            'certificate' => $certificate,
            'learner' => $certificate->learner,
            'course' => $certificate->course
        ]);

        return $pdf->stream('certificate.pdf');
    }
}
