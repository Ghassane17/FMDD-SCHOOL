<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use App\Models\Resource;
use App\Models\Course;
use App\Models\Learner;
use Illuminate\Support\Facades\Log;

class DownloadController extends Controller
{
    /**
     * Download a resource file by resource ID
     */
    public function downloadResource(Request $request)
    {
        try {
            $resourceId = $request->query('resource_id');
            if (!$resourceId) {
                return response()->json(['error' => 'Resource ID required'], 400);
            }

            // Validate user authentication
            if (!Auth::check()) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Find the resource
            $resource = Resource::find($resourceId);
            if (!$resource) {
                Log::error('Resource not found', ['resource_id' => $resourceId]);
                return response()->json(['error' => 'Resource not found'], 404);
            }

            // Check if user is enrolled in the course
            $learner = Learner::where('user_id', Auth::id())->first();
            if (!$learner) {
                Log::warning('User is not a learner', ['user_id' => Auth::id()]);
                return response()->json(['error' => 'User must be registered as a learner'], 403);
            }

            $isEnrolled = $learner->courses()->where('course_id', $resource->course_id)->exists();
            if (!$isEnrolled) {
                Log::warning('User not enrolled in course', [
                    'user_id' => Auth::id(),
                    'course_id' => $resource->course_id,
                    'resource_id' => $resourceId
                ]);
                return response()->json(['error' => "vous n'etes pas inscris dans ce cours"], 403);
            }

            // Handle external URLs (e.g., links)
            if ($resource->type === 'link' && filter_var($resource->url, FILTER_VALIDATE_URL)) {
                Log::info('Redirecting to external resource link', [
                    'resource_id' => $resourceId,
                    'url' => $resource->url
                ]);
                return response()->json(['redirect_url' => $resource->url], 200);
            }

            // Handle local files
            if (!$resource->url) {
                Log::error('Resource has no valid URL', ['resource_id' => $resourceId]);
                return response()->json(['error' => 'Invalid resource URL'], 400);
            }

            $storagePath = ltrim($resource->url, '/');
            $storagePath = preg_replace('/^storage\//', '', $storagePath);

            // Security check - prevent directory traversal
            if (strpos($storagePath, '..') !== false) {
                return response()->json(['error' => 'Invalid file path'], 400);
            }

            // Check if file is within allowed paths
            if (!$this->isAllowedPath($storagePath)) {
                return response()->json(['error' => 'Access denied'], 403);
            }

            Log::info('Resource download attempt', [
                'resource_id' => $resourceId,
                'storage_path' => $storagePath,
                'user_id' => Auth::id()
            ]);

            // Check if file exists
            if (!Storage::disk('public')->exists($storagePath)) {
                Log::error('Resource file not found', [
                    'resource_id' => $resourceId,
                    'path' => $storagePath
                ]);
                return response()->json(['error' => 'File not found'], 404);
            }

            $fullPath = Storage::disk('public')->path($storagePath);
            $fileName = $resource->name ?: $this->getOriginalFileName($storagePath);
            $mimeType = Storage::disk('public')->mimeType($storagePath);

            return response()->streamDownload(function () use ($fullPath) {
                $stream = fopen($fullPath, 'rb');
                fpassthru($stream);
                fclose($stream);
            }, $fileName, [
                'Content-Type' => $mimeType,
                'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0'
            ]);
        } catch (\Exception $e) {
            Log::error('Resource download error', [
                'resource_id' => $request->query('resource_id'),
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Download failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Check if the file path is within allowed directories
     */
    private function isAllowedPath($path)
    {
        $allowedPaths = ['courses/', 'resources/', 'uploads/', 'documents/'];
        foreach ($allowedPaths as $allowedPath) {
            if (strpos($path, $allowedPath) === 0) {
                return true;
            }
        }
        return false;
    }

    /**
     * Extract a meaningful filename from the storage path
     */
    private function getOriginalFileName($storagePath)
    {
        $fileName = basename($storagePath);
        if (strlen($fileName) > 40 && strpos($fileName, '.') !== false) {
            $extension = pathinfo($fileName, PATHINFO_EXTENSION);
            switch ($extension) {
                case 'pdf':
                    return 'document.pdf';
                case 'jpg':
                case 'jpeg':
                    return 'image.jpg';
                case 'png':
                    return 'image.png';
                case 'mp4':
                    return 'video.mp4';
                case 'docx':
                    return 'document.docx';
                case 'xlsx':
                    return 'spreadsheet.xlsx';
                default:
                    return 'file.' . $extension;
            }
        }
        return $fileName;
    }
}
