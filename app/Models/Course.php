<?php

namespace App\Models;

use App\Models\Resource;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Reliese\Coders\Model\Relations\HasMany;

class Course extends Model
{
    protected $fillable = [
        'title',
        'description',
        'instructor_id',
        '',
        'level',
        'rating',
        'duration_min',
        'category',
        'is_published'
    ];

    protected $appends = ['students_count'];

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
        return $this->belongsToMany(Learner::class, 'course_learner', 'course_id', 'learner_id')
            ->withPivot('progress', 'exam_success', 'certificate_generated', 'last_accessed')
            ->withTimestamps()
            ->using(CourseLearner::class);
    }

    public function instructor()
    {
        return $this->belongsTo(Instructor::class)->with('user');
    }

    /**
     * Get the number of students enrolled in this course
     *
     * @return int
     */
    public function getStudentsCountAttribute(): int
    {
        return $this->enrollments()->count();
    }

    public function modules(): \Illuminate\Database\Eloquent\Relations\HasMany|Course
    {
        return $this->hasMany(Module::class)->orderBy('order');
    }

    public function comments(): \Illuminate\Database\Eloquent\Relations\HasMany|Course
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Get the resources for the course.
     */
    public function resources(): \Illuminate\Database\Eloquent\Relations\HasMany|Course
    {
        return $this->hasMany(Resource::class);
    }

    public function exam(): Course|\Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Exam::class);
    }
    public function certificates()
    {
        return $this->hasMany(Certificate::class);
    }
}
