<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Instructor;
use App\Models\Module;
use App\Models\CourseResource;
use App\Models\QuizQuestion;
use App\Models\Exam;
use App\Models\ExamQuestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

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

        // 2️⃣ Validation (using front‑end keys)
        $validator = Validator::make($request->all(), [
            // Course
            'title'            => 'required|string|max:255',
            'description'      => 'required|string',
            'course_thumbnail' => 'required|string',  // Changed from file to string
            'level'            => 'required|in:beginner,intermediate,advanced',  // Changed to match frontend values
            'category'         => 'required|string|max:255',
            'duration_hours'   => 'nullable|integer|min:0',

            // Modules
            'modules'                   => 'required|array|min:1',
            'modules.*.title'           => 'required|string|max:255',
            'modules.*.type'            => 'required|in:text,pdf,image,video,quiz',
            'modules.*.content'         => 'required_if:modules.*.type,text|nullable|string',
            'modules.*.file'            => 'required_if:modules.*.type,pdf,image,video|nullable|string',  // Changed to string
            'modules.*.duration'        => 'nullable|integer|min:0',

            // Module quiz questions
            'modules.*.questions'                      => 'required_if:modules.*.type,quiz|nullable|array|min:1',
            'modules.*.questions.*.question'           => 'required|string',
            'modules.*.questions.*.options'            => 'required|array|min:2',
            'modules.*.questions.*.correctAnswer'      => 'required|integer|min:0',

            // Final Exam
            'exams'                             => 'required|array',
            'exams.title'                       => 'required|string|max:255',
            'exams.instructions'                => 'nullable|string',
            'exams.duration_min'                => 'required|integer|min:1',  // Changed to match frontend
            'exams.passing_score'               => 'required|integer|min:0|max:100',  // Changed to match frontend

            // General Course Resources
            'course_resources'                   => 'nullable|array',
            'course_resources.*.name'            => 'required|string|max:255',
            'course_resources.*.type'            => 'required|in:pdf,video,image,link,other',
            'course_resources.*.url'             => 'nullable|string|max:500',
        ],);

        if ($validator->fails()) {
            Log::error('Validation failed in createCourse', [
                'errors' => $validator->errors()->toArray(),
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        // 3️⃣ Persist everything in a transaction
        DB::beginTransaction();
        try {
            // ─── Create course ──────────────────────────────────────────
            $course = Course::create([
                'instructor_id'   => $instructor->id,
                'title'           => $request->title,
                'description'     => $request->description,
                'level'           => $request->level,
                'category'        => $request->category,
                'duration_hours'  => 0,
                'is_published'    => false,  // default
            ]);

            // ─── Thumbnail upload ────────────────────────────────────────
            if ($request->hasFile('course_thumbnail')) {
                $path = $request->file('course_thumbnail')
                            ->store("public/courses/{$course->id}/thumbnail");
                $course->course_thumbnail = Storage::url($path);
                $course->save();
            }

            // ─── Modules & Module Quiz Questions ────────────────────────
            foreach ($request->modules as $i => $m) {
                $module = Module::create([
                    'course_id'    => $course->id,
                    'title'        => $m['title'],
                    'type'         => $m['type'],
                    'text_content' => $m['type']==='text' ? $m['content'] : null,
                    'order'        => $i,
                    'duration'     => $m['duration'] ?? null,
                ]);

                // file‑based content
                if (in_array($m['type'], ['pdf','image','video']) && $request->hasFile("modules.{$i}.file")) {
                    $fp = $request->file("modules.{$i}.file")
                                 ->store("public/courses/{$course->id}/modules/{$module->id}");
                    $module->file_path = Storage::url($fp);
                    $module->save();
                }

                // quiz questions
                if ($m['type'] === 'quiz') {
                    foreach ($m['questions'] as $q) {
                        QuizQuestion::create([
                            'module_id'     => $module->id,
                            'question'      => $q['question'],
                            'options'       => json_encode($q['options']),
                            'correct_option'=> $q['correctAnswer'],
                        ]);
                    }
                }
            }

            // ─── Final Exam & Questions ─────────────────────────────────
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

            // ─── General Course Resources ───────────────────────────────
            if ($request->has('resources')) {
                foreach ($request->resources as $r) {
                    $url = $r['type']==='link'
                         ? $r['url']
                         : $r['file']->store("public/courses/{$course->id}/resources");

                    CourseResource::create([
                        'course_id' => $course->id,
                        'name'      => $r['name'],
                        'type'      => $r['type'],
                        'url'       => $r['type']==='link' ? $url : Storage::url($url),
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Course created successfully',
                'course'  => $course->load([
                    'modules.quizQuestions',
                    'exam.examQuestions',
                    'resources'
                ])
            ], 201);

        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Error in createCourse transaction', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
}
