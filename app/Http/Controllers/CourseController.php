<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Learner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class CourseController extends Controller
{

    public function getEnrolledCourses(Request $request): JsonResponse
    {

        //check if user is authenticated
        $user = Auth::user();
        if (!$user) {
            Log::error('No authenticated user for getEnrolledCourses', ['request' => $request->all()]);
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
        //check if user is learner
        if ($user->role !== 'learner') {
            Log::warning('Unauthorized role for getEnrolledCourses', ['user_id' => $user->id, 'role' => $user->role]);
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        //do the job
        try {
            $learner = Learner::with(['courses' => function ($query) {
                $query->select('courses.id', 'courses.title', 'courses.course_thumbnail', 'courses.level', 'courses.rating', 'course_learner.progress', 'course_learner.last_accessed')
                    ->orderBy('course_learner.progress', 'desc');
            }])->where('user_id', $user->id)->first();

            if (!$learner) {
                Log::error('Learner profile not found', ['user_id' => $user->id]);
                return response()->json(['message' => 'Learner profile not found'], 404);
            }

            $courses = $learner->courses->map(function ($course) {
                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'progress' => $course->pivot->progress ?? 0,
                    'last_accessed' => $course->pivot->last_accessed,
                    'image' => $course->course_thumbnail,
                    'level' => $course->level,
                    'students' => $course->students_count,
                    'rating' => $course->rating,
                ];
            });

            Log::info('Enrolled courses retrieved', [
                'user_id' => $user->id,
                'course_count' => $courses->count()
            ]);

            return response()->json(['courses' => $courses], 200);
        } catch (\Exception $e) {
            Log::error('Error in getEnrolledCourses', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }

    public function getCourseDetails($id): JsonResponse
    {
        try {
            // Validate the ID
            $id = filter_var($id, FILTER_VALIDATE_INT);
            if (!$id) {
                return response()->json(['message' => 'Invalid course ID'], 400);
            }

            // Fetch course with instructor and modules
            $course = Course::with(['instructor.user', 'modules'])->find($id);

            if (!$course) {
                return response()->json(['message' => 'Course not found'], 404);
            }

            // Check enrollment status for authenticated user
            $isEnrolled = false;
            $progress = 0; // Initialize progress here

            if (Auth::check()) {
                $learner = Learner::where('user_id', Auth::id())->first();

                if ($learner) {
                    $coursePivot = $learner->courses()->where('course_id', $id)->first();

                    if ($coursePivot) {
                        $isEnrolled = true;
                        $progress = $coursePivot->pivot->progress ?? 0;
                    }
                }
            }

            // Format course data
            $formattedCourse = [
                'id' => $course->id,
                'title' => $course->title,
                'description' => $course->description,
                'course_thumbnail' => $course->course_thumbnail,
                'duration_hours' => $course->duration_hours,
                'level' => $course->level,
                'rating' => $course->rating,
                'students_count' => $course->students_count,
                'instructor' => [
                    'id' => $course->instructor->id,
                    'name' => $course->instructor->user->username,
                    'avatar' => $course->instructor->user->avatar,
                    'bio' => $course->instructor->user->bio,
                    'skills' => $course->instructor->skills,
                    'certifications' => $course->instructor->certifications,
                    'languages' => $course->instructor->languages
                ],
                'modules' => $course->modules->map(function ($module) {
                    return [
                        'id' => $module->id,
                        'title' => $module->title,
                        'duration' => $module->duration,
                        'order' => $module->order,
                        'type' => $module->type
                    ];
                })
            ];


            return response()->json([
                'course' => $formattedCourse,
                'is_enrolled' => $isEnrolled,
                'progress' => (int)($progress),

            ]);
        } catch (\Exception $e) {
            Log::error('Error in getCourseDetails', [
                'course_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Failed to load course details'], 500);
        }
    }

    public function enrollNow($courseId)
    {
        try {
            DB::beginTransaction();

            $user = auth()->user();
            $course = Course::findOrFail($courseId);

            // Get the learner record
            $learner = Learner::where('user_id', $user->id)->first();
            if (!$learner) {
                return response()->json([
                    'message' => 'Profil apprenant non trouvé.'
                ], 404);
            }

            // Check if already enrolled
            if ($course->learners()->where('learner_id', $learner->id)->exists()) {
                return response()->json([
                    'message' => 'Vous êtes déjà inscrit à ce cours.'
                ], 400);
            }

            // Attach learner to course with initial values
            $course->learners()->attach($learner->id, [
                'progress' => 0,
                'last_accessed' => now(),
                'tentatives' => 0
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Inscription réussie!'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Backend: Failed to enroll in course', [
                'course_id' => $courseId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Une erreur est survenue lors de l\'inscription.'
            ], 500);
        }
    }





    /**
     * Get all available courses for the authenticated learner.
     * Excludes courses that the learner is already enrolled in.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getAllCourses(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            Log::error('No authenticated user for getAllCourses');
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if ($user->role !== 'learner') {
            Log::warning('Unauthorized role for getAllCourses', ['user_id' => $user->id, 'role' => $user->role]);
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $learner = Learner::where('user_id', $user->id)->first();
            if (!$learner) {
                Log::error('Learner profile not found', ['user_id' => $user->id]);
                return response()->json(['message' => 'Learner profile not found'], 404);
            }

            // Get all courses except the ones the learner is enrolled in
            $courses = Course::whereNotIn('id', function ($query) use ($learner) {
                $query->select('course_id')
                    ->from('course_learner')
                    ->where('learner_id', $learner->id);
            })
                ->where('is_published', true)
                ->with(['instructor.user' => function ($query) {
                    $query->select('id', 'username');
                }])
                ->select([
                    'id',
                    'title',
                    'description',
                    'course_thumbnail',
                    'level',
                    'rating',
                    'instructor_id'
                ])
                ->get()
                ->map(function ($course) {
                    return [
                        'id' => $course->id,
                        'title' => $course->title,
                        'description' => $course->description,
                        'course_thumbnail' => $course->course_thumbnail,
                        'level' => $course->level,
                        'students' => $course->students_count,
                        'rating' => $course->rating,
                        'instructor' => [
                            'name' => $course->instructor->user->username ?? 'Unknown Instructor'
                        ]
                    ];
                });

            Log::info('Available courses retrieved', [
                'user_id' => $user->id,
                'course_count' => $courses->count()
            ]);

            return response()->json(['courses' => $courses], 200);
        } catch (\Exception $e) {
            Log::error('Error in getAllCourses', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }

    /**
     * Remove the learner from the course
     */
    public function leave(Course $course): JsonResponse
    {
        try {
            $learner = Auth::user()->learner;

            if (!$learner) {
                return response()->json(['message' => 'Learner not found'], 404);
            }

            Log::info('Backend: Starting course leave process', [
                'course_id' => $course->id,
                'learner_id' => $learner->id
            ]);

            // Reset module completion status for this course
            $resetModules = $course->modules()->update(['is_completed' => false]);
            Log::info('Backend: Reset module completion status', [
                'modules_reset' => $resetModules,
                'course_id' => $course->id
            ]);

            // Remove the enrollment
            $learner->courses()->detach($course->id);
            Log::info('Backend: Removed course enrollment', [
                'course_id' => $course->id,
                'learner_id' => $learner->id
            ]);

            // Update learner's enrolled courses count
            $learner->update([
                'courses_enrolled' => $learner->courses()->count()
            ]);

            Log::info('Backend: Successfully left course', [
                'course_id' => $course->id,
                'learner_id' => $learner->id,
                'courses_enrolled' => $learner->courses_enrolled
            ]);

            return response()->json([
                'message' => 'Successfully left the course',
                'course' => $course
            ]);
        } catch (\Exception $e) {
            Log::error('Backend: Failed to leave course', [
                'course_id' => $course->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Failed to leave the course'], 500);
        }
    }
}
