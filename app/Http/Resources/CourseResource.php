<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'course_thumbnail' => $this->course_thumbnail ?? '/placeholder-course.jpg',
            'level' => $this->level,
            'category' => $this->category,
            'students' => $this->students_count,
            'rating' => $this->rating ?? 'N/A',
            'is_published' => $this->is_published,
            'duration_hours' => $this->duration_hours,
            'instructor' => [
                'id' => $this->instructor->id,
                'username' => $this->instructor->user->username,
            ],
        ];
    }
}
