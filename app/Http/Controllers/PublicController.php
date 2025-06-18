<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ContactUs;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use App\Models\Course;

class PublicController extends Controller
{
    public function contact(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'subject' => 'required|string|max:255',
                'message' => 'required|string|min:10',
            ]);

            ContactUs::create($validated);

            return response()->json(['message' => 'Contact form submitted successfully'], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Contact form submission error: ' . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }

    public function formations()
    {
        try {
            $courses = Course::with(['instructor.user' => function ($query) {
                $query->select('id', 'username');
            }])
                ->where('is_published', 1)
                ->select([
                    'id',
                    'title',
                    'description',
                    'course_thumbnail',
                    'level',
                    'rating',
                    'instructor_id',
                    'category'
                ])
                ->get()
                ->map(function ($course) {
                    return [
                        'id' => $course->id,
                        'title' => $course->title,
                        'description' => $course->description,
                        'course_thumbnail' => $course->course_thumbnail,
                        'level' => $course->level,
                        'category' => $course->category,
                        'students' => $course->students_count,
                        'rating' => $course->rating,
                        'instructor' => [
                            'username' => $course->instructor->user->username ?? 'Unknown Instructor'
                        ],
                    ];
                });

            return response()->json(['courses' => $courses], 200);
        } catch (\Exception $e) {
            Log::error('Error retrieving all courses!', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Server Error'], 500);
        }
    }

    public function getCategories()
    {
        try {
            $categories = Course::where('is_published', 1)
                ->distinct()
                ->pluck('category')
                ->filter()
                ->sort()
                ->values();
            return response()->json(['categories' => $categories], 200);
        } catch (\Exception $e) {
            Log::error('Error retrieving categories!', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Server Error'], 500);
        }
    }
}
