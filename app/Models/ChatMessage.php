<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatMessage extends Model
{
    protected $fillable = [
        'course_id',
        'user_id',
        'parent_message_id',
        'content',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function parent()
    {
        return $this->belongsTo(self::class, 'parent_message_id');
    }

    public function replies()
    {
        return $this->hasMany(self::class, 'parent_message_id')
                    ->orderBy('created_at', 'asc');
    }
}
