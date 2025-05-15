<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class Ghassane_test_instructor extends Model
{
    protected $table = 'ghassane_test_instructors';

    protected $fillable = [
        'name',
        'email',
        'avatar' ,
    ];
    public function down(): void
    {
        Schema::table('ghassane_test_instructors', function (Blueprint $table) {
            $table->dropColumn('avatar');
        });
    }
}


