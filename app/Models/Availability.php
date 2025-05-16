<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Availability extends Model
{
    // Mass‐assignable fields
    protected $fillable = [
        'instructor_id',
        'day',    // e.g. 'Lundi', 'Mardi', etc.
        'slots',  // JSON array of time slots, e.g. ["10:00", "14:00"]
    ];

    // Cast slots JSON to a PHP array automatically
    protected $casts = [
        'slots' => 'array',
    ];

    /**
     * Relation back to the instructor owning these availability slots.
     */
    public function instructor(): BelongsTo
    {
        return $this->belongsTo(Instructor::class);
    }
}
