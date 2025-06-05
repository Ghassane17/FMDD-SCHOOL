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
            $resources = $this->getCourseResources($courseId);
            $allModules = $this->getAllCourseModules($course);

            // Get course progress from pivot table
            $courseProgress = $course->learners()->find($learner->id)->pivot->progress ?? 0;

            // If progress is 0 (new enrollment), ensure all modules are marked as not completed
            if ($courseProgress === 0) {
                Log::info('New enrollment detected, resetting module completion status', [
                    'course_id' => $courseId,
                    'learner_id' => $learner->id
                ]);
                $course->modules()->update(['is_completed' => false]);
                $allModules = collect($allModules)->map(function ($module) {
                    return array_merge($module, ['is_completed' => false]);
                })->toArray();
            }

            Log::info('Successfully retrieved module data', [
                'course_id' => $courseId,
                'module_id' => $module->id,
                'user_id' => Auth::id(),
                'progress' => $courseProgress
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
                        ],
                        'exam' => $course->exam ? ['id' => $course->exam->id] : null
                    ],
                    'currentModule' => $this->formatModuleData($module, $quizQuestions, $resources),
                    'modules' => $allModules,
                ],
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
    }    /**
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
        $learner = Learner::where('user_id', Auth::id())->first();

        return $course->modules()
            ->orderBy('order')
            ->get(['id', 'title', 'type', 'order', 'duration', 'is_completed'])
            ->map(function ($module) use ($learner) {
                return [
                    'id' => $module->id,
                    'title' => $module->title,
                    'type' => $module->type,
                    'order' => $module->order,
                    'duration' => $module->duration,
                    'is_completed' => $module->is_completed
                ];
            })
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
            'is_completed' => $module->is_completed,
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

    public function markModuleAsCompleted($courseId, $moduleId): JsonResponse
    {
        try {
            Log::info('Backend: Attempting to mark module as completed', [
                'course_id' => $courseId,
                'module_id' => $moduleId,
                'user_id' => Auth::id()
            ]);

            // Check authentication
            if (!Auth::check()) {
                Log::warning('Backend: Unauthenticated user trying to mark module as completed');
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required'
                ], 401);
            }

            // Check if user is a learner
            $learner = Learner::where('user_id', Auth::id())->first();
            if (!$learner) {
                Log::warning('Backend: User is not a learner', ['user_id' => Auth::id()]);
                return response()->json([
                    'success' => false,
                    'message' => 'User must be registered as a learner'
                ], 403);
            }

            // Check if user is enrolled in the course
            $isEnrolled = $learner->courses()->where('course_id', $courseId)->exists();
            if (!$isEnrolled) {
                Log::warning('Backend: User not enrolled in course', [
                    'user_id' => Auth::id(),
                    'course_id' => $courseId,
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'You are not enrolled in this course'
                ], 403);
            }

            // Find the module
            $module = Module::where('id', $moduleId)
                ->where('course_id', $courseId)
                ->first();

            if (!$module) {
                Log::warning('Backend: Module not found', [
                    'course_id' => $courseId,
                    'module_id' => $moduleId
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Module not found'
                ], 404);
            }

            // Check if module is already completed
            if ($module->is_completed) {
                Log::info('Backend: Module already completed', [
                    'module_id' => $moduleId,
                    'course_id' => $courseId
                ]);
                return response()->json([
                    'success' => true,
                    'message' => 'Module is already completed',
                    'data' => [
                        'module_id' => $moduleId,
                        'is_completed' => true
                    ]
                ]);
            }

            // Mark module as completed
            $module->is_completed = true;
            $saved = $module->save();

            if (!$saved) {
                Log::error('Backend: Failed to save module completion status', [
                    'module_id' => $moduleId,
                    'course_id' => $courseId
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to update module completion status'
                ], 500);
            }

            // Update course progress
            $totalModules = $module->course->modules()->count();
            $completedModules = $module->course->modules()->where('is_completed', true)->count();
            $progress = ($completedModules / $totalModules) * 100;

            Log::info('Backend: Progress calculation details', [
                'total_modules' => $totalModules,
                'completed_modules' => $completedModules,
                'calculated_progress' => $progress
            ]);

            // Update course_learner pivot table
            $pivotUpdate = $learner->courses()->updateExistingPivot($courseId, ['progress' => $progress]);

            Log::info('Backend: Pivot table update result', [
                'pivot_update_success' => $pivotUpdate,
                'course_id' => $courseId,
                'learner_id' => $learner->id,
                'progress' => $progress
            ]);

            // Verify the update
            $updatedProgress = $learner->courses()->where('course_id', $courseId)->first()->pivot->progress;
            Log::info('Backend: Verified progress after update', [
                'expected_progress' => $progress,
                'actual_progress' => $updatedProgress
            ]);

            Log::info('Backend: Successfully marked module as completed', [
                'course_id' => $courseId,
                'module_id' => $moduleId,
                'user_id' => Auth::id(),
                'progress' => $progress
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'module_id' => $moduleId,
                    'is_completed' => true,
                    'course_progress' => $progress
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Backend: Failed to mark module as completed', [
                'course_id' => $courseId,
                'module_id' => $moduleId,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to mark module as completed: ' . $e->getMessage()
            ], 500);
        }
    }
}
