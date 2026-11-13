<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UmkmHealth;
use Illuminate\Support\Facades\Http;

class UmkmHealthController extends Controller
{
    /**
     * Normalize input keys: accept both camelCase and snake_case from frontend.
     */
    protected function normalizeInput(array $data): array
    {
        $map = [
            'namaUsaha'          => ['nama_usaha', 'namaUsaha'],
            'currentAssets'      => ['current_assets', 'currentAssets'],
            'currentLiabilities' => ['current_liabilities', 'currentLiabilities'],
            'totalDebt'          => ['total_debt', 'totalDebt'],
            'totalEquity'        => ['total_equity', 'totalEquity'],
            'netProfit'          => ['net_profit', 'netProfit'],
            'totalAssets'        => ['total_assets', 'totalAssets'],
            'sales'              => ['sales', 'sales'],
            'cashInflow'         => ['cash_inflow', 'cashInflow'],
            'cashOutflow'        => ['cash_outflow', 'cashOutflow'],
            'previousRevenue'    => ['previous_revenue', 'previousRevenue'],
        ];

        $normalized = [];
        foreach ($map as $canonical => $aliases) {
            foreach ($aliases as $alias) {
                if (array_key_exists($alias, $data) && $data[$alias] !== null && $data[$alias] !== '') {
                    $normalized[$canonical] = $data[$alias];
                    break;
                }
            }
        }
        return $normalized;
    }

    /**
     * Hitung 6 rasio finansial dari input mentah.
     */
    protected function calculateRatios(array $data): array
    {
        $ca      = (float) ($data['currentAssets'] ?? 0);
        $cl      = (float) ($data['currentLiabilities'] ?? 0);
        $td      = (float) ($data['totalDebt'] ?? 0);
        $te      = (float) ($data['totalEquity'] ?? 0);
        $np      = (float) ($data['netProfit'] ?? 0);
        $ta      = (float) ($data['totalAssets'] ?? 0);
        $sales   = (float) ($data['sales'] ?? 0);
        $ci      = (float) ($data['cashInflow'] ?? 0);
        $co      = (float) ($data['cashOutflow'] ?? 0);
        $prevRev = (float) ($data['previousRevenue'] ?? 0);

        $currentRatio = $cl > 0 ? $ca / $cl : 0;
        $der          = $te > 0 ? $td / $te : 0;
        $roa          = $ta > 0 ? ($np / $ta) * 100 : 0;
        $npm          = ($sales > 0 && $np != 0) ? ($np / $sales) * 100 : 0;
        $npm          = max(-100, min(100, $npm));
        $tat          = $ta > 0 ? $sales / $ta : 0;
        $ocf          = $ci - $co;
        $revGrowth    = $prevRev > 0 ? (($sales - $prevRev) / $prevRev) * 100 : 0;

        return compact('currentRatio', 'der', 'roa', 'npm', 'tat', 'ocf', 'revGrowth');
    }

    /**
     * Rule-base engine: 6 insights dari 6 rasio.
     */
    protected function getInsights(array $ratios): array
    {
        $insights = [];

        if ($ratios['der'] > 1.5) {
            $insights[] = 'Beban hutang Anda lebih besar 1.5x dari modal. Tindakan: hindari mengambil pinjaman baru bulan ini dan fokus lunasi hutang jangka pendek.';
        }

        if ($ratios['npm'] < 5) {
            $insights[] = 'Margin keuntungan bersih sangat tipis di bawah 5%. Tindakan: evaluasi ulang harga jual produk atau pangkas biaya operasional/bahan baku yang tidak perlu.';
        }

        if ($ratios['currentRatio'] < 1.0) {
            $insights[] = 'Aset lancar tidak cukup untuk membayar kewajiban jangka pendek. Tindakan: segera tagih piutang pelanggan atau cairkan persediaan barang mati.';
        }

        if ($ratios['roa'] < 5) {
            $insights[] = 'Efisiensi penggunaan aset (ROA) di bawah 5%. Tindakan: optimalkan penggunaan aset untuk menghasilkan laba atau pertimbangkan penjualan aset tidak produktif.';
        }

        if ($ratios['tat'] < 0.5) {
            $insights[] = 'Perputaran aset (TAT) rendah di bawah 0.5. Tindakan: tingkatkan efisiensi penjualan atau kurangi aset yang tidak menghasilkan pendapatan.';
        }

        if ($ratios['revGrowth'] < 0) {
            $insights[] = 'Pendapatan mengalami penurunan. Tindakan: evaluasi strategi pemasaran, retensi pelanggan, atau diversifikasi produk untuk memulihkan pertumbuhan.';
        }

        if (empty($insights)) {
            $insights[] = 'Kondisi keuangan stabil. Pertahankan efisiensi operasional dan lanjutkan ekspansi bisnis secara terukur.';
        }

        return $insights;
    }

