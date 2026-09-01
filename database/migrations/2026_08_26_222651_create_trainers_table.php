<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::create('trainers', function (Blueprint $table) {
            $table->id('id_trainer');
            $table->string('name_trainer', 50);
            $table->string('phone_trainer', 15);
            $table->string('email_trainer', 50);
            $table->string('specialty_trainer', 100);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trainers');
    }
};
