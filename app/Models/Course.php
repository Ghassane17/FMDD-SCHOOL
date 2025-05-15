<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $fillable = ['title', 'description', 'instructor_id', 'course_thumbnail', 'level', 'students', 'rating'];

    public function instructor()
    {
        return $this->belongsTo(Ghassane_test_instructor::class, 'instructor_id');
    }

    public function learners()
    {
        return $this->belongsToMany(Learner::class, 'course_learner')
            ->withPivot('progress', 'last_accessed')
            ->withTimestamps()
            ->using(CourseLearner::class);
    }
}
