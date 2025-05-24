<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizQuestion extends Model
{
    protected $fillable = [
        'module_id',
        'question',
        'options',
        'correct_option'
    ];

    protected $casts = [
        'options' => 'array',
        'correct_option' => 'integer'
    ];

    /**
     * Get the module that owns the quiz question.
     */
    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }
} 