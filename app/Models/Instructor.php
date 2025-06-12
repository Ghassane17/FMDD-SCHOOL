<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Instructor extends Model
{
    // Si vous n'utilisez pas les timestamps par défaut, décommentez :
    // public $timestamps = false;

    // 1‑à‑1 avec User
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // 1‑à‑n avec Course
    public function courses(): HasMany
    {
        return $this->hasMany(Course::class);
    }

    // 1‑à‑n avec Comment
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    // 1‑à‑n avec Payment
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    // 1‑à‑n avec Availability
    public function availability(): HasMany
    {
        return $this->hasMany(Availability::class);
    }

    // 1‑à‑n avec CommentReply
    public function replies(): HasMany
    {
        return $this->hasMany(CommentReply::class);
    }

    /**
     * Les attributs assignables en masse.
     */
    protected $fillable = [
        'user_id',
        'skills',
        'languages',
        'certifications',
        'availability',
        'bank_info',
    ];

    /**
     * Caster automatiquement les colonnes JSON en tableaux PHP.
     */
    protected $casts = [
        'skills'         => 'array',
        'languages'      => 'array',
        'certifications' => 'array',
        'availability'   => 'array',
        'bank_info'      => 'array',
    ];
}
