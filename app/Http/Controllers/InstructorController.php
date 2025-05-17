<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Instructor;
use Illuminate\Support\Facades\Auth;

class InstructorController extends Controller
{
    public function dashboard(Request $request)
    {
        $user = Auth::user();

        // 1) Only allow instructors
        if ($user->role !== 'instructor') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // 2) Load instructor, courses & payments
        $instructor = Instructor::with([
            'courses:id,title,description,students,rating,image,level,instructor_id',
            'payments:id,instructor_id,month,amount'
        ])->where('user_id', $user->id)->first();

        if (!$instructor) {
            return response()->json(['message' => 'Instructor profile not found'], 404);
        }
        // 3) Build response
        return response()->json([
            'instructor_id'  => $instructor->id,
            'user'           => [
                'name'   => $user->name,
                'avatar' => $user->avatar,
                'bio'    => $user->bio,
            ],
            'skills'         => json_decode($instructor->skills, true)      ?? [],
            'languages'      => json_decode($instructor->languages, true)   ?? [],
            'school'         => 'FMDD SCHOOL',
            'total_courses'  => $instructor->courses->count(),
            'total_students' => $instructor->courses->sum('students'),
            'average_rating' => round($instructor->courses->avg('rating'), 1),

            'courses'        => $instructor->courses->map(fn($c) => [
                'id'          => $c->id,
                'title'       => $c->title,
                'description' => $c->description,
                'students'    => $c->students,
                'rating'      => $c->rating,
                'image'       => $c->image,
                'level'       => $c->level,
            ]),

            'payments'       => $instructor->payments->map(fn($p) => [
                'id'     => $p->id,
                'month'  => $p->month,
                'amount' => $p->amount,
            ]),

            'bank_info'      => json_decode($instructor->bank_info, true)   ?? null,
        ], 200);
    }
}
