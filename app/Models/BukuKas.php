<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BukuKas extends Model
{
    use HasFactory;

    // Tambahkan baris ini untuk mengizinkan kolom-kolom ini diisi data
    protected $fillable = [
        'tanggal',
        'keterangan',
        'jenis',
        'nominal'
    ];
}