<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Learner extends Model
{
    use SoftDeletes;

    protected $fillable = ['user_id', 'courses_enrolled', 'courses_completed', 'last_connection', 'fields_of_interest', 'languages', 'certifications', 'bank_info', 'status'];

    protected $casts = [
        'fields_of_interest' => 'array',
        'languages' => 'array',
        'certifications' => 'array',
        'bank_info' => 'array',
        'status' => 'string'
    ];
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function courseEnrollments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(CourseLearner::class);
    }

    public function courses()
    {
        return $this->belongsToMany(Course::class, 'course_learner')
            ->using(CourseLearner::class)
            ->withPivot('progress', 'exam_success', 'certificate_generated', 'last_accessed')
            ->withTimestamps();
    }
    public function certificates()
    {
        return $this->hasMany(Certificate::class);
    }
}
