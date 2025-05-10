<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    public function login(Request $request)
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

        // 4️⃣ Revoke old tokens if you wish (optional)
        // $user->tokens()->delete();

        // 5️⃣ Create a new personal access token
        $token = $user->createToken('auth-token')->plainTextToken;

        // 6️⃣ Return user data + token
        return response()->json([
            'message' => 'Login successful',
            'user'    => [
                'id'       => $user->id,
                'username' => $user->username,
                'email'    => $user->email,
                'role'     => $user->role,
            ],
            'token'   => $token,
        ], 200);
    }

    public function logout(Request $request)
    {
        // Revoke the token that was used to authenticate the current request
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }
}
