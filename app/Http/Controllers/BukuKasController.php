<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BukuKas;
use Inertia\Inertia;

class BukuKasController extends Controller
{
    // Menampilkan halaman Buku Kas beserta data dari database
    public function index()
    {
        $transaksi = BukuKas::orderBy('tanggal', 'desc')->orderBy('id', 'desc')->get();

        return Inertia::render('BukuKas', [
            'transaksi' => $transaksi
        ]);
    }

    // Menyimpan transaksi baru ke database
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tanggal' => 'required|date',
            'keterangan' => 'required|string|max:255',
            'jenis_transaksi' => 'required|in:Pemasukan,Pengeluaran',
            'kategori' => 'required|string',
            'nominal' => 'required|numeric|min:0',
        ]);

        // Sync legacy 'jenis' column
        $validated['jenis'] = strtolower($validated['jenis_transaksi']);

        $transaksi = BukuKas::create($validated);

        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json($transaksi, 201);
        }

        return redirect()->back()->with('success', 'Transaksi berhasil disimpan!');
    }

    // API JSON untuk fetch React
    public function apiIndex()
    {
        return response()->json(BukuKas::orderBy('tanggal', 'desc')->orderBy('id', 'desc')->get());
    }

    public function update(Request $request, $id)
        {
            $transaksi = BukuKas::findOrFail($id);

            $validated = $request->validate([
                'tanggal' => 'required|date',
                'keterangan' => 'required|string|max:255',
                'jenis_transaksi' => 'required|in:Pemasukan,Pengeluaran',
                'kategori' => 'required|string',
                'nominal' => 'required|numeric|min:0',
            ]);

            // Sync legacy 'jenis' column
            $validated['jenis'] = strtolower($validated['jenis_transaksi']);

            $transaksi->update($validated);
            return response()->json($transaksi);
        }

    public function destroy($id)
    {
        $transaksi = BukuKas::findOrFail($id);
        $transaksi->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}