<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class CourseEnrollment
 * 
 * @property int $id
 * @property int $learner_id
 * @property int $course_id
 * @property Carbon $enrolled_at
 * @property Carbon|null $last_accessed_at
 * @property Carbon|null $completed_at
 * @property float $progress_percentage
 * @property int $completed_lessons_count
 * @property int $total_time_spent_seconds
 * @property int|null $last_lesson_id
 * @property string|null $last_position
 * @property float|null $average_quiz_score
 * @property int $attempts_count
 * @property string $status
 * @property bool $certificate_issued
 * @property Carbon|null $certificate_issued_at
 * @property string|null $certificate_number
 * @property int|null $rating
 * @property string|null $feedback
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Course $course
 * @property Lesson|null $lesson
 * @property Learner $learner
 *
 * @package App\Models
 */
class CourseEnrollment extends Model
{
	protected $table = 'course_enrollments';

	protected $casts = [
		'learner_id' => 'int',
		'course_id' => 'int',
		'enrolled_at' => 'datetime',
		'last_accessed_at' => 'datetime',
		'completed_at' => 'datetime',
		'progress_percentage' => 'float',
		'completed_lessons_count' => 'int',
		'total_time_spent_seconds' => 'int',
		'last_lesson_id' => 'int',
		'average_quiz_score' => 'float',
		'attempts_count' => 'int',
		'certificate_issued' => 'bool',
		'certificate_issued_at' => 'datetime',
		'rating' => 'int'
	];

	protected $fillable = [
		'learner_id',
		'course_id',
		'enrolled_at',
		'last_accessed_at',
		'completed_at',
		'progress_percentage',
		'completed_lessons_count',
		'total_time_spent_seconds',
		'last_lesson_id',
		'last_position',
		'average_quiz_score',
		'attempts_count',
		'status',
		'certificate_issued',
		'certificate_issued_at',
		'certificate_number',
		'rating',
		'feedback'
	];

	public function course()
	{
		return $this->belongsTo(Course::class);
	}

	public function lesson()
	{
		return $this->belongsTo(Lesson::class, 'last_lesson_id');
	}

	public function learner()
	{
		return $this->belongsTo(Learner::class);
	}
}
