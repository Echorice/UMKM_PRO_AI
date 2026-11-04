<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use App\Models\BukuKas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $stocks = Stock::orderBy('nama_barang')->get();
        return response()->json($stocks);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_barang' => 'required|string|max:255',
            'kategori' => 'required|string|max:100',
            'stok' => 'required|numeric|min:0',
            'satuan' => 'required|string|max:50',
            'reorder_point' => 'required|numeric|min:0',
        ]);

        $stock = Stock::create($validated);
        return response()->json($stock, 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Stock $stock)
    {
        $validated = $request->validate([
            'nama_barang' => 'sometimes|string|max:255',
            'kategori' => 'sometimes|string|max:100',
            'stok' => 'sometimes|numeric|min:0',
            'satuan' => 'sometimes|string|max:50',
            'reorder_point' => 'sometimes|numeric|min:0',
        ]);

        $stock->update($validated);
        return response()->json($stock);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Stock $stock)
    {
        $stock->delete();
        return response()->json(['message' => 'Stok dihapus']);
    }

    /**
     * Kurangi stok saat pengeluaran bahan baku (dipanggil dari BukuKas)
     */
    public function kurangiStok(Request $request)
    {
        $validated = $request->validate([
            'stock_id' => 'required|exists:stocks,id',
            'jumlah' => 'required|numeric|min:0.01',
        ]);

        $stock = Stock::find($validated['stock_id']);
        $stock->decrement('stok', $validated['jumlah']);
        
        // Cek apakah stok sudah di bawah reorder point
        $stock->refresh();
        $alert = false;
        if ($stock->stok <= $stock->reorder_point) {
            $alert = true;
        }

        return response()->json([
            'stock' => $stock,
            'alert' => $alert,
            'message' => $alert ? "Stok {$stock->nama_barang} mendekati batas minimum ({$stock->reorder_point} {$stock->satuan})" : 'Stok berhasil dikurangi'
        ]);
    }

    /**
     * Tambah stok (restock)
     */
    public function tambahStok(Request $request)
    {
        $validated = $request->validate([
            'stock_id' => 'required|exists:stocks,id',
            'jumlah' => 'required|numeric|min:0.01',
        ]);

        $stock = Stock::find($validated['stock_id']);
        $stock->increment('stok', $validated['jumlah']);
        $stock->refresh();

        return response()->json([
            'stock' => $stock,
            'message' => "Stok {$stock->nama_barang} ditambah {$validated['jumlah']} {$stock->satuan}"
        ]);
    }

    /**
     * Get stok yang mendekati reorder point
     */
    public function getLowStock()
    {
        $lowStocks = Stock::whereRaw('stok <= reorder_point')->get();
        return response()->json($lowStocks);
    }
}
