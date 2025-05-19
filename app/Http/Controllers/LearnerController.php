<?php

namespace App\Http\Controllers;

use App\Models\ContactUs;
use Illuminate\Http\Request;
use App\Models\Learner;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class LearnerController extends Controller
{

//profile() is for initial profile completion right after registration (onboarding).
//updateSettings() is for editing any profile field later, in the user’s settings page.
//settings() is to get data from db
    public function profile(Request $request): \Illuminate\Http\JsonResponse
    {
        $user = $request->user();
        if ($user->role !== 'learner') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'fields_of_interest' => 'nullable|array',
            'fields_of_interest.*' => 'string|max:255',

            // Accept array of objects for languages
            'languages' => 'nullable|array',
            'languages.*.name' => 'required|string|max:255',
            'languages.*.code' => 'nullable|string|max:10',

            // Accept array of objects for certifications
            'certifications' => 'nullable|array',
            'certifications.*.name' => 'required|string|max:255',
            'certifications.*.institution' => 'nullable|string|max:255',

            'bank_info' => 'nullable|array',
            'bank_info.iban' => 'nullable|string|max:255',
            'bank_info.bankName' => 'nullable|string|max:255',
            'bank_info.paymentMethod' => 'nullable|string|max:255',
        ]);

        $learner = \App\Models\Learner::where('user_id', $user->id)->first();

        if (!$learner) {
            return response()->json(['message' => 'Learner profile not found.'], 404);
        }

        $learner->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'learner' => $learner->fresh()
        ]);
    }
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
            $validatedUser = $request->validate([
                'username' => 'sometimes|string|max:255|unique:users,username,' . $user->id,
                'email' => 'sometimes|email|unique:users,email,' . $user->id,
                'avatar' => 'nullable|url',
                'bio' => 'nullable|string|max:1000',
                'phone' => 'nullable|string|max:20',
            ]);

            $validatedLearner = $request->validate([
                'fields_of_interest' => 'nullable|array',
                'fields_of_interest.*' => 'string|max:255',

                // Accept array of objects for languages
                'languages' => 'nullable|array',
                'languages.*.name' => 'required|string|max:255',
                'languages.*.code' => 'nullable|string|max:10',

                // Accept array of objects for certifications
                'certifications' => 'nullable|array',
                'certifications.*.name' => 'required|string|max:255',
                'certifications.*.institution' => 'nullable|string|max:255',

                'bank_info' => 'nullable|array',
                'bank_info.iban' => 'nullable|string|max:255',
                'bank_info.bankName' => 'nullable|string|max:255',
                'bank_info.paymentMethod' => 'nullable|string|max:255',
            ]);
            if ($request->filled('current_password') || $request->filled('new_password')) {
                $request->validate([
                    'current_password' => 'required|string',
                    'new_password' => 'required|string|min:8|confirmed',
                ]);
                if (!Hash::check($request->input('current_password'), $user->password)) {
                    return response()->json(['message' => 'Current password is incorrect'], 422);
                }
                $user->password = Hash::make($request->input('new_password'));
            }

            $user->fill($validatedUser);
            $user->save();

            $learner = $user->learner;
            if ($learner) {
                $learner->update($validatedLearner);
            }

            return response()->json([
                'message' => 'Settings updated successfully',
                'user' => [
                    'username' => $user->username,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'bio' => $user->bio,
                    'phone' => $user->phone,
                ],
                'learner' => $learner ? $learner->fresh() : null,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error in update settings', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
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
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'bio' => $user->bio,
                'phone' => $user->phone,
                'notifications' => $user->notifications ?? ['email' => true, 'app' => true],
                // Learner-specific fields
                'fields_of_interest' => $learner->fields_of_interest,
                'languages' => $learner->languages,
                'certifications' => $learner->certifications,
                'bank_info' => $learner->bank_info,
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





    //--------------------------------------------------------------------------------------
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

    //--------------------------------------------------------------------------------------


}
