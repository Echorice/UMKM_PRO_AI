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
            'jenis' => 'required|in:pemasukan,pengeluaran',
            'nominal' => 'required|numeric|min:0',
        ]);

        BukuKas::create($validated);

        return redirect()->back()->with('success', 'Transaksi berhasil disimpan!');
    }
}