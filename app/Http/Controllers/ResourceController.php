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

class ResourceController extends Controller
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

            // Get the target module
            $module = $this->getTargetModule($course, $moduleParam);
            if (!$module) {
                Log::warning('No module found for course', [
                    'course_id' => $courseId,
                    'module_param' => $moduleParam,
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'No modules available for this course or specified module not found',
                ], 404);
            }

            // Get all necessary data
            $quizQuestions = $this->getQuizQuestions($module);
            $courseResources = $this->getCourseResources($courseId);
            $allModules = $this->getAllCourseModules($course);

            // Get course progress from pivot table
            $courseProgress = $learner->courses()->where('course_id', $courseId)->first()->pivot->progress ?? 0;

            // Format the response
            $formattedModule = $this->formatModuleData($module, $learner->courses()->where('course_id', $courseId)->first()->pivot, $courseProgress);

            Log::info('Successfully retrieved module data', [
                'course_id' => $courseId,
                'module_id' => $module->id,
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'course' => $this->formatCourseData($course),
                    'module' => $formattedModule,
                    'all_modules' => $allModules,
                    'progress' => $courseProgress,
                    'course_resources' => $courseResources
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Unexpected error in getModule', [
                'course_id' => $courseId,
                'module_param' => $moduleParam,
                'user_id' => Auth::id(),
                'error_message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
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
                // Ensure module belongs to the course
                $module = $course->modules()->where('id', $moduleId)->first();
                if ($module) {
                    return $module;
                }
                Log::warning('Module ID does not belong to course', [
                    'course_id' => $course->id,
                    'module_id' => $moduleId,
                ]);
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
            // Log raw data for debugging
            Log::info('Raw quiz question data', [
                'question_id' => $question->id,
                'options' => $question->options,
                'correct_option' => $question->correct_option,
                'options_type' => gettype($question->options),
            ]);

            // Initialize options
            $options = $question->options;

            // Check if options is a string (possible double-encoded JSON)
            if (is_string($options)) {
                // Attempt to decode the string
                $decodedOptions = json_decode($options, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decodedOptions)) {
                    $options = $decodedOptions;
                    Log::info('Successfully decoded string options', [
                        'question_id' => $question->id,
                        'decoded_options' => $options,
                    ]);
                } else {
                    Log::warning('Failed to decode options string', [
                        'question_id' => $question->id,
                        'options' => $options,
                        'json_error' => json_last_error_msg(),
                    ]);
                    $options = [];
                }
            } elseif (!is_array($options)) {
                // If options is neither a string nor an array, log warning and set to empty array
                Log::warning('Invalid options format for quiz question', [
                    'question_id' => $question->id,
                    'options' => $options,
                    'options_type' => gettype($options),
                ]);
                $options = [];
            }

            // Map options to the required format
            $formattedOptions = array_map(function ($opt, $index) {
                return [
                    'id' => $index,
                    'text' => is_array($opt) ? ($opt['text'] ?? $opt) : ($opt ?? 'Invalid option'),
                ];
            }, $options, array_keys($options));

            return [
                'id' => $question->id,
                'question' => $question->question,
                'options' => $formattedOptions,
                'correct_option' => $question->correct_option ?? -1, // Fallback if null
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
    private function getAllCourseModules($course)
    {
        $user = Auth::user();
        $learner = Learner::where('user_id', $user->id)->first();

        // Get the learner's course pivot data
        $coursePivot = $course->learners()
            ->where('learner_id', $learner->id)
            ->first()
            ->pivot;

        // Get completed modules array from pivot, decode JSON if it's a string
        $completedModules = $coursePivot->completed_modules;
        if (is_string($completedModules)) {
            $completedModules = json_decode($completedModules, true) ?? [];
        }

        return $course->modules()
            ->orderBy('order')
            ->get()
            ->map(function ($module) use ($completedModules) {
                return [
                    'id' => $module->id,
                    'title' => $module->title,
                    'type' => $module->type,
                    'order' => $module->order,
                    'duration' => $module->duration,
                    'is_completed' => in_array($module->id, $completedModules)
                ];
            });
    }

    /**
     * Format module data for response
     */
    private function formatModuleData($module, $coursePivot, $userProgress)
    {
        // Ensure completed_modules is an array
        $completedModules = $coursePivot->completed_modules ?? '[]';
        if (is_string($completedModules)) {
            $completedModules = json_decode($completedModules, true) ?? [];
        }

        // Format file path for different content types
        $fileUrl = null;
        if ($module->file_path) {
            $fileUrl = $this->getStorageUrl($module->file_path);
        }

        // Get quiz questions if module is quiz type
        $quizQuestions = [];
        if ($module->type === 'quiz') {
            $quizQuestions = QuizQuestion::where('module_id', $module->id)
                ->get()
                ->map(function ($question) {
                    // Ensure options is an array
                    $options = is_string($question->options)
                        ? json_decode($question->options, true)
                        : $question->options;

                    // Format options to match frontend expectations
                    $formattedOptions = array_map(function ($option, $index) {
                        return [
                            'id' => $index,
                            'text' => is_array($option) ? ($option['text'] ?? $option) : $option
                        ];
                    }, $options, array_keys($options));

                    return [
                        'id' => $question->id,
                        'question' => $question->question,
                        'options' => $formattedOptions,
                        'correct_option' => (int)$question->correct_option
                    ];
                })
                ->toArray();
        }

        return [
            'id' => $module->id,
            'title' => $module->title,
            'type' => $module->type,
            'text_content' => $module->text_content,
            'file_path' => $fileUrl,
            'order' => $module->order,
            'duration' => $module->duration,
            'is_completed' => in_array($module->id, $completedModules),
            'resources' => $module->resources->map(function ($resource) {
                return [
                    'id' => $resource->id,
                    'name' => $resource->name,
                    'title' => $resource->title,
                    'type' => $resource->type,
                    'content' => $resource->content,
                    'order' => $resource->order,
                    'url' => $resource->url && !str_starts_with($resource->url, 'http')
                        ? $this->getStorageUrl($resource->url)
                        : $resource->url,
                    'created_at' => $resource->created_at,
                    'updated_at' => $resource->updated_at
                ];
            }),
            'quiz' => $module->type === 'quiz' ? [
                'id' => $module->id,
                'title' => $module->title,
                'questions' => $quizQuestions,
                'is_completed' => $userProgress['quiz_progress'][$module->id] ?? false,
                'score' => $userProgress['quiz_scores'][$module->id] ?? null
            ] : null,
            'created_at' => $module->created_at,
            'updated_at' => $module->updated_at
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
        // If path already starts with /storage, return it as is
        if (str_starts_with($path, '/storage/')) {
            return $path;
        }

        // Handle absolute paths
        if (str_contains($path, 'C:\\') || str_contains($path, '/storage/app/')) {
            // Extract relative path from absolute path
            if (preg_match('/storage\/app\/public\/(.+)/', $path, $matches)) {
                return Storage::url($matches[1]);
            }
            if (preg_match('/public\/(.+)/', $path, $matches)) {
                return Storage::url($matches[1]);
            }
        }

        // For paths that don't start with /storage/ and aren't absolute paths
        return Storage::url($path);
    }

    public function updateCourseRating(Course $course) {}

    public function markModuleAsCompleted($courseId, $moduleId)
    {
        try {
            Log::info('Attempting to mark module as completed', [
                'course_id' => $courseId,
                'module_id' => $moduleId,
                'user_id' => Auth::id()
            ]);

            $user = Auth::user();
            if (!$user) {
                Log::error('No authenticated user for module completion');
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            if ($user->role !== 'learner') {
                Log::warning('Unauthorized role for module completion', ['user_id' => $user->id, 'role' => $user->role]);
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $learner = Learner::where('user_id', $user->id)->first();
            if (!$learner) {
                Log::error('Learner profile not found', ['user_id' => $user->id]);
                return response()->json(['message' => 'Learner profile not found'], 404);
            }

            // Check if enrolled in course
            $coursePivot = $learner->courses()
                ->where('course_id', $courseId)
                ->first();

            if (!$coursePivot) {
                Log::error('Not enrolled in course', ['learner_id' => $learner->id, 'course_id' => $courseId]);
                return response()->json(['message' => 'Not enrolled in this course'], 403);
            }

            // Get the module
            $module = Module::where('course_id', $courseId)
                ->where('id', $moduleId)
                ->first();

            if (!$module) {
                Log::error('Module not found', ['course_id' => $courseId, 'module_id' => $moduleId]);
                return response()->json(['message' => 'Module not found'], 404);
            }

            // Get current completed modules
            $completedModules = $coursePivot->pivot->completed_modules;
            if (is_string($completedModules)) {
                $completedModules = json_decode($completedModules, true) ?? [];
            }

            // Check if already completed
            if (in_array($moduleId, $completedModules)) {
                Log::info('Module already completed', [
                    'learner_id' => $learner->id,
                    'course_id' => $courseId,
                    'module_id' => $moduleId
                ]);
                return response()->json([
                    'message' => 'Module already completed',
                    'progress' => $coursePivot->pivot->progress
                ]);
            }

            // Add module to completed modules
            $completedModules[] = $moduleId;

            // Calculate new progress
            $totalModules = Module::where('course_id', $courseId)->count();
            $progress = round((count($completedModules) / $totalModules) * 100);

            // Update pivot table
            $learner->courses()->updateExistingPivot($courseId, [
                'progress' => $progress,
                'completed_modules' => json_encode($completedModules),
                'last_accessed' => now()
            ]);

            Log::info('Successfully marked module as completed', [
                'learner_id' => $learner->id,
                'course_id' => $courseId,
                'module_id' => $moduleId,
                'new_progress' => $progress
            ]);

            return response()->json([
                'message' => 'Module marked as completed',
                'progress' => $progress
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to mark module as completed', [
                'course_id' => $courseId,
                'module_id' => $moduleId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Failed to mark module as completed'], 500);
        }
    }
}
