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
        Schema::create('mutasi_stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stok_id')->constrained('stocks')->cascadeOnDelete();
            $table->enum('jenis_mutasi', ['masuk', 'keluar']);
            $table->decimal('jumlah', 12, 2);
            $table->date('tanggal_mutasi');
            $table->text('keterangan')->nullable();
            $table->foreignId('transaksi_kas_id')->nullable()->constrained('buku_kas')->nullOnDelete();
            $table->timestamps();

            $table->index(['stok_id', 'tanggal_mutasi']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mutasi_stocks');
    }
};
