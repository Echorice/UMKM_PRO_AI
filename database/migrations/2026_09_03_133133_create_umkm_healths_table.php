<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('umkm_healths', function (Blueprint $table) {
            $table->id();
            $table->string('nama_usaha');

            // --- 10 VARIABEL MENTAH (Gunakan bigInteger karena nominal Rupiah sangat besar) ---
            $table->bigInteger('current_assets')->default(0);
            $table->bigInteger('current_liabilities')->default(0);
            $table->bigInteger('total_debt')->default(0);
            $table->bigInteger('total_equity')->default(0);
            $table->bigInteger('net_profit')->default(0);
            $table->bigInteger('total_assets')->default(0);
            $table->bigInteger('sales')->default(0);
            $table->bigInteger('cash_inflow')->default(0);
            $table->bigInteger('cash_outflow')->default(0);
            $table->bigInteger('previous_revenue')->default(0);

            // --- 7 INDIKATOR FINANSIAL (Gunakan float/decimal untuk angka desimal & persentase) ---
            $table->decimal('current_ratio', 10, 2)->default(0);
            $table->decimal('der', 10, 2)->default(0); // Debt to Equity Ratio
            $table->decimal('roa', 10, 2)->default(0); // Return on Assets (%)
            $table->decimal('npm', 10, 2)->default(0); // Net Profit Margin (%)
            $table->decimal('tat', 10, 2)->default(0); // Total Asset Turnover
            $table->bigInteger('ocf')->default(0);     // Operating Cash Flow (Bentuknya Rupiah, jadi bigInteger)
            $table->decimal('rev_growth', 10, 2)->default(0); // Revenue Growth (%)

            // --- KOLOM PREDIKSI AI (Disiapkan untuk FastAPI nanti) ---
            $table->string('ai_prediction')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('umkm_healths');
    }
};
