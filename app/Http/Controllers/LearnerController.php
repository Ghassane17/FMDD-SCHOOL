<?php

namespace App\Http\Controllers;

use App\Models\ContactUs;
use Illuminate\Http\Request;
use App\Models\Learner;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

class LearnerController extends Controller
{

    //profile() is for initial profile completion right after registration (onboarding).
    //updateSettings() is for editing any profile field later, in the user's settings page.
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
            // Log incoming request data
            Log::info('Update settings request data', ['data' => $request->all()]);

            // Decode JSON strings from FormData
            $requestData = $request->all();
            foreach (['languages', 'certifications', 'fields_of_interest', 'bank_info', 'notifications'] as $field) {
                if ($request->has($field) && is_string($request->input($field))) {
                    try {
                        $requestData[$field] = json_decode($request->input($field), true);
                    } catch (\Exception $e) {
                        Log::error("Failed to decode JSON for field: {$field}", ['error' => $e->getMessage()]);
                    }
                }
            }
            $request->merge($requestData);

            $validatedUser = $request->validate([
                'username' => 'sometimes|string|max:255|unique:users,username,' . $user->id,
                'email' => 'sometimes|email|unique:users,email,' . $user->id,
                'avatar' => 'sometimes|nullable|image|mimes:jpeg,png,jpg|max:5120',
                'avatar_url' => 'sometimes|nullable|url',
                'bio' => 'sometimes|nullable|string|max:1000',
                'phone' => 'sometimes|nullable|string|max:20',
                'notifications' => 'sometimes|nullable|array',
                'notifications.email' => 'sometimes|nullable|boolean',
                'notifications.app' => 'sometimes|nullable|boolean',
            ]);

            $validatedLearner = $request->validate([
                'fields_of_interest' => 'sometimes|nullable|array',
                'fields_of_interest.*' => 'string|max:255',
                'languages' => 'sometimes|nullable|array',
                'languages.*.name' => 'required|string|max:255',
                'languages.*.code' => 'nullable|string|max:10',
                'certifications' => 'sometimes|nullable|array',
                'certifications.*.name' => 'required|string|max:255',
                'certifications.*.institution' => 'nullable|string|max:255',
                'bank_info' => 'sometimes|nullable|array',
                'bank_info.iban' => 'nullable|string|max:255',
                'bank_info.bankName' => 'nullable|string|max:255',
                'bank_info.paymentMethod' => 'nullable|string|max:255',
            ]);

            // Handle avatar
            if ($request->hasFile('avatar')) {
                if ($user->avatar && Storage::disk('public')->exists(str_replace('/storage/', '', $user->avatar))) {
                    Storage::disk('public')->delete(str_replace('/storage/', '', $user->avatar));
                }
                $path = $request->file('avatar')->store('avatars', 'public');
                $validatedUser['avatar'] = Storage::url($path);
                unset($validatedUser['avatar_url']);
            } elseif ($request->has('avatar_url') && $request->input('avatar_url')) {
                $validatedUser['avatar'] = $request->input('avatar_url');
                unset($validatedUser['avatar_url']);
            } elseif ($request->has('avatar') && $request->input('avatar') === null) {
                if ($user->avatar && Storage::disk('public')->exists(str_replace('/storage/', '', $user->avatar))) {
                    Storage::disk('public')->delete(str_replace('/storage/', '', $user->avatar));
                }
                $validatedUser['avatar'] = null;
                unset($validatedUser['avatar_url']);
            }

            // Handle password
            if ($request->filled('current_password') || $request->filled('new_password')) {
                $request->validate([
                    'current_password' => 'required|string',
                    'new_password' => 'required|string|min:8|confirmed',
                ]);
                if (!Hash::check($request->input('current_password'), $user->password)) {
                    return response()->json(['message' => 'Current password is incorrect'], 422);
                }
                $validatedUser['password'] = Hash::make($request->input('new_password'));
            }

            // Log validated data
            Log::info('Validated user data', ['validatedUser' => $validatedUser]);
            Log::info('Validated learner data', ['validatedLearner' => $validatedLearner]);

            // Update user data if not empty
            if (!empty($validatedUser)) {
                $user->update($validatedUser);
                Log::info('Updated user data', ['user_id' => $user->id, 'data' => $validatedUser]);
            }

            // Ensure learner record exists
            $learner = $user->learner;
            if (!$learner) {
                $learner = Learner::create(['user_id' => $user->id]);
                Log::info('Created new learner record', ['user_id' => $user->id, 'learner_id' => $learner->id]);
            }

            // Update learner data if not empty
            if (!empty($validatedLearner)) {
                $learner->update($validatedLearner);
                Log::info('Updated learner data', ['learner_id' => $learner->id, 'data' => $validatedLearner]);
            }

            // Reload models
            $user = User::find($user->id);
            $learner = $user->learner;

            // Return data matching frontend expectations
            return response()->json([
                'data' => [
                    'username' => $user->username,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'bio' => $user->bio,
                    'phone' => $user->phone,
                    'notifications' => $user->notifications ?? ['email' => true, 'app' => true],
                    'fields_of_interest' => $learner->fields_of_interest ?? [],
                    'languages' => $learner->languages ?? [],
                    'certifications' => $learner->certifications ?? [],
                    'bank_info' => $learner->bank_info ?? null,
                ]
            ], 200);
        } catch (ValidationException $e) {
            Log::error('Validation Error in update settings', [
                'user_id' => $user->id,
                'errors' => $e->errors()
            ]);
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error in update settings', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
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
                    'name' => $user->username,
                    'avatar' => $user->avatar,
                    'bio' => $user->bio,
                ],
                'school' => $user->username,
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


    //--------------------------------------------------------------------------------------


}
