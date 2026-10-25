<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UmkmHealth;
use Illuminate\Support\Facades\Http;

class UmkmHealthController extends Controller
{
    public function store(Request $request)
{
    // 1. Ambil 10 Variabel Mentah
    $ca = $request->currentAssets ?? 0;
    $cl = $request->currentLiabilities ?? 0;
    $td = $request->totalDebt ?? 0;
    $te = $request->totalEquity ?? 0;
    $np = $request->netProfit ?? 0;
    $ta = $request->totalAssets ?? 0;
    $sales = $request->sales ?? 0;
    $ci = $request->cashInflow ?? 0;
    $co = $request->cashOutflow ?? 0;
    $prevRev = $request->previousRevenue ?? 0;

    // 2. Kalkulasi 7 Indikator Finansial
    $currentRatio = $cl > 0 ? ($ca / $cl) : 0;
    $der = $te > 0 ? ($td / $te) : 0;
    $roa = $ta > 0 ? (($np / $ta) * 100) : 0;
    $npm = $sales > 0 ? (($np / $sales) * 100) : 0;
    $tat = $ta > 0 ? ($sales / $ta) : 0;
    $ocf = $ci - $co;
    $revGrowth = $prevRev > 0 ? (($sales - $prevRev) / $prevRev) * 100 : 0;

    // 3. MENGHUBUNGI SERVER DJANGO (MACHINE LEARNING)
    $aiPrediction = 'Sehat (Default)';

    try {
        $response = Http::timeout(5)->post('http://127.0.0.1:8001/predict/', [
            'current_ratio' => (float) $currentRatio,
            'der' => (float) $der,
            'roa' => (float) $roa,
            'npm' => (float) $npm,
            'tat' => (float) $tat,
            'ocf' => (float) $ocf,
            'rev_growth' => (float) $revGrowth,
        ]);

        if ($response->successful()) {
            $apiData = $response->json();
            $aiPrediction = $apiData['prediction'] ?? 'Sehat (Keuangan Stabil)';
        } else {
            // Jika Django mengembalikan error server (500/400)
            $aiPrediction = 'Error Server ML: ' . $response->status();
        }
    } catch (\Exception $e) {
        // Jika gagal koneksi sama sekali (misal Django mati)
        $aiPrediction = 'Server ML Offline';
    }

    // 4. Simpan ke Database
    UmkmHealth::create([
        'nama_usaha' => $request->namaUsaha,
        'current_assets' => $ca,
        'current_liabilities' => $cl,
        'total_debt' => $td,
        'total_equity' => $te,
        'net_profit' => $np,
        'total_assets' => $ta,
        'sales' => $sales,
        'cash_inflow' => $ci,
        'cash_outflow' => $co,
        'previous_revenue' => $prevRev,

        'current_ratio' => $currentRatio,
        'der' => $der,
        'roa' => $roa,
        'npm' => $npm,
        'tat' => $tat,
        'ocf' => $ocf,
        'rev_growth' => $revGrowth,

        'ai_prediction' => $aiPrediction
    ]);

    return redirect()->back();
}
}