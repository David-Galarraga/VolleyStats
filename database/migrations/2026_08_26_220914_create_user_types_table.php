<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::create('user_types', function (Blueprint $table) {
            $table->id('id_user_type');
            $table->string('name_user_type', 50)->unique();
            $table->text('description_user_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_types');
    }
};
