<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Instructor;
use App\Models\Module;
use App\Models\Resource;
use App\Models\QuizQuestion;
use App\Models\Exam;
use App\Models\ExamQuestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Http\Resources\CourseResource;

class CourseInstructorController extends Controller
{
    /**
     * Get all courses for the authenticated instructor
     */
    public function getInstructorCourses(Request $request)
    {
        try {
            $user = Auth::user();

            // Check if user is authenticated and is an instructor
            if (!$user || $user->role !== 'instructor') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // Get instructor profile
            $instructor = Instructor::where('user_id', $user->id)->first();
            if (!$instructor) {
                return response()->json(['message' => 'Instructor profile not found'], 404);
            }

            // Get all courses for this instructor with related data
            $courses = Course::with(['modules', 'learners'])
                ->where('instructor_id', $instructor->id)
                ->get()
                ->map(function ($course) {
                    return [
                        'id' => $course->id,
                        'title' => $course->title,
                        'description' => $course->description,
                        'course_thumbnail' => $course->course_thumbnail,
                        'level' => $course->level,
                        'rating' => $course->rating,
                        'is_published' => $course->is_published,
                        'duration_hours' => $course->duration_hours,
                        'students_count' => $course->learners->count(),
                        'modules_count' => $course->modules->count(),
                        'created_at' => $course->created_at,
                        'updated_at' => $course->updated_at
                    ];
                });

            return response()->json(['courses' => $courses], 200);

        } catch (\Exception $e) {
            Log::error('Error in getInstructorCourses', [
                'user_id' => $user->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }

    public function createCourse(Request $request)
    {
        // 1️⃣ Authorization
        $user = Auth::user();
        if (!$user || $user->role !== 'instructor') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $instructor = Instructor::where('user_id', $user->id)->first();
        if (!$instructor) {
            return response()->json(['message' => 'Instructor profile not found'], 404);
        }

        try {
            // Validate the request data
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'level' => 'required|string|in:beginner,intermediate,advanced',
                'course_thumbnail' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:5120',
                'category' => 'required|string|max:255',
                'duration_min' => 'nullable|integer|min:0',

                // Modules validation
                'modules' => 'nullable|array',
                'modules.*.title' => 'required|string|max:255',
                'modules.*.type' => 'required|in:text,pdf,image,video,quiz',
                'modules.*.content' => 'required_if:modules.*.type,text|string',
                'modules.*.file' => 'required_if:modules.*.type,pdf,image,video|nullable|file',
                'modules.*.order' => 'required|integer|min:0',

                // Module quiz validation
                'modules.*.questions' => 'required_if:modules.*.type,quiz|array',
                'modules.*.questions.*.question' => 'required_if:modules.*.type,quiz|string',
                'modules.*.questions.*.options' => 'required_if:modules.*.type,quiz|array',
                'modules.*.questions.*.correctAnswer' => 'required_if:modules.*.type,quiz|integer|min:0',

                // Exam validation
                'exam' => 'nullable|array',
                'exam.title' => 'required|string|max:255',
                'exam.instructions' => 'required|string',
                'exam.duration_min' => 'required|integer|min:0',
                'exam.passing_score' => 'required|integer|min:0|max:100',

                // Exam questions validation
                'exam.questions' => 'required_if:exam.type,quiz|array',
                'exam.questions.*.question' => 'required_if:exam.type,quiz|string',
                'exam.questions.*.options' => 'required_if:exam.type,quiz|array',
                'exam.questions.*.correctAnswer' => 'required_if:exam.type,quiz|integer|min:0',

                // Resources validation
                'resources' => 'nullable|array',
                'resources.*.name' => 'required|string|max:255',
                'resources.*.type' => 'required|in:pdf,video,image,link,other',
                'resources.*.file' => 'required_if:resources.*.type,pdf,image,video|nullable|file',
                'resources.*.url' => 'required_if:resources.*.type,link,other|nullable|string|max:500',
            ]);

            DB::beginTransaction();
            try {
                // ─── Create course ──────────────────────────────────────────
                $course = Course::create([
                    'instructor_id'   => $instructor->id,
                    'title'           => $validated['title'],
                    'description'     => $validated['description'],
                    'level'           => $validated['level'],
                    'category'        => $validated['category'],
                    'duration_min'    => $validated['duration_min'] ?? 0,
                    'is_published'    => false,
                ]);

                // Handle thumbnail upload
                if ($request->hasFile('course_thumbnail')) {
                    $path = $request->file('course_thumbnail')
                                ->store("courses/{$course->id}/thumbnail", 'public');
                    $course->course_thumbnail = '/storage/' . $path;
                    $course->save();
                }

                // ─── Handle modules ──────────────────────────────────────────
                if ($request->has('modules')) {
                    foreach ($request->modules as $index => $module) {
                        $moduleData = [
                            'course_id' => $course->id,
                            'title'     => $module['title'],
                            'type'      => $module['type'],
                            'text_content' => $module['type'] === 'text' ? $module['content'] : null,
                            'order'     => $module['order'],
                            'duration'  => $module['duration'] ?? null,
                        ];

                        // Create the module first
                        $newModule = Module::create($moduleData);

                        // Handle file upload if present
                        if (in_array($module['type'], ['pdf', 'image', 'video']) && 
                            $request->hasFile("modules.{$index}.file")) {
                            $path = $request->file("modules.{$index}.file")
                                        ->store("courses/{$course->id}/modules/{$newModule->id}", 'public');
                            $newModule->file_path = '/storage/' . $path;
                            $newModule->save();
                        }

                        // Handle quiz questions if present
                        if ($module['type'] === 'quiz' && isset($module['questions'])) {
                            foreach ($module['questions'] as $qIndex => $quiz) {
                                QuizQuestion::create([
                                    'module_id' => $newModule->id,
                                    'question' => $quiz['question'],
                                    'options' => json_encode($quiz['options']),
                                    'correct_option' => $quiz['correctAnswer'],
                                ]);
                            }
                        }
                    }
                }

                // ─── Handle exams ──────────────────────────────────────────
                $exam = Exam::create([
                    'course_id'     => $course->id,
                    'title'         => $request->exam['title'],
                    'instructions'  => $request->exam['instructions'] ?? null,
                    'duration_min'  => $request->exam['duration_min'],
                    'passing_score' => $request->exam['passing_score'],
                ]);
    
                foreach ($request->exam['questions'] as $q) {
                    ExamQuestion::create([
                        'exam_id'      => $exam->id,
                        'question_text'=> $q['question'],
                        'options'      => json_encode($q['options']),
                        'correct_index'=> $q['correctAnswer'],
                    ]);
                }

                
                // ─── Handle resources ──────────────────────────────────────────
                if ($request->has('resources')) {
                    foreach ($request->resources as $index => $resource) {
                        $url = null;
                        
                        if (in_array($resource['type'], ['pdf', 'image', 'video']) && isset($resource['file'])) {
                            $url = $request->file("resources.{$index}.file")
                                        ->store("courses/{$course->id}/resources", 'public');
                            $url = '/storage/' . $url;
                        } elseif (in_array($resource['type'], ['link', 'other'])) {
                            $url = $resource['url'];
                        }

                        Resource::create([
                            'course_id' => $course->id,
                            'name'      => $resource['name'],
                            'type'      => $resource['type'],
                            'url'       => $url,
                        ]);
                    }
                }

                DB::commit();
                
                return response()->json([
                    'message' => 'Course created successfully'
                ], 201);

            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Error in createCourse transaction', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                return response()->json(['message' => 'Internal server error'], 500);
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error in createCourse', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }


}
