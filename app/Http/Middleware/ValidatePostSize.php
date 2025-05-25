<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ValidatePostSize
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->server('CONTENT_LENGTH') > $this->getPostMaxSize()) {
            throw new \Illuminate\Http\Exceptions\PostTooLargeException;
        }

        return $next($request);
    }

    /**
     * Get the maximum post size in bytes.
     *
     * @return int
     */
    protected function getPostMaxSize(): int
    {
        $postMaxSize = ini_get('post_max_size');
        $postMaxSize = $this->returnBytes($postMaxSize);

        return $postMaxSize;
    }

    /**
     * Convert PHP size string to bytes.
     *
     * @param string $size
     * @return int
     */
    protected function returnBytes(string $size): int
    {
        $size = strtolower($size);
        $unit = substr($size, -1);
        $size = (int) $size;

        switch ($unit) {
            case 'g':
                $size *= 1024;
            case 'm':
                $size *= 1024;
            case 'k':
                $size *= 1024;
        }

        return $size;
    }
} 