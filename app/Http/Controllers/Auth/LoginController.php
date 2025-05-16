<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Learner;
use App\Models\Instructor;        // ← add this
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class LoginController extends Controller
{
    public function login(Request $request): \Illuminate\Http\JsonResponse
    {
        // 1️⃣ Validate incoming request
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        // 2️⃣ Attempt to find the user
        $user = User::where('email', $credentials['email'])->first();

        // 3️⃣ Check password
        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        // 4️⃣ Role-specific logic for learners (unchanged)
        if ($user->role === 'learner') {
            try {
                DB::beginTransaction();
                $learner = Learner::where('user_id', $user->id)->first();
                if ($learner) {
                    $learner->update(['last_connection' => Carbon::now()]);
                }
                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                \Log::error('Failed to update last_connection: ' . $e->getMessage());
            }
        }

        // 5️⃣ Create new personal access token
        $token = $user->createToken('auth-token')->plainTextToken;

        // 6️⃣ Build base response with user info
        $responseData = [
            'message' => 'Login successful',
            'token'   => $token,
            'user'    => [
                'id'       => $user->id,
                'username' => $user->username,
                'email'    => $user->email,
                'avatar'   => $user->avatar,
                'bio'      => $user->bio,
                'role'     => $user->role,
            ],
        ];

        // 7️⃣ If instructor, load and append instructor profile
        if ($user->role === 'instructor') {
            $instructor = Instructor::where('user_id', $user->id)->first();

            if ($instructor) {
                $responseData['instructor'] = [
                    'instructor_id'  => $instructor->id,
                    'skills'         => $instructor->skills,         // cast to array
                    'languages'      => $instructor->languages,      // cast to array
                    'certifications' => $instructor->certifications, // cast to array
                    'availability'   => $instructor->availability,   // cast to array
                ];
            }
        }

        // 8️⃣ If learner, append learner profile (unchanged structure)
        if ($user->role === 'learner' && isset($learner)) {
            $responseData['learner'] = [
                'learner_id'        => $learner->id,
                'courses_enrolled'  => $learner->courses_enrolled,
                'courses_completed' => $learner->courses_completed,
                'last_connection'   => $learner->last_connection,
            ];
        }

        return response()->json($responseData, 200);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }
}
