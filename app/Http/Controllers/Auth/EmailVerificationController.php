<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Auth\Events\Verified;

class EmailVerificationController extends Controller
{
    public function verify($id, $hash)
    {
        // Find the user by ID
        $user = User::findOrFail($id);

        // Verify the hash matches the user's email
        if (!hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            return redirect(env('FRONTEND_URL'));
        }

        // Check if the user's email is already verified
        if ($user->hasVerifiedEmail()) {
            return redirect(env('FRONTEND_URL'));
        }

        // Mark the email as verified
        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
            return redirect(env('FRONTEND_URL'));
        }

        return redirect(env('FRONTEND_URL'));
    }

    /**
     * Resend the email verification notification.
     * Corresponds to: POST /api/email/verification-notification
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function send(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        $user = User::where('email', $request->email)->first();

        // Check if the user's email is already verified
        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Votre email est déjà vérifié.'], 400);
        }

        // Send the verification notification
        // This method is available because the User model implements MustVerifyEmail
        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Un nouveau lien de vérification a été envoyé à votre adresse email.'], 200);
    }    
}
