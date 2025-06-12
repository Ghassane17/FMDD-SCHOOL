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

            // Get all user fields except password
            $userData = $user->only([
                'id',
                'username',
                'email',
                'avatar',
                'bio',
                'phone',
                'notifications'
            ]);

            // Get all learner fields
            $learnerData = $learner->only([
                'fields_of_interest',
                'languages',
                'certifications',
                'bank_info'
            ]);

            // Merge user and learner data
            $responseData = array_merge($userData, $learnerData);

            // Ensure arrays are initialized
            $responseData['fields_of_interest'] = $responseData['fields_of_interest'] ?? [];
            $responseData['languages'] = $responseData['languages'] ?? [];
            $responseData['certifications'] = $responseData['certifications'] ?? [];
            $responseData['notifications'] = $responseData['notifications'] ?? ['email' => true, 'app' => true];

            return response()->json($responseData, 200);
        } catch (\Exception $e) {
            Log::error('Error in settings', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
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

            $certificates = $learner->certificates()
                ->with(['course'])
                ->get()
                ->map(function ($certificate) {
                    return [
                        'id' => $certificate->id,
                        'certificate_code' => $certificate->certificate_code,
                        'course_name' => $certificate->course->title,
                        'created_at' => $certificate->created_at,
                        'download_url' => route('certificates.download', $certificate->id),
                        'preview_url' => route('certificates.preview', $certificate->id)
                    ];
                });

            return response()->json([
                'learner_id' => $learner->id,
                'courses_enrolled' => $actualEnrolledCount,
                'courses_completed' => $completedCourses,
                'certificates' => $certificates,
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
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if ($user->role !== 'learner') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $validated = $request->validate([
                'username' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|email|max:255|unique:users,email,' . $user->id,
                'bio' => 'sometimes|nullable|string',
                'avatar' => 'sometimes|nullable|image|mimes:jpeg,png,jpg,gif|max:5120'
            ]);

            // Prepare update data
            $updateData = [];
            if (isset($validated['username'])) $updateData['username'] = $validated['username'];
            if (isset($validated['email'])) $updateData['email'] = $validated['email'];
            if (isset($validated['bio'])) $updateData['bio'] = $validated['bio'];

            // Handle avatar upload
            if ($request->hasFile('avatar')) {
                $avatar = $request->file('avatar');
                $avatarName = time() . '.' . $avatar->getClientOriginalExtension();
                $avatar->move(public_path('avatars'), $avatarName);
                $updateData['avatar'] = 'avatars/' . $avatarName;
            }

            // Only update if there are fields to update
            if (!empty($updateData)) {
                $user->update($updateData);
                $user->refresh();
            }

            return response()->json([
                'message' => 'Profile updated successfully',
                'user' => $user->only(['id', 'username', 'email', 'avatar', 'bio'])
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error updating personal info', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            return response()->json(['message' => 'Error updating profile'], 500);
        }
    }

    /**
     * Update password
     */
    public function updatePassword(Request $request): \Illuminate\Http\JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if ($user->role !== 'learner') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $validated = $request->validate([
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:8|confirmed',
                'new_password_confirmation' => 'required|string'
            ]);

            // Verify current password
            if (!Hash::check($validated['current_password'], $user->password)) {
                return response()->json(['message' => 'Current password is incorrect'], 422);
            }

            // Update password
            $user->update([
                'password' => Hash::make($validated['new_password'])
            ]);

            return response()->json(['message' => 'Password updated successfully'], 200);
        } catch (\Exception $e) {
            Log::error('Error updating password', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            return response()->json(['message' => 'Error updating password'], 500);
        }
    }

    /**
     * Update additional information (fields of interest, languages, certifications, bank info)
     */
    public function updateAdditionalInfo(Request $request): \Illuminate\Http\JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if ($user->role !== 'learner') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $validated = $request->validate([
                'fields_of_interest' => 'sometimes|array',
                'languages' => 'sometimes|array',
                'certifications' => 'sometimes|array'
            ]);

            $learner = Learner::where('user_id', $user->id)->first();
            if (!$learner) {
                return response()->json(['message' => 'Learner profile not found'], 404);
            }

            // Prepare update data
            $updateData = [];
            if (isset($validated['fields_of_interest'])) $updateData['fields_of_interest'] = $validated['fields_of_interest'];
            if (isset($validated['languages'])) $updateData['languages'] = $validated['languages'];
            if (isset($validated['certifications'])) $updateData['certifications'] = $validated['certifications'];

            // Only update if there are fields to update
            if (!empty($updateData)) {
                $learner->update($updateData);
                $learner->refresh();
            }

            return response()->json([
                'message' => 'Additional info updated successfully',
                'learner' => $learner->only(['fields_of_interest', 'languages', 'certifications'])
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error updating additional info', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            return response()->json(['message' => 'Error updating additional info'], 500);
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

    public function getLearnerDashboard()
    {
        $user = auth()->user();

        // Get enrolled courses with progress
        $enrolledCourses = $user->learner->courses()
            ->with(['modules', 'modules.userProgress' => function ($query) use ($user) {
                $query->where('user_id', $user->id);
            }])
            ->get()
            ->map(function ($course) use ($user) {
                $totalModules = $course->modules->count();
                $completedModules = $course->modules->filter(function ($module) {
                    return $module->userProgress->isNotEmpty() && $module->userProgress->first()->is_completed;
                })->count();

                $progress = $totalModules > 0 ? round(($completedModules / $totalModules) * 100) : 0;

                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'description' => $course->description,
                    'progress' => $progress,
                    'last_accessed' => $course->pivot->last_accessed,
                    'course_thumbnail' => $course->course_thumbnail,
                    'level' => $course->level,
                    'students' => $course->students_count,
                    'rating' => $course->rating,
                    'is_completed' => $progress === 100
                ];
            });

        // Get certificates with proper relationships
        $certificates = $user->learner->certificates()
            ->with(['course', 'learner.user'])
            ->get()
            ->map(function ($certificate) {
                return [
                    'id' => $certificate->id,
                    'certificate_code' => $certificate->certificate_code,
                    'course_name' => $certificate->course->title,
                    'created_at' => $certificate->created_at,
                    'download_url' => route('certificates.download', $certificate->id),
                    'preview_url' => route('certificates.preview', $certificate->id, false)
                ];
            });

        // Update learner's last connection
        $user->learner->update(['last_connection' => now()]);

        // Calculate statistics
        $coursesEnrolled = $enrolledCourses->count();
        $coursesCompleted = $enrolledCourses->where('is_completed', true)->count();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'bio' => $user->bio
            ],
            'enrolled_courses' => $enrolledCourses,
            'certificates' => $certificates,
            'courses_enrolled' => $coursesEnrolled,
            'courses_completed' => $coursesCompleted,
            'last_connection' => $user->learner->last_connection
        ]);
    }

    //--------------------------------------------------------------------------------------


    //--------------------------------------------------------------------------------------


    //--------------------------------------------------------------------------------------


}
