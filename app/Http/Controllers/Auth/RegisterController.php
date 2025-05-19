<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Instructor;
use App\Models\Learner;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

class RegisterController extends Controller
{
    public function register(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            // Validate base user data
            $validated = $request->validate([
                'username' => 'required|string|max:255|unique:users',
                'email' => 'required|email|unique:users',
                'password' => 'required|string|min:6|confirmed',
                'role' => 'required|in:learner,instructor',
                'avatar' => 'nullable|url',
                'bio' => 'nullable|string|max:1000',
                'phone' => 'nullable|string|max:20',
            ]);

            // Start database transaction
            DB::beginTransaction();

            // Create user record
            $user = User::create([
                'username' => $validated['username'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'],
                'avatar' => $validated['avatar'] ?? null,
                'bio' => $validated['bio'] ?? null,
                'phone' => $validated['phone'] ?? null,
            ]);

            // Handle role-specific data
            if ($user->role == 'learner') {
                $validatedLearner = $request->validate([
                    'fields_of_interest' => 'nullable|string|max:500',
                    'diploma' => 'nullable|string|max:255',
                ]);

                Learner::create([
                    'user_id' => $user->id,
                    'fields_of_interest' => $validatedLearner['fields_of_interest'] ?? null,
                    'diploma' => $validatedLearner['diploma'] ?? null,
                ]);
            } elseif ($user->role == 'instructor') {
                $validatedInstructor = $request->validate([
                    'skills' => 'nullable|json',
                    'languages' => 'nullable|json',
                    'certifications' => 'nullable|json',
                    'availability' => 'nullable|json',
                    'bank_info' => 'nullable|string|max:500',
                ]);

                Instructor::create([
                    'user_id' => $user->id,
                    'skills' => $validatedInstructor['skills'] ?? null,
                    'languages' => $validatedInstructor['languages'] ?? null,
                    'certifications' => $validatedInstructor['certifications'] ?? null,
                    'availability' => $validatedInstructor['availability'] ?? null,
                    'bank_info' => $validatedInstructor['bank_info'] ?? null,
                ]);
            }

            // Generate authentication token
            $token = $user->createToken('auth-token')->plainTextToken;

            // Commit transaction
            DB::commit();

            // Return successful response
            return response()->json([
                'message' => 'Registration successful',
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
                'token' => $token,
            ], 201);

        } catch (ValidationException $e) {
            // Handle validation errors
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            // Handle other exceptions
            DB::rollBack();
            Log::error('Registration error: ' . $e->getMessage());

            return response()->json([
                'message' => 'Registration failed',
                'error' => 'An unexpected error occurred. Please try again later.',
            ], 500);
        }
    }
}
