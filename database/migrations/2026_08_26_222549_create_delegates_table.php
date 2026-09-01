<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    public function up(): void
    {
        Schema::create('delegates', function (Blueprint $table) {
            $table->id('id_delegate');
            $table->string('name_delegate', 50);
            $table->string('phone_delegate', 15);
            $table->string('email_delegate', 50);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('delegates');
    }
};
