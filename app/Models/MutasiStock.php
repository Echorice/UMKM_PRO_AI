<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MutasiStock extends Model
{
    use HasFactory;

    protected $table = 'mutasi_stocks';

    protected $fillable = [
        'stok_id',
        'jenis_mutasi',
        'jumlah',
        'tanggal_mutasi',
        'keterangan',
        'transaksi_kas_id',
    ];

    protected $casts = [
        'jumlah' => 'decimal:2',
        'tanggal_mutasi' => 'date',
    ];

    public function stock(): BelongsTo
    {
        return $this->belongsTo(Stock::class, 'stok_id');
    }

    public function transaksiKas(): BelongsTo
    {
        return $this->belongsTo(BukuKas::class, 'transaksi_kas_id');
    }
}
