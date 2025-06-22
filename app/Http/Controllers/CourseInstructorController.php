<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Instructor;
use App\Models\Module;
use App\Models\QuizQuestion;
use App\Models\Exam;
use App\Models\ExamQuestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Models\Resource;

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

            // Get all courses for this instructor with related data and comment count
            $courses = Course::with(['modules', 'learners'])
                ->withCount('chatMessages as comment_count')
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
                        'comment_count' => $course->comment_count,
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


    // ─── Create course ──────────────────────────────────────────

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
                'language' => 'nullable|string|max:255',

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
                    'language'        => $validated['language'] ?? null,
                    'duration_min'    => $validated['duration_min'] + $request->exam['duration_min'] ?? 0,
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
                            'duration'  => $module['duration_min'] ?? 0,
                        ];

                        // Create the module first
                        $newModule = Module::create($moduleData);

                        // Handle file upload if present
                        if (
                            in_array($module['type'], ['pdf', 'image', 'video']) &&
                            $request->hasFile("modules.{$index}.file")
                        ) {
                            $file = $request->file("modules.{$index}.file");
                            $fileName = time() . '_' . $file->getClientOriginalName();
                            $path = $file->storeAs("courses/{$course->id}/modules/{$newModule->id}", $fileName, 'public');
                            $newModule->file_path = '/storage/' . $path;
                            $newModule->save();
                        }

                        // Handle quiz questions if present
                        if ($module['type'] === 'quiz' && isset($module['questions'])) {
                            foreach ($module['questions'] as $qIndex => $quiz) {
                                QuizQuestion::create([
                                    'module_id' => $newModule->id,
                                    'question' => $quiz['question'],
                                    'options' => $quiz['options'],
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
                    'max_tentatives' => $request->exam['max_tentatives'] ?? 3 // Default to 3 if not set
                ]);

                foreach ($request->exam['questions'] as $q) {
                    ExamQuestion::create([
                        'exam_id'      => $exam->id,
                        'question_text' => $q['question'],
                        'options'      => $q['options'],
                        'correct_index' => $q['correctAnswer'],
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
                        if ($resource['type'] === 'link') {
                            if (!preg_match('/^https?:\/\//', $url)) {
                                $url = 'https://' . $url;
                            }
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

    // ─── Delete course ──────────────────────────────────────────

    public function deleteCourse(Request $request, $courseId)
    {
        // 1️⃣ Authorization: only instructors can delete their own course
        $user = Auth::user();
        if (!$user || $user->role !== 'instructor') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $instructor = Instructor::where('user_id', $user->id)->first();
        if (!$instructor) {
            return response()->json(['message' => 'Instructor profile not found'], 404);
        }

        try {
            DB::beginTransaction();

            // 2️⃣ Load course + relationships. Note we use 'exam' not 'exams'
            $course = Course::with(['modules', 'resources', 'exam', 'learners'])
                ->find($courseId);

            if (!$course) {
                return response()->json(['message' => 'Course not found'], 404);
            }

            // Only the owner (instructor) may delete
            if ($course->instructor_id !== $instructor->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // 3️⃣ Delete all modules (and their quiz questions)
            foreach ($course->modules as $module) {
                if ($module->type === 'quiz') {
                    // Remove quiz questions
                    $module->quizQuestions()->delete();
                }
                $module->delete();
            }

            // 4️⃣ Delete all general resources (and their files)
            foreach ($course->resources as $resource) {
                if ($resource->url) {
                    // remove the file from public storage
                    $relative = str_replace('/storage/', '', $resource->url);
                    if (Storage::disk('public')->exists($relative)) {
                        Storage::disk('public')->delete($relative);
                    }
                }
                $resource->delete();
            }

            // 5️⃣ Delete the single exam (if it exists) and its questions
            if ($course->exam) {
                // Delete exam questions first
                ExamQuestion::where('exam_id', $course->exam->id)->delete();
                $course->exam->delete();
            }

            // 6️⃣ Detach learners
            $course->learners()->detach();

            // 7️⃣ Finally, delete the course record
            $course->delete();

            // 8️⃣ Remove any leftover files on disk under 'courses/{id}'
            if (Storage::disk('public')->exists("courses/{$courseId}")) {
                Storage::disk('public')->deleteDirectory("courses/{$courseId}");
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Course deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in deleteCourse', [
                'course_id' => $courseId,
                'error'     => $e->getMessage(),
                'trace'     => $e->getTraceAsString(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete course',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    // ─── Get course by ID ──────────────────────────────────────────

    public function getCourseById(Request $request, $courseId)
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
            $course = Course::find($courseId);
            if (!$course) {
                return response()->json(['message' => 'Course not found'], 404);
            }

            if ($course->instructor_id !== $instructor->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            return response()->json([
                'course' => $course,
                'students' => $course->learners->count(),
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error in getCourseById', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }

    // ─── get all content course ──────────────────────────────────────────

    public function getAllContentCourse(Request $request, $courseId)
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
            // Load course with all necessary relationships
            $course = Course::with([
                'modules' => function ($query) {
                    $query->orderBy('order', 'asc');
                },
                'modules.quizQuestions',
                'exam',
                'exam.questions',
                'resources',
                'learners'
            ])->find($courseId);

            if (!$course) {
                return response()->json(['message' => 'Course not found'], 404);
            }

            if ($course->instructor_id !== $instructor->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // Format the response
            $formattedCourse = [
                'id' => $course->id,
                'title' => $course->title,
                'description' => $course->description,
                'course_thumbnail' => $course->course_thumbnail,
                'level' => $course->level,
                'category' => $course->category,
                'language' => $course->language,
                'rating' => $course->rating,
                'is_published' => $course->is_published,
                'duration_min' => $course->duration_min,
                'created_at' => $course->created_at,
                'updated_at' => $course->updated_at,
                'students_count' => $course->learners->count(),
                'modules' => $course->modules->map(function ($module) {
                    return [
                        'id' => $module->id,
                        'title' => $module->title,
                        'type' => $module->type,
                        'text_content' => $module->text_content,
                        'file_path' => $module->file_path,
                        'order' => $module->order,
                        'duration_min' => $module->duration,
                        'quiz_questions' => $module->quizQuestions->map(function ($question) {
                            return [
                                'id' => $question->id,
                                'question' => $question->question,
                                'options' => $question->options,
                                'correct_option' => $question->correct_option
                            ];
                        })
                    ];
                }),
                'exam' => $course->exam ? [
                    'id' => $course->exam->id,
                    'title' => $course->exam->title,
                    'instructions' => $course->exam->instructions,
                    'duration_min' => $course->exam->duration_min,
                    'passing_score' => $course->exam->passing_score,
                    'questions' => $course->exam->questions->map(function ($question) {
                        return [
                            'id' => $question->id,
                            'question_text' => $question->question_text,
                            'options' => $question->options,
                            'correct_index' => $question->correct_index
                        ];
                    })
                ] : null,
                'resources' => $course->resources->map(function ($resource) {
                    return [
                        'id' => $resource->id,
                        'name' => $resource->name,
                        'type' => $resource->type,
                        'url' => $resource->url
                    ];
                })
            ];

            return response()->json([
                'course' => $formattedCourse
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error in getAllContentCourse', [
                'course_id' => $courseId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }

    // ─── Edit course functions──────────────────────────────────────────

    public function editCourseOverview(Request $request, $courseId)
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

        // 2️⃣ Validation
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'level' => 'required|string|in:beginner,intermediate,advanced',
            'category' => 'required|string|max:255',
            'duration_min' => 'required|integer|min:0',
            'language' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        try {
            $course = Course::find($courseId);
            if (!$course) {
                return response()->json(['message' => 'Course not found'], 404);
            }

            if ($course->instructor_id !== $instructor->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            if ($request->hasFile('course_thumbnail')) {
                $oldPath = str_replace('/storage/', '', $course->course_thumbnail);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
                $path = $request->file('course_thumbnail')
                    ->store("courses/{$course->id}/thumbnail", 'public');
                $course->course_thumbnail = '/storage/' . $path;
            }

            $updateData = [
                'title' => $validator->validated()['title'],
                'description' => $validator->validated()['description'],
                'level' => $validator->validated()['level'],
                'category' => $validator->validated()['category'],
                'duration_min' => $validator->validated()['duration_min'],
                'language' => $validator->validated()['language'] ?? null,
                'is_published' => 0,
            ];

            // Handle thumbnail upload if a new file is provided
            if ($request->hasFile('course_thumbnail')) {
                // Delete old thumbnail if it exists
                if ($course->course_thumbnail) {
                    $oldPath = str_replace('/storage/', '', $course->course_thumbnail);
                    if (Storage::disk('public')->exists($oldPath)) {
                        Storage::disk('public')->delete($oldPath);
                    }
                }

                // Store new thumbnail
                $path = $request->file('course_thumbnail')
                    ->store("courses/{$course->id}/thumbnail", 'public');
                $updateData['course_thumbnail'] = '/storage/' . $path;
            }

            $course->update($updateData);


            return response()->json([
                'message' => 'Course overview updated successfully',
                'course' => $course
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error in editCourseOverview', [
                'course_id' => $courseId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }


    // ─── Edit course resources ──────────────────────────────────────────

    public function editCourseResources(Request $request, $courseId)
    {
        // Authorization
        $user = Auth::user();
        if (!$user || $user->role !== 'instructor') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $instructor = Instructor::where('user_id', $user->id)->first();
        if (!$instructor) {
            return response()->json(['message' => 'Instructor profile not found'], 404);
        }

        try {
            $course = Course::find($courseId);
            if (!$course) {
                return response()->json(['message' => 'Course not found'], 404);
            }

            if ($course->instructor_id !== $instructor->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // Get the list of resource IDs from the request (only existing ones)
            $requestResourceIds = [];
            $resourcesData = $request->input('resources', []);

            foreach ($resourcesData as $resourceData) {
                if (isset($resourceData['id']) && !empty($resourceData['id'])) {
                    // Check if this ID actually exists in the database
                    $existingResource = Resource::where('id', $resourceData['id'])
                        ->where('course_id', $course->id)
                        ->first();

                    if ($existingResource) {
                        $requestResourceIds[] = (int)$resourceData['id'];
                    }
                }
            }

            // Delete old resources that are not in the request's input
            $existingResources = Resource::where('course_id', $course->id)->get();
            foreach ($existingResources as $resource) {
                if (!in_array($resource->id, $requestResourceIds)) {
                    // Delete file from storage if it's a file-based resource
                    if (in_array($resource->type, ['pdf', 'video', 'image']) && $resource->url) {
                        $filePath = str_replace('/storage/', '', $resource->url);
                        if (Storage::disk('public')->exists($filePath)) {
                            Storage::disk('public')->delete($filePath);
                        }
                    }
                    $resource->delete();
                }
            }

            // Process resources from the request
            foreach ($resourcesData as $index => $resourceData) {
                $name = $resourceData['name'] ?? '';
                $type = $resourceData['type'] ?? '';
                $url = $resourceData['url'] ?? null;
                $id = $resourceData['id'] ?? null;

                // Skip if required fields are missing
                if (empty($name) || empty($type)) {
                    continue;
                }

                // Determine if this is an existing resource or new one
                // Check if resource ID exists and if it actually exists in the database
                $isExistingResource = false;
                $resource = null;

                if ($id) {
                    $resource = Resource::where('id', $id)
                        ->where('course_id', $course->id)
                        ->first();

                    // Only treat as existing if the resource actually exists in database
                    $isExistingResource = ($resource !== null);
                }

                if ($isExistingResource) {
                    // Handle existing resource modification
                    // $resource is already retrieved above

                    // Update basic resource properties
                    $resource->name = $name;
                    $resource->type = $type;

                    // Handle file update if new file is provided for file-based resources
                    if (in_array($type, ['pdf', 'video', 'image'])) {
                        if ($request->hasFile("resources.{$index}.file")) {
                            // Delete old file
                            if ($resource->url) {
                                $oldPath = str_replace('/storage/', '', $resource->url);
                                if (Storage::disk('public')->exists($oldPath)) {
                                    Storage::disk('public')->delete($oldPath);
                                }
                            }

                            // Store new file
                            $file = $request->file("resources.{$index}.file");
                            $path = $file->store("courses/{$course->id}/resources", 'public');
                            $resource->url = '/storage/' . $path;
                        }
                        // If no new file provided, keep existing URL
                    } else {
                        // For link/other types, update URL
                        if ($type === 'link' && !empty($url)) {
                            if (!preg_match('/^https?:\/\//', $url)) {
                                $url = 'https://' . $url;
                            }
                        }
                        $resource->url = $url;
                    }

                    $resource->save();
                } else {
                    // Handle new resource creation
                    // Handle new file uploads
                    if (in_array($type, ['pdf', 'video', 'image'])) {
                        if ($request->hasFile("resources.{$index}.file")) {
                            $file = $request->file("resources.{$index}.file");
                            $path = $file->store("courses/{$course->id}/resources", 'public');
                            $url = '/storage/' . $path;
                        } else {
                            continue; // Skip if file is missing for file-type resource
                        }
                    }
                    // Handle URL-based resources
                    elseif (in_array($type, ['link', 'other'])) {
                        if (empty($url)) {
                            continue; // Skip if URL is missing for link-type resource
                        }
                        if ($type === 'link') {
                            if (!preg_match('/^https?:\/\//', $url)) {
                                $url = 'https://' . $url;
                            }
                        }
                    } else {
                        continue; // Skip invalid type
                    }

                    // Create new resource record
                    Resource::create([
                        'course_id' => $course->id,
                        'name' => $name,
                        'type' => $type,
                        'url' => $url,
                    ]);
                }
            }

            return response()->json([
                'message' => 'Course resources updated successfully'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error in editCourseResources', [
                'course_id' => $courseId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }

    // ─── Edit course Exam ──────────────────────────────────────────

    public function editCourseExam(Request $request, $courseId)
    {
        // Authorization
        $user = Auth::user();
        if (!$user || $user->role !== 'instructor') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $instructor = Instructor::where('user_id', $user->id)->first();
        if (!$instructor) {
            return response()->json(['message' => 'Instructor profile not found'], 404);
        }

        try {
            $course = Course::find($courseId);
            if (!$course) {
                return response()->json(['message' => 'Course not found'], 404);
            }

            if ($course->instructor_id !== $instructor->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $exam = Exam::where('course_id', $course->id)->first();
            if (!$exam) {
                return response()->json(['message' => 'Exam not found'], 404);
            }

            // delete old exam questions
            $exam->questions()->delete();

            // create new exam questions
            foreach ($request->input('exam.questions', []) as $question) {
                $exam->questions()->create($question);
            }

            $exam->update([
                'title' => $request->input('exam.title'),
                'instructions' => $request->input('exam.instructions'),
                'duration_min' => $request->input('exam.duration_min'),
                'passing_score' => $request->input('exam.passing_score'),
                'max_tentatives' => $request->input('exam.max_tentatives', 3) // Default to 3 if not set
            ]);

            $course->update([
                'duration_min' => $request->input('duration_min'),
            ]);

            return response()->json([
                'message' => 'Course exam updated successfully',
                'exam' => $exam
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error in editCourseExam', [
                'course_id' => $courseId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }

    // ─── Edit course modules ──────────────────────────────────────────

    public function editCourseModules(Request $request, $courseId)
    {
        // Authorization
        $user = Auth::user();
        if (!$user || $user->role !== 'instructor') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $instructor = Instructor::where('user_id', $user->id)->first();
        if (!$instructor) {
            return response()->json(['message' => 'Instructor profile not found'], 404);
        }

        try {
            DB::beginTransaction();

            // Log the incoming request data
            Log::info('EditCourseModules Request Data:', [
                'course_id' => $courseId,
                'request_data' => $request->all(),
                'files' => $request->allFiles()
            ]);

            $course = Course::find($courseId);
            if (!$course) {
                DB::rollBack();
                return response()->json(['message' => 'Course not found'], 404);
            }

            if ($course->instructor_id !== $instructor->id) {
                DB::rollBack();
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // Update course duration
            if ($request->has('duration_min')) {
                $course->duration_min = $request->input('duration_min');
                $course->save();
            }

            // Get the list of module IDs from the request (only existing ones)
            $requestModuleIds = [];
            $modules = $request->input('modules', []);

            foreach ($modules as $moduleData) {
                if (isset($moduleData['id']) && !empty($moduleData['id'])) {
                    // Check if this ID actually exists in the database
                    $existingModule = Module::where('id', $moduleData['id'])
                        ->where('course_id', $course->id)
                        ->first();

                    if ($existingModule) {
                        $requestModuleIds[] = (int)$moduleData['id'];
                    }
                }
            }

            // Delete old modules that are not in the request's input
            $existingModules = Module::where('course_id', $course->id)->get();
            foreach ($existingModules as $module) {
                if (!in_array($module->id, $requestModuleIds)) {
                    // Delete entire module folder
                    $moduleFolderPath = "courses/{$course->id}/modules/{$module->id}";
                    if (Storage::disk('public')->exists($moduleFolderPath)) {
                        Storage::disk('public')->deleteDirectory($moduleFolderPath);
                    }

                    // Delete quiz questions
                    if ($module->type === 'quiz') {
                        QuizQuestion::where('module_id', $module->id)->delete();
                    }

                    $module->delete();
                }
            }

            // Process modules from the request
            foreach ($modules as $index => $moduleData) {
                try {
                    // Validate required fields
                    if (empty($moduleData['title']) || empty($moduleData['type'])) {
                        throw new \Exception("Missing required fields for module at index {$index}");
                    }

                    // Determine if this is an existing module or new one
                    // Check if module ID exists and if it actually exists in the database
                    $isExistingModule = false;
                    $module = null;

                    if (isset($moduleData['id']) && !empty($moduleData['id'])) {
                        $module = Module::where('id', $moduleData['id'])
                            ->where('course_id', $course->id)
                            ->first();

                        // Only treat as existing if the module actually exists in database
                        $isExistingModule = ($module !== null);
                    }

                    if ($isExistingModule) {
                        // Handle existing module modification
                        // $module is already retrieved above

                        // Update basic module properties
                        $module->title = $moduleData['title'];
                        $module->order = $moduleData['order'] ?? $index + 1;
                        $module->duration = $moduleData['duration_min'] ?? null;

                        // Handle different module types
                        switch ($module->type) {
                            case 'text':
                                $module->text_content = $moduleData['text_content'] ?? null;
                                break;

                            case 'quiz':
                                // Replace all quiz questions
                                QuizQuestion::where('module_id', $module->id)->delete();
                                $this->createQuizQuestions($module->id, $moduleData['quiz_questions'] ?? []);
                                break;

                            case 'pdf':
                            case 'video':
                            case 'image':
                                // Handle file update if new file is provided
                                if ($request->hasFile("modules.{$index}.file")) {
                                    // Delete entire module folder (contains old files)
                                    $moduleFolderPath = "courses/{$course->id}/modules/{$module->id}";
                                    if (Storage::disk('public')->exists($moduleFolderPath)) {
                                        Storage::disk('public')->deleteDirectory($moduleFolderPath);
                                    }

                                    // Store new file
                                    $file = $request->file("modules.{$index}.file");
                                    $fileName = time() . '_' . $file->getClientOriginalName();
                                    $path = $file->storeAs("courses/{$course->id}/modules/{$module->id}", $fileName, 'public');
                                    $module->file_path = '/storage/' . $path;
                                }
                                break;
                        }

                        $module->save();
                    } else {
                        // Handle new module creation
                        $newModuleData = [
                            'course_id' => $course->id,
                            'title' => $moduleData['title'],
                            'type' => $moduleData['type'],
                            'order' => $moduleData['order'] ?? $index + 1,
                            'duration' => $moduleData['duration_min'] ?? null,
                        ];

                        // Add type-specific data
                        if ($moduleData['type'] === 'text') {
                            $newModuleData['text_content'] = $moduleData['text_content'] ?? null;
                        }

                        // Create the module first
                        $newModule = Module::create($newModuleData);

                        // Handle file upload for new modules
                        if (in_array($moduleData['type'], ['pdf', 'image', 'video'])) {
                            if ($request->hasFile("modules.{$index}.file")) {
                                $file = $request->file("modules.{$index}.file");
                                $fileName = time() . '_' . $file->getClientOriginalName();
                                $path = $file->storeAs("courses/{$course->id}/modules/{$newModule->id}", $fileName, 'public');
                                $newModule->file_path = '/storage/' . $path;
                                $newModule->save();
                            }
                        }

                        // Handle quiz questions for new modules
                        if ($moduleData['type'] === 'quiz') {
                            $this->createQuizQuestions($newModule->id, $moduleData['quiz_questions'] ?? []);
                        }
                    }
                } catch (\Exception $e) {
                    Log::error('Error processing module:', [
                        'module_index' => $index,
                        'module_data' => $moduleData,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    DB::rollBack();
                    throw $e;
                }
            }

            DB::commit();

            // Return updated course with modules
            $updatedCourse = Course::with(['modules.quizQuestions'])->find($courseId);

            return response()->json([
                'message' => 'Modules updated successfully',
                'course' => $updatedCourse
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in editCourseModules', [
                'course_id' => $courseId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'message' => 'Failed to update modules',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper method to create quiz questions
     */
    private function createQuizQuestions($moduleId, $questionsData)
    {
        if (!is_array($questionsData) || empty($questionsData)) {
            return;
        }

        foreach ($questionsData as $questionData) {
            if (empty($questionData['question'])) {
                continue;
            }

            // Handle options - ensure it's an array
            $options = [];
            if (isset($questionData['options'])) {
                if (is_array($questionData['options'])) {
                    $options = $questionData['options'];
                } elseif (is_string($questionData['options'])) {
                    $decodedOptions = json_decode($questionData['options'], true);
                    $options = is_array($decodedOptions) ? $decodedOptions : [];
                }
            }

            QuizQuestion::create([
                'module_id' => $moduleId,
                'question' => $questionData['question'],
                'options' => $options,
                'correct_option' => $questionData['correct_option'] ?? 0,
            ]);
        }
    }
}
