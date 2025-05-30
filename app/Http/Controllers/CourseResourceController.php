<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Learner;
use App\Models\Module;
use App\Models\QuizQuestion;
use App\Models\Resource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class CourseResourceController extends Controller
{
    /**
     * Get a module with its resources for a specific course
     */
    public function getModule($courseId, $moduleParam = null): JsonResponse
    {
        $courseId = (int) $courseId;
        try {
            Log::info('Getting module for course', [
                'course_id' => $courseId,
                'module_param' => $moduleParam,
                'user_id' => Auth::id(),
            ]);

            $course = Course::find($courseId);
            if (!$course) {
                Log::warning('Course not found', ['course_id' => $courseId]);
                return response()->json([
                    'success' => false,
                    'message' => "Course with ID {$courseId} not found",
                ], 404);
            }

            if (!Auth::check()) {
                Log::warning('Unauthenticated user trying to access course', ['course_id' => $courseId]);
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required',
                ], 401);
            }

            $learner = Learner::where('user_id', Auth::id())->first();
            if (!$learner) {
                Log::warning('User is not a learner', ['user_id' => Auth::id()]);
                return response()->json([
                    'success' => false,
                    'message' => 'User must be registered as a learner',
                ], 403);
            }

            $isEnrolled = $learner->courses()->where('course_id', $courseId)->exists();
            if (!$isEnrolled) {
                Log::warning('User not enrolled in course', [
                    'user_id' => Auth::id(),
                    'course_id' => $courseId,
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'You are not enrolled in this course',
                ], 403);
            }

            $module = $this->getTargetModule($course, $moduleParam);
            if (!$module) {
                Log::warning('No module found for course', [
                    'course_id' => $courseId,
                    'module_param' => $moduleParam,
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'No module found for this course',
                ], 404);
            }

            // Get all necessary data
            $quizQuestions = $this->getQuizQuestions($module);
            $resources = $this->getCourseResources($courseId);
            $allModules = $this->getAllCourseModules($course);
            $courseProgress = $course->learners()->find($learner->id)->pivot->progress ?? 0;

            Log::info('Successfully retrieved module data', [
                'course_id' => $courseId,
                'module_id' => $module->id,
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'course' => [
                        'id' => $course->id,
                        'title' => $course->title,
                        'description' => $course->description,
                        'course_thumbnail' => $course->course_thumbnail,
                        'level' => $course->level,
                        'rating' => $course->rating,
                        'progress' => $courseProgress,
                        'instructor' => [
                            'id' => $course->instructor->id,
                            'name' => $course->instructor->user->username,
                            'avatar' => $course->instructor->user->avatar,
                            'bio' => $course->instructor->user->bio,
                            'skills' => $course->instructor->skills,
                            'certifications' => $course->instructor->certifications,
                            'languages' => $course->instructor->languages
                        ]
                    ],
                    'module' => $this->formatModuleData($module, $quizQuestions, $resources),
                    'modules' => $allModules,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Unexpected error in getModule', [
                'course_id' => $courseId,
                'module_param' => $moduleParam,
                'user_id' => Auth::id(),
                'error_message' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'An unexpected error occurred while loading the module',
            ], 500);
        }
    }

    /**
     * Get a specific resource for a course
     */
    public function show(Course $course, int $resourceId): JsonResponse
    {
        try {
            Log::info('Getting specific resource', [
                'course_id' => $course->id,
                'resource_id' => $resourceId,
                'user_id' => Auth::id()
            ]);

            // Check authentication
            if (!Auth::check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required'
                ], 401);
            }

            // Check enrollment
            $learner = Learner::where('user_id', Auth::id())->first();
            if (!$learner || !$learner->courses()->where('course_id', $course->id)->exists()) {
                Log::warning('User not enrolled trying to access resource', [
                    'user_id' => Auth::id(),
                    'course_id' => $course->id,
                    'resource_id' => $resourceId
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'You are not enrolled in this course'
                ], 403);
            }

            $resource = $course->resources()->find($resourceId);
            if (!$resource) {
                Log::warning('Resource not found', [
                    'course_id' => $course->id,
                    'resource_id' => $resourceId
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Resource not found'
                ], 404);
            }

            Log::info('Successfully retrieved resource', [
                'course_id' => $course->id,
                'resource_id' => $resourceId,
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'course' => $this->formatCourseData($course),
                    'resource' => $this->formatResourceData($resource)
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error in show method', [
                'course_id' => $course->id,
                'resource_id' => $resourceId,
                'user_id' => Auth::id(),
                'error_message' => $e->getMessage(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while retrieving the resource'
            ], 500);
        }
    }

    /**
     * Determine which module to fetch based on parameter
     */
    private function getTargetModule(Course $course, $moduleParam): ?Module
    {
        // If specific module ID provided
        if ($moduleParam && $moduleParam !== 'undefined') {
            $moduleId = filter_var($moduleParam, FILTER_VALIDATE_INT);
            if ($moduleId) {
                return $course->modules()->find($moduleId);
            }
        }

        // Return first module by order
        return $course->modules()->orderBy('order')->first();
    }

    /**
     * Get quiz questions for a quiz module
     */
    protected function getQuizQuestions(Module $module)
    {
        return QuizQuestion::where('module_id', $module->id)->get()->map(function ($question) {
            // The options field is already cast to an array by Laravel
            $options = $question->options;

            if (!is_array($options)) {
                Log::warning('Invalid options format for quiz question', [
                    'question_id' => $question->id,
                    'options' => $question->options,
                ]);
                $options = [];
            }

            return [
                'id' => $question->id,
                'question' => $question->question,
                'options' => array_map(function ($opt, $index) {
                    return [
                        'id' => $index,
                        'text' => is_array($opt) ? $opt['text'] : $opt,
                    ];
                }, $options, array_keys($options)),
                'correct_option' => $question->correct_option,
            ];
        })->toArray();
    }

    /**
     * Get all resources for a course
     */
    private function getCourseResources(int $courseId): array
    {
        return Resource::where('course_id', $courseId)
            ->get()
            ->map(function ($resource) {
                return $this->formatResourceData($resource);
            })
            ->toArray();
    }

    /**
     * Get all modules for a course
     */
    private function getAllCourseModules(Course $course): array
    {
        return $course->modules()
            ->orderBy('order')
            ->get(['id', 'title', 'type', 'order', 'duration'])
            ->toArray();
    }

    /**
     * Format module data for response
     */
    private function formatModuleData(Module $module, ?array $quizQuestions, array $resources): array
    {
        return [
            'id' => $module->id,
            'title' => $module->title,
            'type' => $module->type,
            'text_content' => $module->text_content,
            'file_path' => $module->file_path ? $this->getStorageUrl($module->file_path) : null,
            'order' => $module->order,
            'duration' => $module->duration,
            'quiz_questions' => $quizQuestions,
            'resources' => $resources
        ];
    }

    /**
     * Format course data for response
     */
    private function formatCourseData(Course $course): array
    {
        return [
            'id' => $course->id,
            'title' => $course->title,
            'description' => $course->description,
            'thumbnail' => $course->course_thumbnail ? $this->getStorageUrl($course->course_thumbnail) : null,
            'level' => $course->level,
            'duration_hours' => $course->duration_hours,
            'category' => $course->category,
            'rating' => $course->rating
        ];
    }

    /**
     * Format resource data for response
     */
    private function formatResourceData(Resource $resource): array
    {
        return [
            'id' => $resource->id,
            'name' => $resource->name,
            'type' => $resource->type,
            'url' => $resource->url && !str_starts_with($resource->url, 'http')
                ? $this->getStorageUrl($resource->url)
                : $resource->url
        ];
    }

    /**
     * Get proper storage URL for files
     */
    private function getStorageUrl(string $path): string
    {
        // Handle absolute paths (your current issue)
        if (str_contains($path, 'C:\\') || str_contains($path, '/storage/app/')) {
            // Extract relative path from absolute path
            if (preg_match('/storage\/app\/public\/(.+)/', $path, $matches)) {
                return Storage::url($matches[1]);
            }
            if (preg_match('/public\/(.+)/', $path, $matches)) {
                return Storage::url($matches[1]);
            }
        }

        return Storage::url($path);
    }

    public function updateCourseRating(Course $course) {}
}
