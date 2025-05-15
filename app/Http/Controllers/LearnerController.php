<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Learner;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class LearnerController extends Controller
{

    //----------------------------------------------------------------------------------
    public function allEnrolledCourses(Request $request): \Illuminate\Http\JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            Log::error('No authenticated user for allEnrolledCourses', ['request' => $request->all()]);
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if ($user->role !== 'learner') {
            Log::warning('Unauthorized role for allEnrolledCourses', ['user_id' => $user->id, 'role' => $user->role]);
            return response()->json(['message' => 'Unauthorized'], 403);
        }

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

            return response()->json(['courses' => $courses], 200);
        } catch (\Exception $e) {
            Log::error('Error in allEnrolledCourses', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }

    //----------------------------------------------------------------------------------
    public function dashboard(Request $request): \Illuminate\Http\JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            Log::error('No authenticated user for dashboard', ['request' => $request->all()]);
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if ($user->role !== 'learner') {
            Log::warning('Unauthorized role for dashboard', ['user_id' => $user->id, 'role' => $user->role]);
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $learner = Learner::with(['courses' => function ($query) {
                $query->select('courses.id', 'courses.title', 'courses.description', 'courses.course_thumbnail', 'courses.level', 'courses.students', 'courses.rating', 'course_learner.progress', 'course_learner.last_accessed');
            }])->where('user_id', $user->id)->first();

            if (!$learner) {
                Log::error('Learner profile not found', ['user_id' => $user->id]);
                return response()->json(['message' => 'Learner profile not found'], 404);
            }

            return response()->json([
                'learner_id' => $learner->id,
                'courses_enrolled' => $learner->courses_enrolled,
                'courses_completed' => $learner->courses_completed,
                'last_connection' => $learner->last_connection,
                'user' => [
                    'name' => $user->name,
                    'avatar' => $user->avatar,
                    'bio' => $user->bio,
                ],
                'school' => 'FMDD SCHOOL',
                'enrolled_courses' => $learner->courses->map(function ($course) {
                    return [
                        'id' => $course->id,
                        'title' => $course->title,
                        'description' => $course->description,
                        'course_thumbnail' => $course->course_thumbnail,
                        'progress' => $course->pivot->progress ?? 0,
                        'last_accessed' => $course->pivot->last_accessed,
                        'level' => $course->level,
                        'students' => $course->students,
                        'rating' => $course->rating,
                    ];
                }),
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error in dashboard', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }

    //----------------------------------------------------------------------------------
    public function settings(Request $request): \Illuminate\Http\JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            Log::error('No authenticated user for settings');
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if ($user->role !== 'learner') {
            Log::warning('Unauthorized role for settings', ['user_id' => $user->id, 'role' => $user->role]);
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $learner = Learner::where('user_id', $user->id)->first();
            if (!$learner) {
                Log::error('Learner profile not found', ['user_id' => $user->id]);
                return response()->json(['message' => 'Learner profile not found'], 404);
            }

            return response()->json([
                'name' => $user->username,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'bio' => $user->bio,
                'notifications' => $user->notifications ?? ['email' => true, 'app' => true],
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error in settings', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
    //----------------------------------------------------------------------------------

    public function updateSettings(Request $request): \Illuminate\Http\JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            Log::error('No authenticated user for update settings');
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if ($user->role !== 'learner') {
            Log::warning('Unauthorized role for update settings', ['user_id' => $user->id, 'role' => $user->role]);
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $validated = $request->validate([
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:8|confirmed',
            ]);

            if (!Hash::check($validated['current_password'], $user->password)) {
                return response()->json(['message' => 'Current password is incorrect'], 422);
            }

            $user->password = Hash::make($validated['new_password']);
            $user->save();

            return response()->json([
                'message' => 'Settings updated successfully',
                'user' => [
                    'name' => $user->username,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                ],
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error in update settings', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }

    public function contact(Request $request): \Illuminate\Http\JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            Log::error('No authenticated user for contact form');
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if ($user->role !== 'learner') {
            Log::warning('Unauthorized role for contact form', ['user_id' => $user->id, 'role' => $user->role]);
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'subject' => 'required|string|max:255',
                'message' => 'required|string|min:10',
            ]);

            ContactUs::create([
                'user_id' => $user->id,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'subject' => $validated['subject'],
                'message' => $validated['message'],
            ]);

            return response()->json(['message' => 'Contact form submitted successfully'], 200);
        } catch (\Exception $e) {
            Log::error('Error in contact form submission', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }


}
