<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    /**
     * Store a newly created comment in storage.
     */
    public function store(Request $request, Course $course)
    {
        $validated = $request->validate([
            'text' => 'required|min:5',
            'rating' => 'required|integer|min:1|max:5',
        ]);

        $comment = $course->comments()->create([
            'user_id' => Auth::id(),
            'course_id' => $course->id,
            'text' => $validated['text'],
            'rating' => $validated['rating'],
        ]);
        $averageRating = $course->comments()->avg('rating') ?? 0;
        $course->update(['rating' => round($averageRating, 2)]);


        return response()->json([
            'message' => 'Commentaire ajouté avec succès',
            'comment' => $comment
        ], 201);
    }

    /**
     * Display a listing of comments for a course.
     */
    public function index(Course $course)
    {
        $comments = $course->comments()
            ->with('user:id,name') // Only load necessary user fields
            ->latest()
            ->get();

        return response()->json($comments);
    }

    public function showCourseComments($courseId)
    {
        $comments = Comment::where('course_id', $courseId)
            ->with('user:id,username,avatar')
            ->latest()
            ->take(5)
            ->get();
        return response()->json($comments);
    }
}
