<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Instructor;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;


class InstructorController extends Controller
{
    public function dashboard(Request $request)
    {
        try {
            $user = Auth::user();

            // 1) Only allow instructors
            if ($user->role !== 'instructor') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // 2) Load instructor, courses & payments
            $instructor = Instructor::with([
                'courses:id,title,description,rating,course_thumbnail,level,instructor_id',
                'payments:id,instructor_id,date,amount,description'
            ])
            ->with(['courses.learners'])
            ->where('user_id', $user->id)->first();

            if (!$instructor) {
                return response()->json(['message' => 'Instructor profile not found'], 404);
            }

            // 3) Build response
            return response()->json([
                'instructor_id'  => $instructor->id,
                'user'           => [
                    'name'   => $user->name ?? $user->username,
                    'email'  => $user->email,
                    'avatar' => $user->avatar,
                    'bio'    => $user->bio,
                ],
                'skills'         => $instructor->skills ?? [],
                'languages'      => $instructor->languages ?? [],
                'certifications' => $instructor->certifications ?? [],
                'availability'   => $instructor->availability ?? [],
                'bank_info'      => $instructor->bank_info ?? null,
                'school'         => 'FMDD SCHOOL',
                'total_courses'  => $instructor->courses->count(),
                'total_students' => $instructor->courses->sum(fn($c) => $c->learners->count()),
                'average_rating' => round($instructor->courses->avg('rating'), 1),

                'courses'        => $instructor->courses->map(fn($c) => [
                    'id'          => $c->id,
                    'title'       => $c->title,
                    'description' => $c->description,
                    'students'    => $c->learners->count(),
                    'rating'      => $c->rating,
                    'image'       => $c->course_thumbnail,
                    'level'       => $c->level,
                    'is_published' => $c->is_published,
                    'duration_min' => $c->duration_min,
                ]),

                'payments'       => $instructor->payments->map(fn($p) => [
                    'id'          => $p->id,
                    'date'        => $p->date,
                    'amount'      => $p->amount,
                    'description' => $p->description,
                ]),
            ], 200);

        } catch (\Exception $e) {
            Log::error('Instructor dashboard error: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while fetching instructor data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    //complete register
    public function completeRegister(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'instructor') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'skills' => 'nullable|array',
            'skills.*' => 'string|max:255',

            'languages' => 'nullable|array',
            'languages.*.name' => 'required|string|max:255',
            'languages.*.code' => 'nullable|string|max:10',

            'certifications' => 'nullable|array',
            'certifications.*.name' => 'required|string|max:255',
            'certifications.*.institution' => 'nullable|string|max:255',

            'availability' => 'nullable|array',
            // You can add more detailed validation for availability if needed

            'bank_info' => 'nullable|array',
            'bank_info.iban' => 'nullable|string|max:255',
            'bank_info.bankName' => 'nullable|string|max:255',
            'bank_info.paymentMethod' => 'nullable|string|max:255',
        ]);

        $instructor = $user->instructor;

        if (!$instructor) {
            return response()->json(['message' => 'Instructor profile not found.'], 404);
        }

        $instructor->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'instructor' => $instructor->fresh()
        ]);
    }

    //profile update (name, email, bio) & password change
    public function profile(Request $request)
    {
        try {
            $user = Auth::user();
            
            // Check if user is authenticated
            if (!$user) {
                return response()->json(['message' => 'Unauthorized - User not authenticated'], 401);
            }

            // Check if user is an instructor
            if ($user->role !== 'instructor') {
                return response()->json(['message' => 'Unauthorized - User is not an instructor'], 403);
            }

            // 2) Validate the request
            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'email' => [
                    'sometimes',
                    'email',
                    'max:255',
                    Rule::unique('users')->ignore($user->id)
                ],
                'bio' => 'sometimes|string|max:1000',
                'current_password' => 'required_with:new_password|string',
                'new_password' => 'required_with:current_password|string|min:8|confirmed',
                'avatar' => 'sometimes|file|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
            ]);

            // 3) Handle password change if requested
            if (isset($validated['current_password'])) {
                if (!Hash::check($validated['current_password'], $user->password)) {
                    return response()->json(['message' => 'Current password is incorrect'], 422);
                }
                $user->password = Hash::make($validated['new_password']);
            }

            // 4) Handle avatar upload
            if ($request->hasFile('avatar')) {
                // Delete old avatar if exists
                if ($user->avatar) {
                    $oldAvatarPath = str_replace('/storage/', '', $user->avatar);
                    if (Storage::disk('public')->exists($oldAvatarPath)) {
                        Storage::disk('public')->delete($oldAvatarPath);
                    }
                }

                // Store new avatar
                $avatarPath = $request->file('avatar')->store('avatars', 'public');
                $user->avatar = '/storage/' . $avatarPath;
            }

            // 5) Update user profile
            $updateData = [];
            
            if (isset($validated['name'])) {
                $updateData['username'] = $validated['name'];
            }
            if (isset($validated['email'])) {
                $updateData['email'] = $validated['email'];
            }
            if (isset($validated['bio'])) {
                $updateData['bio'] = $validated['bio'];
            }
            if (isset($user->avatar)) {
                $updateData['avatar'] = $user->avatar;
            }

            // Only update if there are changes
            if (!empty($updateData)) {
                \App\Models\User::where('id', $user->id)->update($updateData);
                // Refresh user data
                $user = \App\Models\User::find($user->id);
            }

            // 6) Return updated user data
            return response()->json([
                'message' => 'Profile updated successfully',
                'instructor' => [
                    'user' => [
                        'name' => $validated['name'] ?? $user->username,
                        'email' => $validated['email'] ?? $user->email,
                        'bio' => $validated['bio'] ?? $user->bio,
                        'avatar' => $user->avatar,
                    ]
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Instructor profile update error: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while updating the profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateBankInfo(Request $request)
    {
        try {
            $user = Auth::user();

            // 1) Only allow instructors
            if ($user->role !== 'instructor') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // 2) Validate the request
            $validated = $request->validate([
                'bank_info' => 'required|array',
                'bank_info.*' => 'required|string|max:255',
            ]);

            // 3) Update instructor bank information
            $instructor = Instructor::where('user_id', $user->id)->first();
            $instructor->bank_info = $validated['bank_info'];
            $instructor->save();

            // 4) Return updated bank information
            return response()->json([
                'message' => 'Bank information updated successfully',
                'bank_info' => $instructor->bank_info,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Instructor bank info update error: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while updating the bank information',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getInstructorStatistics()
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'instructor') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $instructor = Instructor::where('user_id', $user->id)->first();
        if (!$instructor) {
            return response()->json(['message' => 'Instructor profile not found'], 404);
        }

        // Make sure to import the Course model at the top of the file:
        // use App\Models\Course;

        $courses = \App\Models\Course::where('instructor_id', $instructor->id)->get();
        $totalCourses = $courses->count();
        $totalStudents = $courses->sum('students_count') ?? 0;
        $averageRating = $courses->whereNotNull('rating')->where('rating', '!=', 0)->avg('rating');
        return response()->json([
            'totalCourses' => $totalCourses,
            'totalStudents' => $totalStudents,
            'averageRating' => $averageRating
        ], 200);

    }

    public function updateInstructorSkills(Request $request)
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'instructor') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $instructor = Instructor::where('user_id', $user->id)->first();
        if (!$instructor) {
            return response()->json(['message' => 'Instructor profile not found'], 404);
        }
        $instructor->skills = $request->input('skills');
        $instructor->save();
        return response()->json(['message' => 'Skills updated successfully'], 200);
    }

    public function updateInstructorLanguages(Request $request)
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'instructor') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $instructor = Instructor::where('user_id', $user->id)->first();
        if (!$instructor) {
            return response()->json(['message' => 'Instructor profile not found'], 404);
        }
        $instructor->languages = $request->input('languages');
        $instructor->save();
        return response()->json(['message' => 'Languages updated successfully'], 200);
    }

    public function updateInstructorCertifications(Request $request)
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'instructor') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $instructor = Instructor::where('user_id', $user->id)->first();
        if (!$instructor) {
            return response()->json(['message' => 'Instructor profile not found'], 404);
        }
        $instructor->certifications = $request->input('certifications');
        $instructor->save();
        return response()->json(['message' => 'Certifications updated successfully'], 200);
    }

    public function getInstructorComments()
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'instructor') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $instructor = Instructor::where('user_id', $user->id)->first();
            if (!$instructor) {
                return response()->json(['message' => 'Instructor profile not found'], 404);
            }

            // Get all courses for this instructor with their comments
            $courses = \App\Models\Course::with(['comments' => function($query) {
                $query->with('user:id,username,avatar')
                      ->orderBy('created_at', 'desc');
            }])
            ->where('instructor_id', $instructor->id)
            ->get();

            // Format the response
            $formattedComments = [];
            foreach ($courses as $course) {
                foreach ($course->comments as $comment) {
                    $formattedComments[] = [
                        'id' => $comment->id,
                        'user' => $comment->user->username ?? 'Unknown User',
                        'user_avatar' => $comment->user->avatar,
                        'course' => $course->title,
                        'course_id' => $course->id,
                        'rating' => $comment->rating ?? 0,
                        'text' => $comment->text ?? '',
                        'date' => $comment->created_at ? $comment->created_at->format('d M Y | H:i') : 'Unknown Date',
                        'replies' => $comment->replies ?? []
                    ];
                }
            }

            return response()->json([
                'comments' => $formattedComments
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error fetching instructor comments: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while fetching comments',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

        
