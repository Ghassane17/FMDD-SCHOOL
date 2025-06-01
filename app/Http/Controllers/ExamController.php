<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Exam;
use App\Models\ExamQuestion;
use App\Models\Learner;
use App\Models\QuizQuestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class ExamController extends Controller
{
    public function getExam(Course $course): JsonResponse
    {
        try {
            $learner = Auth::user()?->learner;
            if (!$learner) {
                Log::warning('No learner profile for user', ['user_id' => Auth::id()]);
                return response()->json([
                    'success' => false,
                    'message' => 'Profil apprenant introuvable.',
                ], 403);
            }

            if (!$course->learners()->where('learner_id', $learner->id)->exists()) {
                Log::warning('Unauthorized exam access', [
                    'user_id' => Auth::id(),
                    'course_id' => $course->id,
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Vous devez être inscrit au cours.',
                ], 403);
            }

            $exam = $course->exam()->with('questions')->first();
            if (!$exam) {
                Log::warning('No exam found for course', ['course_id' => $course->id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Aucun examen final trouvé.',
                ], 404);
            }

            if ($exam->questions->isEmpty()) {
                Log::warning('No questions available.', ['exam_id' => $exam->id]);
                return response()->json([
                    'success' => false,
                    'message' => 'No questions available for this exam.',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'exam' => [
                        'id' => $exam->id,
                        'title' => $exam->title,
                        'instructions' => $exam->instructions,
                        'duration_min' => $exam->duration_min,
                        'passing_score' => $exam->passing_score,
                        'questions' => $exam->questions->map(
                            fn($question) => [
                                'id' => $question->id,
                                'question' => $question->question_text,
                                'options' => is_array($question->options) ? $question->options : json_decode($question->options, true),
                                'correct_index' => null,
                            ],
                        ),
                    ],
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Error retrieving exam:', [
                'course_id' => $course->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur serveur.',
            ], 500);
        }
    }

    public function submitExam(Request $request, Course $course): JsonResponse
    {
        try {
            Log::info('Submitting exam for course', [
                'course_id' => $course->id,
                'user_id' => Auth::id(),
            ]);

            // Validate authentication
            if (!Auth::check()) {
                Log::warning('Unauthenticated user attempting to submit exam', ['course_id' => $course->id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required.',
                ], 401);
            }

            // Get authenticated user
            $user = Auth::user();

            // Check if user is a learner
            $learner = Learner::where('user_id', $user->id)->first();
            if (!$learner) {
                Log::warning('User is not a learner', ['user_id' => $user->id]);
                return response()->json([
                    'success' => false,
                    'message' => 'User must be registered as a learner.',
                ], 403);
            }

            // Check enrollment via course_learner
            if (!$course->learners()->where('learner_id', $learner->id)->exists()) {
                Log::warning('User not enrolled in course', [
                    'user_id' => $user->id,
                    'learner_id' => $learner->id,
                    'course_id' => $course->id,
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'You are not enrolled in this course.',
                ], 403);
            }

            // Fetch exam for the course
            $exam = Exam::where('course_id', $course->id)->first();
            if (!$exam) {
                Log::warning('No exam found for course', ['course_id' => $course->id]);
                return response()->json([
                    'success' => false,
                    'message' => 'No exam found for this course.',
                ], 404);
            }

            // Validate payload
            $validated = $request->validate([
                'answers' => 'required|array',
                'answers.*' => 'required|integer|min:0',
            ]);

            // Fetch exam questions
            $questions = ExamQuestion::where('exam_id', $exam->id)->get();
            if ($questions->isEmpty()) {
                Log::warning('No questions found for exam', ['exam_id' => $exam->id]);
                return response()->json([
                    'success' => false,
                    'message' => 'No questions available for this exam.',
                ], 404);
            }

            // Validate all questions answered
            $questionIds = $questions->pluck('id')->toArray();
            $answeredIds = array_keys($validated['answers']);
            if (array_diff($questionIds, $answeredIds)) {
                Log::warning('Not all questions answered', [
                    'course_id' => $course->id,
                    'answered' => $answeredIds,
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'All questions must be answered.',
                ], 422);
            }

            // Calculate score
            $score = 0;
            $questionsWithAnswers = [];
            foreach ($questions as $question) {
                $selectedOption = $validated['answers'][$question->id] ?? null;
                if ($selectedOption === $question->correct_index) {
                    $score++;
                }
                $questionsWithAnswers[$question->id] = [
                    'correct_index' => $question->correct_index
                ];
            }

            Log::info('Exam processed successfully', [
                'exam_id' => $exam->id,
                'user_id' => $user->id,
                'score' => $score,
                'total' => $questions->count(),
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'score' => $score,
                    'total' => $questions->count(),
                    'percentage' => ($score / $questions->count()) * 100,
                    'passed' => ($score / $questions->count() * 100) >= $exam->passing_score,
                    'questions' => $questionsWithAnswers
                ],
            ]);
        } catch (ValidationException $e) {
            Log::error('Validation error in submitExam', [
                'course_id' => $course->id,
                'errors' => $e->errors(),
                'user_id' => Auth::id(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Unexpected error in submitExam', [
                'course_id' => $course->id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'An unexpected error occurred.',
            ], 500);
        }
    }
}
