<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use App\Models\MutasiStock;
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
     * API: Low stock alert (stok <= reorder_point)
     */
    public function alert()
    {
        $lowStocks = Stock::whereRaw('stok <= reorder_point')
            ->orderBy('nama_barang')
            ->get();
        return response()->json($lowStocks);
    }

    /**
     * API: Pencatatan mutasi stok (masuk/keluar).
     * Stok TIDAK boleh diubah langsung; semua lewat mutasi ini.
     */
    public function mutasi(Request $request)
    {
        $validated = $request->validate([
            'stok_id' => 'required|exists:stocks,id',
            'jenis_mutasi' => 'required|in:masuk,keluar',
            'jumlah' => 'required|numeric|min:0.01',
            'tanggal_mutasi' => 'nullable|date',
            'keterangan' => 'nullable|string',
            'transaksi_kas_id' => 'nullable|exists:buku_kas,id',
        ]);

        $result = DB::transaction(function () use ($validated) {
            // Lock baris stok untuk mencegah race condition
            $stock = Stock::lockForUpdate()->findOrFail($validated['stok_id']);
            $jumlah = $validated['jumlah'];

            if ($validated['jenis_mutasi'] === 'keluar' && bccomp($stock->stok, $jumlah, 2) < 0) {
                return null; // stok kurang
            }

            // Update tabel stocks (increment / decrement atomik)
            $stock->{$validated['jenis_mutasi'] === 'masuk' ? 'increment' : 'decrement'}('stok', $jumlah);
            $stock->refresh();

            // Catat mutasi
            $mutasi = MutasiStock::create([
                'stok_id' => $stock->id,
                'jenis_mutasi' => $validated['jenis_mutasi'],
                'jumlah' => $jumlah,
                'tanggal_mutasi' => $validated['tanggal_mutasi'] ?? now(),
                'keterangan' => $validated['keterangan'] ?? null,
                'transaksi_kas_id' => $validated['transaksi_kas_id'] ?? null,
            ]);

            return ['mutasi' => $mutasi, 'stock' => $stock];
        });

        if ($result === null) {
            return response()->json([
                'error' => 'Stok tidak cukup',
                'message' => 'Stok tidak cukup untuk mutasi keluar',
            ], 400);
        }

        $stock = $result['stock'];

        return response()->json([
            'message' => 'Mutasi ' . $validated['jenis_mutasi'] . ' berhasil',
            'mutasi' => $result['mutasi'],
            'stock' => $stock,
            'alert' => $stock->isLow(),
        ]);
    }

    /**
     * API: Riwayat mutasi untuk satu barang (ordered by tanggal_mutasi).
     */
    public function riwayat($stok_id)
    {
        $mutasi = MutasiStock::where('stok_id', $stok_id)
            ->with('stock:id,nama_barang,satuan,stok,reorder_point')
            ->orderBy('tanggal_mutasi', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json($mutasi);
    }
}
