<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $fillable = ['title', 'description', 'instructor_id', 'course_thumbnail', 'level', 'students', 'rating'];

    public function instructor(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Instructor::class, 'instructor_id');
    }

    public function instructorProfile(): \Illuminate\Database\Eloquent\Relations\HasOneThrough
    {
        return $this->hasOneThrough(
            Instructor::class,
            User::class,
            'id',         // Foreign key on the users table
            'user_id',    // Foreign key on the instructors table
            'instructor_id', // Local key on the courses table
            'id'          // Local key on the users table
        );
    }

    public function enrollments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(CourseLearner::class);
    }

    public function learners()
    {
        return $this->belongsToMany(Learner::class, 'course_learner')
            ->withPivot('progress', 'last_accessed')
            ->withTimestamps()
            ->using(CourseLearner::class);
    }
}
