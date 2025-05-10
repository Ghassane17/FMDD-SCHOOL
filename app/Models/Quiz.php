<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Quiz
 * 
 * @property int $id
 * @property int $course_id
 * @property string $title
 * @property string|null $questions
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Course $course
 *
 * @package App\Models
 */
class Quiz extends Model
{
	protected $table = 'quizzes';

	protected $casts = [
		'course_id' => 'int'
	];

	protected $fillable = [
		'course_id',
		'title',
		'questions'
	];

	public function course()
	{
		return $this->belongsTo(Course::class);
	}
}