    /**
     * Panggil Flask ML (port 5000) untuk label prediksi AI + full response.
     */
    protected function callMlApi(array $ratios, array $data): array
    {
        try {
            $response = Http::timeout(3)->post('http://127.0.0.1:5000/hitung-kesehatan', [
                'CR'                  => $ratios['currentRatio'],
                'DER'                 => $ratios['der'],
                'ROA'                 => $ratios['roa'] / 100,
                'NPM'                 => $ratios['npm'] / 100,
                'TATO'                => $ratios['tat'],
                'Operating_Cash_Flow' => $ratios['ocf'],
                'Revenue_Growth'      => $ratios['revGrowth'] / 100,
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            return ['ai_prediction' => 'Error Server ML: ' . $response->status()];
        } catch (\Exception $e) {
            return ['ai_prediction' => 'Server ML Offline'];
        }
    }

    /**
        * Skor 4 pilar + payload response standar.
        */
       protected function buildResponse(array $ratios, array $insights, array $mlResponse, string $aiPrediction, array $raw = []): array
       {
           // --- Bar intensity (0-100), threshold ideal sebagai pembagi 100% ---
           $barCr     = min(100, max(0, ($ratios['currentRatio'] / 5.0) * 100));
           $barDer    = min(100, max(0, ($ratios['der'] / 1.5) * 100));
           $barRoa    = min(100, max(0, ($ratios['roa'] / 15.0) * 100));
           $barNpm    = min(100, max(0, ($ratios['npm'] / 20.0) * 100));
           $barTat    = min(100, max(0, ($ratios['tat'] / 1.5) * 100));
           $barGrowth = min(100, max(0, ($ratios['revGrowth'] / 20.0) * 100));

           // --- 4 skor kartu, turunan dari bar di atas ---
           $scoreLiquidity     = round($barCr);
           $scoreLeverage      = round(100 - $barDer);          // inverted: hutang tinggi = skor rendah
           $scoreProfitability = round(($barRoa + $barNpm) / 2);
           $scoreEfficiency    = round(($barTat + $barGrowth) / 2);

           $avgScore = ($scoreProfitability + $scoreLiquidity + $scoreLeverage + $scoreEfficiency) / 4;
           // Kartu status ikut prediksi ML; fallback avg skor bila ML offline/kosong
           $mlPred      = is_string($aiPrediction) && trim($aiPrediction) !== '' ? $aiPrediction : null;
           $prediction  = $mlPred ?? ($avgScore >= 70 ? 'SEHAT' : ($avgScore >= 50 ? 'RISIKO' : 'BERESIKO'));

           // Intensity scores (0-100) untuk histogram & kartu
           $riskIntensity         = $barDer;
           $profitabilityIntensity = ($barRoa + $barNpm) / 2;
           $liquidityIntensity    = $barCr;
           $efficiencyIntensity   = ($barTat + $barGrowth) / 2;

           // Imbalance diagnostics: rule-engine berbasis bar intensity + merge ML Flask
           $imbalance = [];
           $profitBarAvg = ($barRoa + $barNpm) / 2;
           $effBarAvg    = ($barTat + $barGrowth) / 2;

           if ($barDer > 75 && $profitBarAvg < 40) {
               $imbalance[] = 'Overleveraged (Usaha didorong oleh hutang, bukan keuntungan)';
           }
           if ($barCr > 80 && $effBarAvg < 40) {
               $imbalance[] = 'Idle Asset (Terlalu banyak kas/aset lancar menganggur)';
           }
           if ($profitBarAvg > $barDer && $profitBarAvg > 60) {
               $imbalance[] = 'Dominasi Laba Sehat';
           }

           // Merge Flask ML diagnostics if available
           if (!empty($mlResponse['imbalance_diagnostics'])) {
               foreach ((array)$mlResponse['imbalance_diagnostics'] as $diag) {
                   $imbalance[] = is_string($diag) ? $diag : (is_array($diag) ? implode(', ', $diag) : $diag);
               }
           }
           // Default fallback if empty
           if (empty($imbalance)) {
               $imbalance[] = 'Struktur Keuangan Seimbang';
           }

           return [
            'status'               => 'sukses',
            'profitability_score'  => $scoreProfitability,
            'liquidity_score'      => $scoreLiquidity,
            'leverage_score'       => $scoreLeverage,
            'efficiency_score'     => $scoreEfficiency,
            'prediction'           => $prediction === 'BERESIKO' ? 'Beresiko (Perlu Perhatian)' : $prediction,
            'health_status'        => $avgScore >= 80 ? 'Sehat' : ($avgScore >= 50 ? 'Beresiko' : 'Krisis'),
            'confidence'           => round($avgScore, 1),
            'ai_prediction'        => $aiPrediction,
            'current_ratio'        => $ratios['currentRatio'],
            'debt_equity_ratio'    => $ratios['der'],
            'return_on_assets'     => $ratios['roa'],
            'net_profit_margin'    => $ratios['npm'],
            'total_asset_turnover' => $ratios['tat'],
            'operating_cash_flow'  => $ratios['ocf'],
            'revenue_growth'       => $ratios['revGrowth'],
            'insights'             => $insights,
            'recommendations'      => $insights,
            'raw'                  => $raw,
            // New: intensity scores for histogram (flat at top level)
            'profitability_intensity' => round($profitabilityIntensity, 1),
            'liquidity_intensity'     => round($liquidityIntensity, 1),
            'risk_intensity'          => round($riskIntensity, 1),
            'efficiency_intensity'    => round($efficiencyIntensity, 1),
            // Backward-compat nested intensity_scores for histogram
            'intensity_scores' => [
                'risk_intensity'          => round($riskIntensity, 1),
                'profitability_intensity' => round($profitabilityIntensity, 1),
                'liquidity_intensity'     => round($liquidityIntensity, 1),
                'efficiency_intensity'    => round($efficiencyIntensity, 1),
            ],
            // New: bar_chart values for frontend histogram (nested)
            'bar_chart' => [
                'cr' => round($barCr, 1), 'der' => round($barDer, 1), 'roa' => round($barRoa, 1),
                'npm' => round($barNpm, 1), 'tat' => round($barTat, 1), 'growth' => round($barGrowth, 1),
            ],
            // New: scores breakdown (flat at top level)
            'health_score' => (float) ($raw['health_score'] ?? round($avgScore, 2)),
            'scores' => [
                'profitability' => $scoreProfitability, 'liquidity' => $scoreLiquidity,
                'leverage' => $scoreLeverage, 'efficiency' => $scoreEfficiency,
                'average' => round($avgScore, 1),
            ],
            // Imbalance diagnostics
            'imbalance' => !empty($imbalance) ? $imbalance : ['Struktur Keuangan Seimbang'],
            // Debt vs Equity for pie chart (already in raw, surfaced here)
            'total_debt'   => $raw['total_debt'] ?? ($ratios['der'] * ($raw['total_equity'] ?? 1)),
            'total_equity' => $raw['total_equity'] ?? 1,
        ];
    }

    /**
     * Get latest analysis from database for initial page load.
     */
    public function apiLatest()
    {
        $latest = UmkmHealth::latest('id')->first();
        if (!$latest) {
            return response()->json(['status' => 'empty', 'message' => 'Belum ada data analisis.']);
        }

        $ratios = [
            'currentRatio' => (float)$latest->current_ratio,
            'der'          => (float)$latest->der,
            'roa'          => (float)$latest->roa,
            'npm'          => (float)$latest->npm,
            'tat'          => (float)$latest->tat,
            'ocf'          => (float)$latest->ocf,
            'revGrowth'    => (float)$latest->rev_growth,
        ];

        $insights = $this->getInsights($ratios);

        $mlResponse = [
            'ai_prediction' => $latest->ai_prediction,
            'imbalance_diagnostics' => [],
            'recommendations' => [],
        ];

        return response()->json($this->buildResponse($ratios, $insights, $mlResponse, $latest->ai_prediction, [
            'sales'               => (float)$latest->sales,
            'net_profit'          => (float)$latest->net_profit,
            'total_debt'          => (float)$latest->total_debt,
            'total_equity'        => (float)$latest->total_equity,
            'current_assets'      => (float)$latest->current_assets,
            'current_liabilities' => (float)$latest->current_liabilities,
            'health_score'        => (float)$latest->health_score,
        ]));
    }

    /**
     * Analisis + simpan ke DB.
     */
    public function store(Request $request)
    {
        $data     = $this->normalizeInput($request->all());
        $ratios   = $this->calculateRatios($data);
        $insights = $this->getInsights($ratios);
        $mlResponse = $this->callMlApi($ratios, $data);
        $aiPrediction = $mlResponse['ai_prediction'] ?? 'Sehat (Keuangan Stabil)';

        // Hitung 4 skor bar dari bar intensity (logikanya identik dengan buildResponse)
        $barCr     = min(100, max(0, ($ratios['currentRatio'] / 5.0) * 100));
        $barDer    = min(100, max(0, ($ratios['der'] / 1.5) * 100));
        $barRoa    = min(100, max(0, ($ratios['roa'] / 15.0) * 100));
        $barNpm    = min(100, max(0, ($ratios['npm'] / 20.0) * 100));
        $barTat    = min(100, max(0, ($ratios['tat'] / 1.5) * 100));
        $barGrowth = min(100, max(0, ($ratios['revGrowth'] / 20.0) * 100));

        $scoreLiquidity     = round($barCr);
        $scoreLeverage      = round(100 - $barDer);
        $scoreProfitability = round(($barRoa + $barNpm) / 2);
        $scoreEfficiency    = round(($barTat + $barGrowth) / 2);
        $avgScore = ($scoreProfitability + $scoreLiquidity + $scoreLeverage + $scoreEfficiency) / 4;

        UmkmHealth::create([
            'nama_usaha'          => $data['namaUsaha'] ?? 'UMKM',
            'current_assets'      => (float) ($data['currentAssets'] ?? 0),
            'current_liabilities' => (float) ($data['currentLiabilities'] ?? 0),
            'total_debt'          => (float) ($data['totalDebt'] ?? 0),
            'total_equity'        => (float) ($data['totalEquity'] ?? 0),
            'net_profit'          => (float) ($data['netProfit'] ?? 0),
            'total_assets'        => (float) ($data['totalAssets'] ?? 0),
            'sales'               => (float) ($data['sales'] ?? 0),
            'cash_inflow'         => (float) ($data['cashInflow'] ?? 0),
            'cash_outflow'        => (float) ($data['cashOutflow'] ?? 0),
            'previous_revenue'    => (float) ($data['previousRevenue'] ?? 0),
            'current_ratio'       => $ratios['currentRatio'],
            'der'                 => $ratios['der'],
            'roa'                 => $ratios['roa'],
            'npm'                 => $ratios['npm'],
            'tat'                 => $ratios['tat'],
            'ocf'                 => $ratios['ocf'],
            'rev_growth'          => $ratios['revGrowth'],
            'health_score'        => round($avgScore, 2),
            'ai_prediction'       => $aiPrediction,
        ]);

        return response()->json($this->buildResponse($ratios, $insights, $mlResponse, $aiPrediction, [
            'sales'               => $data['sales'] ?? 0,
            'net_profit'          => $data['netProfit'] ?? 0,
            'total_debt'          => $data['totalDebt'] ?? 0,
            'total_equity'        => $data['totalEquity'] ?? 0,
            'current_assets'      => $data['currentAssets'] ?? 0,
            'current_liabilities' => $data['currentLiabilities'] ?? 0,
            'health_score'        => round($avgScore, 2),
        ]));
    }

    /**
     * What-If Simulation — TIDAK menyimpan ke DB.
     * Bandingkan hasil simulasi dengan UmkmHealth::latest() (delta analysis).
     */
    public function simulate(Request $request)
    {
        $data     = $this->normalizeInput($request->all());
        $ratios   = $this->calculateRatios($data);
        $insights = $this->getInsights($ratios);
        $mlResponse = $this->callMlApi($ratios, $data);
        $aiPrediction = $mlResponse['ai_prediction'] ?? 'Sehat (Keuangan Stabil)';

        $simulation = $this->buildResponse($ratios, $insights, $mlResponse, $aiPrediction, $data);

        $latest = UmkmHealth::latest('id')->first();
        $delta  = null;

        if ($latest) {
            $delta = [
                'current_ratio' => [
                    'before' => round((float) $latest->current_ratio, 2),
                    'after'  => round($ratios['currentRatio'], 2),
                    'change' => round($ratios['currentRatio'] - (float) $latest->current_ratio, 2),
                ],
                'debt_equity_ratio' => [
                    'before' => round((float) $latest->der, 2),
                    'after'  => round($ratios['der'], 2),
                    'change' => round($ratios['der'] - (float) $latest->der, 2),
                ],
                'return_on_assets' => [
                    'before' => round((float) $latest->roa, 2),
                    'after'  => round($ratios['roa'], 2),
                    'change' => round($ratios['roa'] - (float) $latest->roa, 2),
                ],
                'net_profit_margin' => [
                    'before' => round((float) $latest->npm, 2),
                    'after'  => round($ratios['npm'], 2),
                    'change' => round($ratios['npm'] - (float) $latest->npm, 2),
                ],
                'total_asset_turnover' => [
                    'before' => round((float) $latest->tat, 2),
                    'after'  => round($ratios['tat'], 2),
                    'change' => round($ratios['tat'] - (float) $latest->tat, 2),
                ],
                'revenue_growth' => [
                    'before' => round((float) $latest->rev_growth, 2),
                    'after'  => round($ratios['revGrowth'], 2),
                    'change' => round($ratios['revGrowth'] - (float) $latest->rev_growth, 2),
                ],
                'ai_prediction' => [
                    'before' => $latest->ai_prediction,
                    'after'  => $aiPrediction,
                ],
            ];
        }

        return response()->json([
            'status'     => 'sukses',
            'type'       => 'simulasi',
            'simulation' => $simulation,
            'delta'      => $delta,
        ]);
    }
}
