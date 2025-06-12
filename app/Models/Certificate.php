<?php
// app/Models/Certificate.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Certificate extends Model
{
    use HasFactory;

    protected $fillable = [
        'learner_id',
        'course_id',
        'certificate_code',
        'url_path',
        'issued_at'
    ];

    protected $dates = ['issued_at'];

    public function learner()
    {
        return $this->belongsTo(Learner::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
