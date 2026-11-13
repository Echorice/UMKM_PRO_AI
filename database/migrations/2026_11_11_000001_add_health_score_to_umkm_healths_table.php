<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambah kolom health_score (rerata 4 pilar) ke tabel umkm_healths.
     */
    public function up(): void
    {
        Schema::table('umkm_healths', function (Blueprint $table) {
            $table->decimal('health_score', 5, 2)->default(0)->after('ai_prediction');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('umkm_healths', function (Blueprint $table) {
            $table->dropColumn('health_score');
        });
    }
};
