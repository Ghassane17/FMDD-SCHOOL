<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class CourseLearner extends Pivot
{
    protected $table = 'course_learner';

    protected $fillable = ['learner_id', 'course_id', 'progress', 'last_accessed'];

    protected $casts = [
        'last_accessed' => 'datetime',
    ];

    public function learner()
    {
        return $this->belongsTo(Learner::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
