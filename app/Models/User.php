<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Class User
 *
 * @property int $id
 * @property string $username
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property string|null $avatar
 * @property string|null $bio
 * @property string $role
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 *
 * @property Collection|Course[] $courses
 * @property Collection|Learner[] $learners
 * @property Collection|Session[] $sessions
 *
 * @package App\Models
 */
class User extends Authenticatable
{
	use HasApiTokens, Notifiable, HasFactory, SoftDeletes;

	protected $table = 'users';

	protected $casts = [
		'email_verified_at' => 'datetime',
		'password' => 'hashed',
		'notifications' => 'array',
	];

	protected $hidden = [
		'password',
		'remember_token'
	];

	protected $fillable = [
		'username',
		'email',
		'password',
		'role',
		'avatar',
		'bio',
		'phone',
		'notifications',
	];


	public function courses()
	{
		return $this->belongsToMany(Course::class, 'course_learner', 'learner_id', 'course_id')
			->withPivot('progress', 'last_accessed')
			->withTimestamps()
			->using(CourseLearner::class);
	}
	public function learner(): \Illuminate\Database\Eloquent\Relations\HasOne
	{
		return $this->hasOne(Learner::class);
	}

	public function instructor(): \Illuminate\Database\Eloquent\Relations\HasOne
	{
		return $this->hasOne(Instructor::class);
	}

	public function isLearner(): bool
	{
		return $this->role === 'learner';
	}

	public function isInstructor(): bool
	{
		return $this->role === 'instructor';
	}

	public function sessions(): \Illuminate\Database\Eloquent\Relations\HasMany
	{
		return $this->hasMany(Session::class);
	}

	/**
	 * Get the comments written by the user.
	 */
	public function comments(): \Illuminate\Database\Eloquent\Relations\HasMany
	{
		return $this->hasMany(Comment::class);
	}
}
