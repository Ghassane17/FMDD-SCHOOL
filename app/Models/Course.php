<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Course
 * 
 * @property int $id
 * @property string $title
 * @property string $description
 * @property string|null $cover_image
 * @property string|null $thumbnail_image
 * @property string $niveau
 * @property float $rating
 * @property bool $is_for_members
 * @property string $media_type
 * @property int $instructor_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property User $user
 * @property Collection|CourseEnrollment[] $course_enrollments
 * @property Collection|Lesson[] $lessons
 * @property Collection|Quiz[] $quizzes
 *
 * @package App\Models
 */
class Course extends Model
{
	protected $table = 'courses';

	protected $casts = [
		'rating' => 'float',
		'is_for_members' => 'bool',
		'instructor_id' => 'int'
	];

	protected $fillable = [
		'title',
		'description',
		'cover_image',
		'thumbnail_image',
		'niveau',
		'rating',
		'is_for_members',
		'media_type',
		'instructor_id'
	];

	public function user()
	{
		return $this->belongsTo(User::class, 'instructor_id');
	}

	public function course_enrollments()
	{
		return $this->hasMany(CourseEnrollment::class);
	}

	public function lessons()
	{
		return $this->hasMany(Lesson::class);
	}

	public function quizzes()
	{
		return $this->hasMany(Quiz::class);
	}
}
