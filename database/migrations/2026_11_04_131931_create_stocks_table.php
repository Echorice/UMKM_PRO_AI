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
        Schema::create('stocks', function (Blueprint $table) {
            $table->id();
            $table->string('nama_barang');
            $table->string('kategori')->default('Bahan Baku');
            $table->decimal('stok', 12, 2)->default(0);
            $table->string('satuan')->default('Kg');
            $table->decimal('reorder_point', 12, 2)->default(5);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stocks');
    }
};
