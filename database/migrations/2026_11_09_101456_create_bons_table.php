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
        Schema::create('bons', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_bon')->unique();
            $table->string('nama_pihak'); // nama debitur/kreditur
            $table->enum('jenis_bon', ['PIUTANG', 'HUTANG']);
            $table->decimal('nominal', 15, 2);
            $table->date('tanggal_jatuh_tempo');
            $table->text('keterangan')->nullable();
            $table->enum('status', ['BELUM_LUNAS', 'LUNAS'])->default('BELUM_LUNAS');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bons');
    }
};
