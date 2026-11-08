<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BukuKas extends Model
{
    use HasFactory;

    protected $fillable = [
        'tanggal',
        'keterangan',
        'jenis',
        'jenis_transaksi',
        'sumber_kas',
        'nominal',
        'kategori'
    ];
}