<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommentReply extends Model
{
    protected $fillable = [
        'comment_id',
        'instructor_id',
        'reply',
    ];

    public function comment()
    {
        return $this->belongsTo(Comment::class);
    }

    public function instructor()
    {
        return $this->belongsTo(Instructor::class);
    }
}
