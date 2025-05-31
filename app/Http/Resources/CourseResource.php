<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'course_thumbnail' => $this->course_thumbnail,
            'level' => $this->level,
            'category' => $this->category,
            'duration_min' => $this->duration_min,
            'is_published' => $this->is_published,
            'instructor_id' => $this->instructor_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'resources' => ResourceCollectionResource::collection($this->whenLoaded('resources')),
        ];
    }
} 