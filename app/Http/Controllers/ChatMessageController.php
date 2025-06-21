<?php
// app/Http/Controllers/ChatMessageController.php

namespace App\Http\Controllers;

use App\Models\ChatMessage;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatMessageController extends Controller
{
    /**
     * Display all messages (and their replies) for a given course.
     */
    public function index($courseId)
    {
        $user = Auth::user();

        // Vérifier que l'utilisateur a le droit d'accéder au chat de ce cours
        $course = Course::findOrFail($courseId);
        if ($user->role === 'learner') {
            // Apprenant doit être inscrit
            if (! $course->learners()->where('learner_id', $user->id)->exists()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        } elseif ($user->role === 'instructor') {
            // Instructeur doit être celui du cours
            if ($course->instructor_id !== $user->instructor->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        } else {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Charger tous les messages sans parent et leurs réponses avec les utilisateurs
        $messages = ChatMessage::with([
            'user:id,username,email,role,avatar',
            'replies.user:id,username,email,role,avatar'
        ])
            ->where('course_id', $courseId)
            ->whereNull('parent_message_id')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json(['messages' => $messages], 200);
    }

    /**
     * Store a newly created chat message.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        $data = $request->validate([
            'course_id'         => 'required|exists:courses,id',
            'content'           => 'required|string|max:2000',
            'parent_message_id' => 'nullable|exists:chat_messages,id',
        ]);

        $course = Course::findOrFail($data['course_id']);

        // Vérifier l'inscription / rôle instructeur
        if ($user->role === 'learner') {
            if (! $course->learners()->where('learner_id', $user->id)->exists()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        } elseif ($user->role === 'instructor') {
            if ($course->instructor_id !== $user->instructor->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        } else {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $message = ChatMessage::create([
            'course_id'         => $data['course_id'],
            'user_id'           => $user->id,
            'parent_message_id' => $data['parent_message_id'] ?? null,
            'content'           => $data['content'],
        ]);

        // Charger l'utilisateur pour la réponse avec les champs nécessaires
        $message->load(['user' => function($query) {
            $query->select('id', 'username', 'email', 'role', 'avatar');
        }]);

        return response()->json(['message' => $message], 201);
    }

    /**
     * Update an existing message.
     */
    public function update(Request $request, $courseId, $messageId)
    {
        $user = Auth::user();
        
        $msg = ChatMessage::where('id', $messageId)
            ->where('course_id', $courseId)
            ->firstOrFail();

        // Autoriser seulement l'auteur du message
        if ($msg->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $data = $request->validate([
            'content' => 'required|string|max:2000',
        ]);

        $msg->update(['content' => $data['content']]);

        // Recharger les relations pour une réponse cohérente
        $msg->load('user:id,username,email,role,avatar');

        return response()->json(['message' => $msg], 200);
    }

    /**
     * Remove a message (et ses éventuelles réponses par cascade).
     */
    public function destroy($courseId, $messageId)
    {
        $user = Auth::user();
        
        $msg = ChatMessage::where('id', $messageId)
            ->where('course_id', $courseId)
            ->firstOrFail();

        // Propriétaire ou instructeur du cours
        $canDelete = false;
        if ($msg->user_id === $user->id) {
            $canDelete = true;
        } elseif ($user->role === 'instructor') {
            $course = $msg->course;
            if ($course && $course->instructor_id === $user->instructor->id) {
                $canDelete = true;
            }
        }

        if (! $canDelete) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $msg->delete();
        return response()->json(['message' => 'Deleted successfully'], 200);
    }
}
