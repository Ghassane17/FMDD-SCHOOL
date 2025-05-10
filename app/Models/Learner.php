<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Class Learner
 * 
 * @property int $id
 * @property int $user_id
 * @property int $courses_enrolled
 * @property int $courses_completed
 * @property int $total_lessons_completed
 * @property Carbon|null $last_connection
 * @property Carbon|null $last_course_access
 * @property Carbon $registration_date
 * @property string|null $learning_preferences
 * @property string|null $content_preferences
 * @property string $language_preference
 * @property string|null $referral_source
 * @property bool $profile_completed
 * @property bool $onboarding_completed
 * @property string $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property string|null $deleted_at
 * 
 * @property User $user
 * @property Collection|CourseEnrollment[] $course_enrollments
 * @property Collection|Member[] $members
 *
 * @package App\Models
 */
class Learner extends Model
{
	use SoftDeletes;
	protected $table = 'learners';

	protected $casts = [
		'user_id' => 'int',
		'courses_enrolled' => 'int',
		'courses_completed' => 'int',
		'total_lessons_completed' => 'int',
		'last_connection' => 'datetime',
		'last_course_access' => 'datetime',
		'registration_date' => 'datetime',
		'profile_completed' => 'bool',
		'onboarding_completed' => 'bool'
	];

	protected $fillable = [
		'user_id',
		'courses_enrolled',
		'courses_completed',
		'total_lessons_completed',
		'last_connection',
		'last_course_access',
		'registration_date',
		'learning_preferences',
		'content_preferences',
		'language_preference',
		'referral_source',
		'profile_completed',
		'onboarding_completed',
		'status'
	];

	public function user()
	{
		return $this->belongsTo(User::class);
	}

	public function course_enrollments()
	{
		return $this->hasMany(CourseEnrollment::class);
	}

	public function members()
	{
		return $this->hasMany(Member::class);
	}
}
