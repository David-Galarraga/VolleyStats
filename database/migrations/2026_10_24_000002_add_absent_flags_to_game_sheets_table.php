<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table("game_sheets", function (Blueprint $table) {
            $table->boolean("local_absent")->default(false)->after("observations");
            $table->boolean("visitor_absent")->default(false)->after("observations");
        });
    }

    public function down(): void
    {
        Schema::table("game_sheets", function (Blueprint $table) {
            $table->dropColumn(["local_absent", "visitor_absent"]);
        });
    }
};

