<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\URL;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_email_verification_with_valid_link()
    {
        // Create an unverified user
        $user = User::factory()->create([
            'email_verified_at' => null,
        ]);

        // Generate verification URL
        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->getKey(), 'hash' => sha1($user->getEmailForVerification())]
        );

        // Extract the path from the URL
        $path = parse_url($verificationUrl, PHP_URL_PATH);
        $query = parse_url($verificationUrl, PHP_URL_QUERY);
        $fullPath = $path . '?' . $query;

        // Make the request
        $response = $this->get($fullPath);

        // Should redirect to success page
        $response->assertRedirect();
        $this->assertStringContainsString('verification-success', $response->headers->get('Location'));

        // User should now be verified
        $this->assertTrue($user->fresh()->hasVerifiedEmail());
    }

    public function test_email_verification_with_invalid_hash()
    {
        // Create an unverified user
        $user = User::factory()->create([
            'email_verified_at' => null,
        ]);

        // Generate verification URL with wrong hash
        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->getKey(), 'hash' => 'invalid-hash']
        );

        // Extract the path from the URL
        $path = parse_url($verificationUrl, PHP_URL_PATH);
        $query = parse_url($verificationUrl, PHP_URL_QUERY);
        $fullPath = $path . '?' . $query;

        // Make the request
        $response = $this->get($fullPath);

        // Should redirect to error page
        $response->assertRedirect();
        $this->assertStringContainsString('verification-error', $response->headers->get('Location'));

        // User should still be unverified
        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_email_verification_with_already_verified_user()
    {
        // Create a verified user
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        // Generate verification URL
        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->getKey(), 'hash' => sha1($user->getEmailForVerification())]
        );

        // Extract the path from the URL
        $path = parse_url($verificationUrl, PHP_URL_PATH);
        $query = parse_url($verificationUrl, PHP_URL_QUERY);
        $fullPath = $path . '?' . $query;

        // Make the request
        $response = $this->get($fullPath);

        // Should redirect to success page with already verified message
        $response->assertRedirect();
        $this->assertStringContainsString('verification-success', $response->headers->get('Location'));
    }
}
