<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BukuKas;
use Inertia\Inertia;

class BukuKasController extends Controller
{
    // Menampilkan halaman Home (dengan tab Buku Kas aktif)
    public function index()
    {
        $transaksi = BukuKas::orderBy('tanggal', 'desc')->orderBy('id', 'desc')->get();

        return Inertia::render('Home', [
            'transaksi' => $transaksi,
            'activeTab' => 'bukuKas'
        ]);
    }

    // Menyimpan transaksi baru ke database
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tanggal' => 'required|date',
            'keterangan' => 'required|string|max:255',
            'jenis_transaksi' => 'required|in:Pemasukan,Pengeluaran',
            'sumber_kas' => 'nullable|string|max:50',
            'kategori' => 'required|string',
            'nominal' => 'required|numeric|min:0',
        ]);

        // Sync legacy 'jenis' column (lowercase) & ensure sumber_kas fallback
        $validated['jenis'] = strtolower($validated['jenis_transaksi']);
        $validated['sumber_kas'] = (!empty($validated['sumber_kas'])) ? $validated['sumber_kas'] : 'KAS_TUNAI';

        $transaksi = BukuKas::create($validated);

        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json($transaksi, 201);
        }

        return redirect()->back()->with('success', 'Transaksi berhasil disimpan!');
    }

    // API: Daftar semua transaksi
    public function apiIndex()
    {
        return response()->json(BukuKas::all());
    }

    // Canonical helper: resolve jenis_transaksi (title case) -> jenis (lowercase)
    protected function resolveJenis(Request $request)
    {
        $jenisTransaksi = $request->input('jenis_transaksi') ?? $request->input('jenis');
        if (!$jenisTransaksi) {
            return 'pemasukan'; // default
        }
        $jenis = strtolower(trim($jenisTransaksi));
        return in_array($jenis, ['pemasukan', 'pengeluaran']) ? $jenis : 'pemasukan';
    }

    // API: Menyimpan transaksi baru (JSON API)
    public function apiStore(Request $request)
    {
        $validated = $request->validate([
            'tanggal' => 'required|date',
            'keterangan' => 'required|string|max:255',
            'jenis_transaksi' => 'required|in:Pemasukan,Pengeluaran',
            'sumber_kas' => 'nullable|string|max:50',
            'nominal' => 'required|numeric|min:0',
            'kategori' => 'required|string|max:255',
        ]);

        $validated['jenis'] = $this->resolveJenis($request);
        $validated['sumber_kas'] = (!empty($validated['sumber_kas'])) ? $validated['sumber_kas'] : 'KAS_TUNAI';

        $transaksi = BukuKas::create($validated);

        return response()->json($transaksi, 201);
    }

    // API: Memperbarui transaksi
    public function apiUpdate(Request $request, $id)
    {
        $transaksi = BukuKas::find($id);
        if (!$transaksi) {
            return response()->json(['error' => 'Data tidak ditemukan'], 404);
        }

        $validated = $request->validate([
            'tanggal' => 'required|date',
            'keterangan' => 'required|string|max:255',
            'jenis_transaksi' => 'required|in:Pemasukan,Pengeluaran',
            'sumber_kas' => 'nullable|string|max:50',
            'nominal' => 'required|numeric|min:0',
            'kategori' => 'required|string|max:255',
        ]);

        $validated['jenis'] = $this->resolveJenis($request);
        $validated['sumber_kas'] = (!empty($validated['sumber_kas'])) ? $validated['sumber_kas'] : 'KAS_TUNAI';

        $transaksi->update($validated);

        return response()->json($transaksi);
    }

    // API: Menghapus transaksi
    public function apiDestroy($id)
    {
        $transaksi = BukuKas::find($id);
        if (!$transaksi) {
            return response()->json(['error' => 'Data tidak ditemukan'], 404);
        }

        $transaksi->delete();

        return response()->json(['success' => true]);
    }

    // API: Performance Dashboard Data
    public function apiPerformanceDashboard()
    {
        $totalPemasukan = BukuKas::where('jenis', 'pemasukan')->sum('nominal');
        $totalPengeluaran = BukuKas::where('jenis', 'pengeluaran')->sum('nominal');
        $totalOrders = BukuKas::where('jenis', 'pemasukan')->count();
        $avgOrderValue = $totalOrders > 0 ? $totalPemasukan / $totalOrders : 0;

        // Sales by Category
        $byCategory = BukuKas::where('jenis', 'pemasukan')
            ->selectRaw('kategori, SUM(nominal) as total')
            ->groupBy('kategori')
            ->get();

        // Financial Metrics Latest
        $latestHealth = \App\Models\UmkmHealth::latest()->first();

        return response()->json([
            'kpi' => [
                'total_revenue' => $totalPemasukan,
                'total_orders' => $totalOrders,
                'quantity_sold' => $totalOrders * 3, // Perkiraan
                'avg_order_value' => round($avgOrderValue, 2),
            ],
            'by_category' => $byCategory,
            'health_metrics' => $latestHealth
        ]);
    }
}