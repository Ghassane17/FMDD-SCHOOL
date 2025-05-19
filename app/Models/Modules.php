<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Modules extends Model
{
    protected $table = 'modules';

    protected $fillable = ['course_id', 'title', 'content', 'duration', 'order'];

    protected $casts = [
        'order' => 'integer',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
