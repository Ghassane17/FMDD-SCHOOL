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

        $learner = Learner::with('user')->findOrFail($learnerId);
        $course = Course::findOrFail($courseId);

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

        // Generate PDF
        $pdf = Pdf::loadView('certificates.certificate', [
            'certificate' => $certificate->load(['learner.user', 'course'])
        ]);

        // Set PDF options
        $pdf->setPaper('a4', 'landscape');
        $pdf->setOptions([
            'isHtml5ParserEnabled' => true,
            'isRemoteEnabled' => true,
            'dpi' => 150,
            'defaultFont' => 'sans-serif'
        ]);

        // Generate filename and path
        $filename = "certificate_{$certificateCode}.pdf";
        $path = 'certificates/' . $filename;

        // Store PDF
        Storage::put('public/' . $path, $pdf->output());

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

            // Define the file path
            $filePath = 'public/certificates/' . $certificate->certificate_code . '.pdf';

            // Generate the PDF if it doesn't exist
            if (!Storage::exists($filePath)) {
                $pdf = Pdf::loadView('certificates.template', [
                    'certificate' => $certificate,
                    'learner' => $certificate->learner,
                    'course' => $certificate->course,
                    'date' => $certificate->created_at->format('F d, Y')
                ]);

                // Set PDF options for single page and encoding
                $pdf->setPaper('a4', 'landscape')
                    ->setOption('margin-top', 0)
                    ->setOption('margin-right', 0)
                    ->setOption('margin-bottom', 0)
                    ->setOption('margin-left', 0)
                    ->setOption('page-size', 'A4')
                    ->setOption('orientation', 'landscape')
                    ->setOption('encoding', 'UTF-8')
                    ->setOption('enable-local-file-access', true);

                // Save the PDF to public storage
                Storage::put($filePath, $pdf->output());
            }

            // Return the file for download
            return Storage::download(
                $filePath,
                "certificate-{$certificate->certificate_code}.pdf",
                ['Content-Type' => 'application/pdf']
            );
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
                'learner_name' => $certificate->learner->user->name,
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
