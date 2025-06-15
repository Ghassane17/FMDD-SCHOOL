<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class CourseLearner extends Pivot
{
    protected $table = 'course_learner';

    // Allow timestamps on this pivot model
    public $timestamps = true;

    protected $casts = [
        'course_id' => 'int',
        'learner_id' => 'int',
        'progress' => 'int',
        'last_accessed' => 'datetime',
        'tentatives' => 'int'
    ];

    protected $fillable = [
        'course_id',
        'learner_id',
        'progress',
        'last_accessed',
        'tentatives'
    ];


    public function learner(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Learner::class);
    }

    public function course(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Course::class);
    }
}
