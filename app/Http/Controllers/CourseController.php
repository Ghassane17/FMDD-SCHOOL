<?php

namespace App\Http\Controllers;

use App\Http\Resources\CourseResource;
use App\Models\Course;
use App\Models\Learner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

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
                $query->select('courses.id', 'courses.title', 'courses.course_thumbnail', 'courses.level', 'courses.students', 'courses.rating', 'course_learner.progress', 'course_learner.last_accessed')
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
                    'students' => $course->students,
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
        // Validate the ID
        $id = filter_var($id, FILTER_VALIDATE_INT);
        if (!$id) {
            return response()->json(['message' => 'Invalid course ID'], 400);
        }

        // Fetch course with instructor (user) relationship
        $course = Course::with(['instructor' => function ($query) {
            $query->select('id', 'name'); // Only fetch the necessary fields
        }])->findOrFail($id);

        // Check enrollment status for authenticated user
        $isEnrolled = auth()->check() ? auth()->user()->courses()->where('course_id', $id)->exists() : false;

        return response()->json([
            'course' => new CourseResource($course),
            'is_enrolled' => $isEnrolled
        ]);
    }

    public function enrollNow($id)
    {
        // Validate the ID
        $id = filter_var($id, FILTER_VALIDATE_INT);
        if (!$id) {
            return response()->json(['message' => 'Invalid course ID'], 400);
        }

        // Ensure user is authenticated
        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Find the course
        $course = Course::findOrFail($id);

        // Check if already enrolled
        if ($user->courses()->where('course_id', $id)->exists()) {
            return response()->json(['message' => 'Already enrolled'], 400);
        }

        // Enroll the user
        $user->courses()->attach($id);
        $course->increment('students'); // Update students count

        return response()->json(['message' => 'Enrolled successfully']);
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
                ->with(['instructor.user' => function ($query) {
                    $query->select('id', 'username');
                }])
                ->select([
                    'id',
                    'title',
                    'description',
                    'course_thumbnail',
                    'level',
                    'students',
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
                        'students' => $course->students,
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
}
