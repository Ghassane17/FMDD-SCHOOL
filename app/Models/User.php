<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class User
 * 
 * @property int $id
 * @property string $username
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property string|null $profile_image
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
class User extends Model
{
	protected $table = 'users';

	protected $casts = [
		'email_verified_at' => 'datetime'
	];

	protected $hidden = [
		'password',
		'remember_token'
	];

	protected $fillable = [
		'username',
		'email',
		'email_verified_at',
		'password',
		'remember_token',
		'profile_image',
		'bio',
		'role'
	];

	public function courses()
	{
		return $this->hasMany(Course::class, 'instructor_id');
	}

	public function learners()
	{
		return $this->hasMany(Learner::class);
	}

	public function sessions()
	{
		return $this->hasMany(Session::class);
	}
}
