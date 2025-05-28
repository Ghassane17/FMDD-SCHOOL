<?php

namespace App\Models;

use App\Http\Resources\CourseIndex;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Module extends Model
{
    protected $fillable = [
        'course_id',
        'title',
        'type',
        'text_content',
        'file_path',

        'order',
        'duration'
    ];

    protected $casts = [
        'order' => 'integer',
        'duration' => 'integer'
    ];

    /**
     * Get the course that owns the module.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function resources(): HasMany
    {
        return $this->hasMany(CourseIndex::class); // that relation was made to return course dashboard elements and it doesnt have a relation with the course Recourses
    }

    /**
     * Get the quiz questions for this module.
     */
    public function quizQuestions(): HasMany
    {
        return $this->hasMany(QuizQuestion::class);
    }
}
