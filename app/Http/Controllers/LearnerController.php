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
use Illuminate\Validation\ValidationException;

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

        $learner = $user->learner;

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
                \App\Models\User::where('id', $user->id)->update($validatedUser);
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
                $query->select('courses.id', 'courses.title', 'courses.course_thumbnail', 'courses.level', 'courses.rating', 'course_learner.progress', 'course_learner.last_accessed')
                    ->withCount('learners as students_count')
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
                $query->select('courses.id', 'courses.title', 'courses.description', 'courses.course_thumbnail', 'courses.level', 'courses.rating', 'course_learner.progress', 'course_learner.last_accessed')
                    ->withCount('learners as students_count');
            }])->where('user_id', $user->id)->first();

            if (!$learner) {
                Log::error('Learner profile not found', ['user_id' => $user->id]);
                return response()->json(['message' => 'Learner profile not found'], 404);
            }

            // Update last_connection
            $learner->update(['last_connection' => now()]);

            // Recalculate courses_enrolled count
            $actualEnrolledCount = $learner->courses()->count();
            if ($actualEnrolledCount !== $learner->courses_enrolled) {
                $learner->update(['courses_enrolled' => $actualEnrolledCount]);
            }

            // Calculate completed courses (courses with 100% progress)
            $completedCourses = $learner->courses->filter(function ($course) {
                return ($course->pivot->progress ?? 0) >= 100;
            })->count();

            // Update courses_completed count
            $learner->update(['courses_completed' => $completedCourses]);

            return response()->json([
                'learner_id' => $learner->id,
                'courses_enrolled' => $actualEnrolledCount,
                'courses_completed' => $completedCourses,
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
                        'students' => $course->students_count,
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

    /**
     * Update personal information (avatar, username, email, bio, phone)
     */
    public function updatePersonalInfo(Request $request): \Illuminate\Http\JsonResponse
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'learner') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            // Log the incoming request data
            Log::info('Update personal info request', [
                'user_id' => $user->id,
                'request_data' => $request->all()
            ]);

            $validated = $request->validate([
                'username' => 'sometimes|string|max:255|unique:users,username,' . $user->id,
                'email' => 'sometimes|email|unique:users,email,' . $user->id,
                'avatar' => 'sometimes|nullable|image|mimes:jpeg,png,jpg|max:5120',
                'bio' => 'sometimes|nullable|string|max:1000',
                'phone' => 'sometimes|nullable|string|max:20',
            ]);

            // Log validated data
            Log::info('Validated data', ['validated' => $validated]);

            // Handle avatar
            if ($request->hasFile('avatar')) {
                if ($user->avatar && Storage::disk('public')->exists(str_replace('/storage/', '', $user->avatar))) {
                    Storage::disk('public')->delete(str_replace('/storage/', '', $user->avatar));
                }
                $path = $request->file('avatar')->store('avatars', 'public');
                $validated['avatar'] = Storage::url($path);
            }

            // Update user data using Eloquent
            $user->update([
                'username' => $validated['username'],
                'email' => $validated['email'],
                'bio' => $validated['bio'],
                'phone' => $validated['phone'],
                'avatar' => $validated['avatar'] ?? $user->avatar
            ]);

            // Refresh user data
            $user->refresh();

            Log::info('Updated user data', [
                'user_id' => $user->id,
                'updated_data' => $user->toArray()
            ]);

            return response()->json([
                'message' => 'Personal information updated successfully',
                'data' => [
                    'username' => $user->username,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'bio' => $user->bio,
                    'phone' => $user->phone,
                ]
            ]);
        } catch (ValidationException $e) {
            Log::error('Validation error in update personal info', [
                'user_id' => $user->id,
                'errors' => $e->errors()
            ]);
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error updating personal info', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }

    /**
     * Update password
     */
    public function updatePassword(Request $request): \Illuminate\Http\JsonResponse
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'learner') {
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

            $user->update([
                'password' => Hash::make($validated['new_password'])
            ]);

            return response()->json([
                'message' => 'Password updated successfully'
            ]);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error updating password', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }

    /**
     * Update additional information (fields of interest, languages, certifications, bank info)
     */
    public function updateAdditionalInfo(Request $request): \Illuminate\Http\JsonResponse
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'learner') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $validated = $request->validate([
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

            $learner = $user->learner;
            if (!$learner) {
                $learner = Learner::create(['user_id' => $user->id]);
            }

            $learner->update($validated);

            return response()->json([
                'message' => 'Additional information updated successfully',
                'data' => [
                    'fields_of_interest' => $learner->fields_of_interest,
                    'languages' => $learner->languages,
                    'certifications' => $learner->certifications,
                    'bank_info' => $learner->bank_info,
                ]
            ]);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error updating additional info', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }

    /**
     * Update notification preferences
     */
    public function updateNotifications(Request $request): \Illuminate\Http\JsonResponse
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'learner') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $validated = $request->validate([
                'notifications' => 'required|array',
                'notifications.email' => 'required|boolean',
                'notifications.app' => 'required|boolean',
            ]);

            $user->update([
                'notifications' => $validated['notifications']
            ]);

            return response()->json([
                'message' => 'Notification preferences updated successfully',
                'data' => [
                    'notifications' => $user->notifications
                ]
            ]);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error updating notifications', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }

    //--------------------------------------------------------------------------------------


    //--------------------------------------------------------------------------------------


}
