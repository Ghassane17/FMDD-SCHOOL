<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL; // Pour générer le lien signé


class VerifyEmailLink extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $notifiable->getKey(), 'hash' => sha1($notifiable->getEmailForVerification())]
        );

        return (new MailMessage)
                    ->subject('Vérifiez votre adresse email pour FMDD SCHOOL')
                    ->line('Bonjour ' . $notifiable->username . ',')
                    ->line('Merci de vous être inscrit à FMDD SCHOOL. Veuillez cliquer sur le bouton ci-dessous pour vérifier votre adresse email.')
                    ->action('Vérifier mon Email', $verificationUrl) // Le bouton avec le lien de vérification
                    ->line('Ce lien est valide pendant 60 minutes.')
                    ->line('Si vous n\'avez pas créé de compte, vous pouvez ignorer cet email.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
