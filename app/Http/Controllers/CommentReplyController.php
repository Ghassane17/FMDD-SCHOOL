<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Comment;
use App\Models\CommentReply;
use Illuminate\Support\Facades\Auth;

class CommentReplyController extends Controller
{
    // List all replies for a given comment
    public function getCommentReplies($commentId)
    {
        $replies = CommentReply::with('instructor.user')
                     ->where('comment_id', $commentId)
                     ->orderBy('created_at', 'asc')
                     ->get();

        return response()->json(['replies' => $replies]);
    }

    // Store a new instructor reply
    public function storeReply(Request $request, $commentId)
    {
        $user = Auth::user();
        if ($user->role !== 'instructor') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment = Comment::findOrFail($commentId);
        // check that the instructor owns the course
        if ($comment->course->instructor_id !== $user->instructor->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'reply' => 'required|string|max:2000',
        ]);

        $reply = CommentReply::create([
            'comment_id'    => $commentId,
            'instructor_id' => $user->instructor->id,
            'reply'         => $validated['reply'],
        ]);

        return response()->json(['reply' => $reply], 201);
    }

    // Delete a reply
    public function deleteReply($replyId)
    {
        $user = Auth::user();
        if ($user->role !== 'instructor') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $reply = CommentReply::findOrFail($replyId);
        // check that the instructor owns the course
        if ($reply->instructor->id !== $user->instructor->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $reply->delete();
        return response()->json(['message' => 'Reply deleted successfully'], 200);
    }
}
