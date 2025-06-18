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
            $user = Auth::user();
            if (!$user) {
                Log::error('No authenticated user for enrollment', ['course_id' => $courseId]);
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            if ($user->role !== 'learner') {
                Log::warning('Unauthorized role for enrollment', ['user_id' => $user->id, 'role' => $user->role]);
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $learner = Learner::where('user_id', $user->id)->first();
            if (!$learner) {
                Log::error('Learner profile not found', ['user_id' => $user->id]);
                return response()->json(['message' => 'Learner profile not found'], 404);
            }

            $course = Course::find($courseId);
            if (!$course) {
                Log::error('Course not found', ['course_id' => $courseId]);
                return response()->json(['message' => 'Course not found'], 404);
            }

            // Check if already enrolled
            if ($learner->courses()->where('course_id', $courseId)->exists()) {
                Log::info('Already enrolled in course', ['learner_id' => $learner->id, 'course_id' => $courseId]);
                return response()->json(['message' => 'Already enrolled in this course'], 400);
            }

            // Enroll in course with initial values
            $learner->courses()->attach($courseId, [
                'progress' => 0,
                'last_accessed' => now(),
                'tentatives' => 0,
                'completed_modules' => json_encode([]) // Initialize with empty array
            ]);

            Log::info('Successfully enrolled in course', [
                'learner_id' => $learner->id,
                'course_id' => $courseId
            ]);

            return response()->json([
                'message' => 'Successfully enrolled in course',
                'course' => $course
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to enroll in course', [
                'course_id' => $courseId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Failed to enroll in course'], 500);
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
            $allCourses = Course::whereNotIn('id', function ($query) use ($learner) {
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
                    'category',
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
                        'category' => $course->category,
                        'students' => $course->students_count,
                        'rating' => $course->rating,
                        'instructor' => [
                            'name' => $course->instructor->user->username ?? 'Unknown Instructor'
                        ]
                    ];
                });

            // Get recommended courses based on learner data
            $recommendedCourses = $this->getRecommendedCourses($learner, $allCourses);

            Log::info('Available courses retrieved', [
                'user_id' => $user->id,
                'all_courses_count' => $allCourses->count(),
                'recommended_courses_count' => $recommendedCourses->count()
            ]);

            return response()->json([
                'courses' => $allCourses,
                'recommendedCourses' => $recommendedCourses
            ], 200);
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
     * Get recommended courses based on learner's enrolled courses, field of interest, and language
     *
     * @param Learner $learner
     * @param \Illuminate\Support\Collection $availableCourses
     * @return \Illuminate\Support\Collection
     */
    private function getRecommendedCourses($learner, $availableCourses)
    {
        try {
            // Get learner's enrolled courses with their categories
            $enrolledCourses = $learner->courses()
                ->select('courses.id', 'courses.category', 'courses.level', 'course_learner.progress')
                ->get();

            // Get learner's field of interest and language
            $fieldOfInterest = $learner->fields_of_interest ?? [];
            $languages = $learner->languages ?? [];

            // Convert to arrays if they're JSON strings
            if (is_string($fieldOfInterest)) {
                $fieldOfInterest = json_decode($fieldOfInterest, true) ?? [];
            }
            if (is_string($languages)) {
                $languages = json_decode($languages, true) ?? [];
            }

            // Calculate recommendation scores for each available course
            $coursesWithScores = $availableCourses->map(function ($course) use ($enrolledCourses, $fieldOfInterest, $languages) {
                $score = 0;
                $reasons = [];

                // Score based on category match with enrolled courses (weight: 3)
                $enrolledCategories = $enrolledCourses->pluck('category')->filter()->unique();
                if ($enrolledCategories->contains($course['category'])) {
                    $score += 3;
                    $reasons[] = 'Basé sur vos anciennes inscriptions';
                }

                // Score based on field of interest match (weight: 4)
                if (in_array($course['category'], $fieldOfInterest)) {
                    $score += 4;
                    $reasons[] = "Ca convient avec vos centres d'interets";
                }

                // Score based on level progression (weight: 2)
                $enrolledLevels = $enrolledCourses->pluck('level')->filter()->unique();
                if ($this->isLevelProgression($enrolledLevels, $course['level'])) {
                    $score += 2;
                    $reasons[] = "Pris en compte le niveau d'apprentissage";
                }

                // Score based on high rating (weight: 1)
                if ($course['rating'] >= 4.5) {
                    $score += 1;
                    $reasons[] = 'Top rating';
                }

                // Score based on popularity (weight: 1)
                if ($course['students'] >= 100) {
                    $score += 1;
                    $reasons[] = 'Plusieurs personnes se sont inscris dans cette formation';
                }

                // Score based on language preference (weight: 2)
                // Note: This would require adding language field to courses table
                // For now, we'll skip this but leave the structure

                return [
                    'course' => $course,
                    'score' => $score,
                    'reasons' => $reasons
                ];
            });

            // Filter courses with scores > 0 and sort by score (highest first)
            $recommendedCourses = $coursesWithScores
                ->filter(function ($item) {
                    return $item['score'] > 0;
                })
                ->sortByDesc('score')
                ->take(10) // Limit to top 10 recommendations
                ->map(function ($item) {
                    return array_merge($item['course'], [
                        'recommendation_reasons' => $item['reasons']
                    ]);
                });

            Log::info('Course recommendations generated', [
                'learner_id' => $learner->id,
                'enrolled_courses_count' => $enrolledCourses->count(),
                'fields_of_interest' => $fieldOfInterest,
                'languages' => $languages,
                'recommendations_count' => $recommendedCourses->count()
            ]);

            return $recommendedCourses;
        } catch (\Exception $e) {
            Log::error('Error generating course recommendations', [
                'learner_id' => $learner->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Return empty collection if recommendation system fails
            return collect([]);
        }
    }

    /**
     * Check if a course level represents progression from enrolled levels
     *
     * @param \Illuminate\Support\Collection $enrolledLevels
     * @param string $courseLevel
     * @return bool
     */
    private function isLevelProgression($enrolledLevels, $courseLevel)
    {
        $levelHierarchy = [
            'beginner' => 1,
            'intermediate' => 2,
            'advanced' => 3,
            'expert' => 4
        ];

        $courseLevelValue = $levelHierarchy[$courseLevel] ?? 0;

        // Check if the course level is appropriate for progression
        foreach ($enrolledLevels as $enrolledLevel) {
            $enrolledLevelValue = $levelHierarchy[$enrolledLevel] ?? 0;

            // Recommend courses that are same level or one level higher
            if ($courseLevelValue >= $enrolledLevelValue && $courseLevelValue <= $enrolledLevelValue + 1) {
                return true;
            }
        }

        return false;
    }

    /**
     * Remove the learner from the course
     */
    /*  public function leave(Course $course): JsonResponse
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
    } */
}
