<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Stock extends Model
{
    protected $table = 'stocks';

    protected $fillable = [
        'nama_barang',
        'kategori',
        'stok',
        'satuan',
        'reorder_point',
    ];

    protected $casts = [
        'stok' => 'decimal:2',
        'reorder_point' => 'decimal:2',
    ];

    public function mutasi(): HasMany
    {
        return $this->hasMany(MutasiStock::class, 'stok_id');
    }

    /**
     * Eager helper untuk response JSON: status low stock.
     */
    public function isLow(): bool
    {
        return bccomp($this->stok, $this->reorder_point, 2) <= 0;
    }
}
