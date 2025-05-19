<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Learner extends Model
{
    use SoftDeletes;

    protected $fillable = ['user_id', 'courses_enrolled', 'courses_completed', 'last_connection'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function courseEnrollments()
    {
        return $this->hasMany(CourseLearner::class);
    }

    public function courses()
    {
        return $this->belongsToMany(Course::class, 'course_learner')
            ->using(CourseLearner::class)
            ->withPivot('progress' , 'last_accessed')
            ->withTimestamps();
    }
}
