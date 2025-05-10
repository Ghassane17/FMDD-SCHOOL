<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Lesson
 * 
 * @property int $id
 * @property int $course_id
 * @property string $title
 * @property string $media_type
 * @property string|null $media_path
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Course $course
 * @property Collection|CourseEnrollment[] $course_enrollments
 *
 * @package App\Models
 */
class Lesson extends Model
{
	protected $table = 'lessons';

	protected $casts = [
		'course_id' => 'int'
	];

	protected $fillable = [
		'course_id',
		'title',
		'media_type',
		'media_path'
	];

	public function course()
	{
		return $this->belongsTo(Course::class);
	}

	public function course_enrollments()
	{
		return $this->hasMany(CourseEnrollment::class, 'last_lesson_id');
	}
}
