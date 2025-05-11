<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Learner;
use Illuminate\Support\Facades\Auth;

class LearnerController extends Controller
{
    public function dashboard(Request $request)
    {
        $user = Auth::user();
        if ($user->role !== 'learner') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $learner = Learner::with(['courses' => function ($query) {
            $query->select('courses.id', 'courses.title', 'courses.description', 'course_learner.progress');
        }])->where('user_id', $user->id)->first();

        if (!$learner) {
            return response()->json(['message' => 'Learner profile not found'], 404);
        }

        return response()->json([
            'learner_id' => $learner->id,
            'courses_enrolled' => $learner->courses_enrolled,
            'courses_completed' => $learner->courses_completed,
            'last_connection' => $learner->last_connection,
            'user' => [
                'name' => $user->name,
                'avatar' => $user->avatar,
                'bio' => $user->bio,
            ],
            'school' => 'FMDD SCHOOL',
            'enrolled_courses' => $learner->courses->map(function ($course) {
                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'description' => $course->description,
                    'course_thumbnail' => $course->course_thumbnail,
                    'progress' => $course->pivot->progress,
                ];
            }),
        ], 200);
    }
}
