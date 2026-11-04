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

    # 2. Kalkulasi Indikator Finansial yang Benar & Realistis
    $currentRatio = $cl > 0 ? ($ca / $cl) : 0;
    $der = $te > 0 ? ($td / $te) : 0;
    
    // ROA: Net Profit / Total Assets (Persentase wajar -50% s.d +100%)
    $roa = $ta > 0 ? (($np / $ta) * 100) : 0;
    
    // NPM: Net Profit / Sales (Persentase wajar -100% s.d +100%, jika sales kecil/nol di-handle)
    $npm = ($sales > 0 && $np != 0) ? (($np / $sales) * 100) : 0;
    if ($npm > 100) $npm = 100.0; // Batasi anomali max 100%
    if ($npm < -100) $npm = -100.0;

    // TAT: Sales / Total Assets (Rasio perputaran aset, wajar 0.1 s.d 10.0)
    $tat = $ta > 0 ? ($sales / $ta) : 0;
    
    $ocf = $ci - $co;
            $revGrowth = $prevRev > 0 ? (($sales - $prevRev) / $prevRev) * 100 : 0;

            // Scoring 0-100 for 4 pillars
            $profitabilityScore = min(100, max(0, (int)(($roa + 20) * 2.5)));
            $liquidityScore = min(100, max(0, (int)($currentRatio * 50)));
            $leverageScore = min(100, max(0, (int)(max(0, (3 - $der)) * 33.3)));
            $efficiencyScore = min(100, max(0, (int)($tat * 30)));

            $avgScore = ($profitabilityScore + $liquidityScore + $leverageScore + $efficiencyScore) / 4;
            $prediction = $avgScore >= 70 ? 'SEHAT' : ($avgScore >= 50 ? 'RISIKO' : 'BERESIKO');
            $aiPrediction = $prediction === 'SEHAT' ? 'Sehat (Keuangan Stabil)' : 'Beresiko (Perlu Perhatian)';

            // Recommendations based on metrics
            $recommendations = [];
            if ($der > 1.5) {
                $recommendations[] = "Rasio DER Anda cukup tinggi (" . number_format($der, 2) . "). Pertimbangkan untuk menunda pembelian aset tetap atau tingkatkan efisiensi operasional pada pengeluaran bahan baku.";
            }
            if ($currentRatio < 1.0) {
                $recommendations[] = "Likuiditas di bawah 1.0. Tingkatkan penagihan piutang dan cadangan kas lancar untuk mengantisipasi kewajiban jangka pendek.";
            }
            if ($roa < 5) {
                $recommendations[] = "Profitabilitas (ROA) perlu ditingkatkan dengan mengoptimalkan margin produk atau menekan biaya operasional non-esensial.";
            }
            if (empty($recommendations)) {
                $recommendations[] = "Kondisi keuangan stabil. Pertahankan efisiensi operasional dan lanjutkan ekspansi bisnis secara terukur.";
            }

            try {
                $response = Http::timeout(3)->post('http://127.0.0.1:5000/hitung-kesehatan', [
            'namaUsaha' => $request->namaUsaha,
            'currentAssets' => (float) $ca,
            'currentLiabilities' => (float) $cl,
            'totalDebt' => (float) $td,
            'totalEquity' => (float) $te,
            'netProfit' => (float) $np,
            'totalAssets' => (float) $ta,
            'sales' => (float) $sales,
            'cashInflow' => (float) $ci,
            'cashOutflow' => (float) $co,
            'previousRevenue' => (float) $prevRev,
        ]);

        if ($response->successful()) {
            $apiData = $response->json();
            $aiPrediction = $apiData['ai_prediction'] ?? 'Sehat (Keuangan Stabil)';
        } else {
            $aiPrediction = 'Error Server ML: ' . $response->status();
        }
    } catch (\Exception $e) {
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

    return response()->json([
        'status' => 'sukses',
        'profitability_score' => $profitabilityScore,
        'liquidity_score' => $liquidityScore,
        'leverage_score' => $leverageScore,
        'efficiency_score' => $efficiencyScore,
        'prediction' => $prediction === 'BERESIKO' ? 'Beresiko (Perlu Perhatian)' : $prediction,
        'confidence' => 0.89,
        'current_ratio' => $currentRatio,
        'debt_equity_ratio' => $der,
        'return_on_assets' => $roa,
        'net_profit_margin' => $npm,
        'recommendations' => $recommendations,
        'raw' => [
            'sales' => $sales,
            'net_profit' => $np,
            'total_debt' => $td,
            'current_assets' => $ca,
            'current_liabilities' => $cl
        ]
    ]);
}
}