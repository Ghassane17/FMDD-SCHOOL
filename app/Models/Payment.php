<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    // Define which fields can be mass-assigned
    protected $fillable = [
        'instructor_id',
        'date',        // payment date (YYYY‑MM‑DD)
        'amount',      // decimal, e.g. 1243.50
        'description', // e.g. "Versement des commissions - Mars 2025"
    ];

    // Cast date to a Carbon instance and amount to decimal
    protected $casts = [
        'date'   => 'date',
        'amount' => 'decimal:2',
    ];

    /**
     * Relation back to the instructor who received the payment.
     */
    public function instructor(): BelongsTo
    {
        return $this->belongsTo(Instructor::class);
    }
}
