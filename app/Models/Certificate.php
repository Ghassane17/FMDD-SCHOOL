<?php
// app/Models/Certificate.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Certificate extends Model
{
use HasFactory;

protected $fillable = ['user_id', 'course_id', 'certificate_path', 'url_path', 'issued_at'];

public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
{
return $this->belongsTo(User::class);
}

public function course(): \Illuminate\Database\Eloquent\Relations\BelongsTo
{
return $this->belongsTo(Course::class);
}
}
