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
    Schema::create('buku_kas', function (Blueprint $table) {
        $table->id();
        $table->date('tanggal');
        $table->string('keterangan');
        $table->enum('jenis', ['pemasukan', 'pengeluaran']);
        $table->decimal('nominal', 15, 2); // Mendukung angka nominal besar
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('buku_kas');
    }
};
