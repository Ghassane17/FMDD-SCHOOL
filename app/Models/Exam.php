<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Exam extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'course_id',
        'title',
        'instructions',
        'duration_min',
        'passing_score',
        'max_tentatives'
    ];

    protected $casts = [
        'duration_min' => 'integer',
        'passing_score' => 'integer',
        'max_tentatives' => 'integer'
    ];

    /**
     * Get the course that owns the exam.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the questions for the exam.
     */
    public function questions(): HasMany
    {
        return $this->hasMany(ExamQuestion::class);
    }
}
