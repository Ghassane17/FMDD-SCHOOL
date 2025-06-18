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
use Illuminate\Auth\Events\Registered;

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
                'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
                'bio' => 'nullable|string|max:1000',
                'phone' => 'nullable|string|max:20',
            ]);

            if ($request->hasFile('avatar')) {
                $avatarPath = $request->file('avatar')->store('avatars', 'public');
                $validated['avatar'] = '/storage/' . $avatarPath;
            }

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
                'email_verified_at' => null,
            ]);

            event(new Registered($user));

            // Handle role-specific data
            if ($user->role == 'learner') {
                Learner::create([
                    'user_id' => $user->id,
                    'fields_of_interest' => null,
                    'languages' => null,
                    'certifications' =>null,
                    'bank_info' => null,
                ]);
            } elseif ($user->role == 'instructor') {


                Instructor::create([
                    'user_id' => $user->id,
                    'skills' => null,
                    'languages' =>null,
                    'certifications' => null,
                    'availability' =>  null,
                    'bank_info' => null,
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
                    'message' => 'Utilisateur enregistré avec succès. Un lien de vérification a été envoyé à votre adresse email.',
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
