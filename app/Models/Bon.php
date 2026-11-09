<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bon extends Model
{
    use HasFactory;

    protected $table = 'bons';

    protected $fillable = [
        'nomor_bon',
        'nama_pihak',
        'jenis_bon',
        'nominal',
        'tanggal_jatuh_tempo',
        'keterangan',
        'status',
    ];

    protected $casts = [
        'nominal' => 'decimal:2',
        'tanggal_jatuh_tempo' => 'date:Y-m-d',
    ];

    /**
     * Scope for active (belum lunas) bons
     */
    public function scopeBelumLunas($query)
    {
        return $query->where('status', 'BELUM_LUNAS');
    }

    /**
     * Scope for piutang
     */
    public function scopePiutang($query)
    {
        return $query->where('jenis_bon', 'PIUTANG');
    }

    /**
     * Scope for hutang
     */
    public function scopeHutang($query)
    {
        return $query->where('jenis_bon', 'HUTANG');
    }
}