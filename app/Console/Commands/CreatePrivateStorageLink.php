<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class CreatePrivateStorageLink extends Command
{
    protected $signature = 'storage:private-link';
    protected $description = 'Create a symbolic link from "public/private" to "storage/app/private"';

    public function handle()
    {
        if (file_exists(public_path('private'))) {
            $this->error('The "public/private" link already exists.');
            return;
        }

        $this->laravel->make('files')->link(
            storage_path('app/private'),
            public_path('private')
        );

        $this->info('The [public/private] link has been connected.');
    }
}
