<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table("games", function (Blueprint $table) {
            $table->boolean("suspended")->default(false)->after("result");
            $table->unsignedBigInteger("forfeit_team_id")->nullable()->after("suspended");
            $table->string("forfeit_type")->nullable()->after("forfeit_team_id");
            $table->text("suspension_reason")->nullable()->after("forfeit_type");
            $table->foreign("forfeit_team_id")->references("id")->on("teams")->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table("games", function (Blueprint $table) {
            $table->dropForeign(["forfeit_team_id"]);
            $table->dropColumn(["suspended", "forfeit_team_id", "forfeit_type", "suspension_reason"]);
        });
    }
};

