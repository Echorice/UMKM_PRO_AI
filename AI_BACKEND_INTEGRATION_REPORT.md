# AI Backend Integration Report

## Overview
Integrated Laravel backend with Flask ML microservice (`model_rf_keuangan.pkl`) for financial health prediction of UMKM companies.

## Changes Made

### 1. `UmkmHealthController.php` — Fully implemented
- **`calculateRatios()`**: Calculates 7 financial features from raw input:
  - CR = currentAssets/currentLiabilities (division-by-zero guard)
  - DER = totalDebt/totalEquity (division-by-zero guard)
  - ROA = netProfit/totalAssets × 100 (division-by-zero guard)
  - NPM = netProfit/sales × 100 (division-by-zero guard)
  - TAT = sales/totalAssets (division-by-zero guard)
  - OCF = cashInflow - cashOutflow
  - revGrowth = (sales - previousRevenue)/previousRevenue × 100 (division-by-zero guard)

- **`callMlApi()`**: POSTs 7 features to `http://127.0.0.1:5000/hitung-kesehatan`. Flask returns `status`, `ai_prediction`, `confidence`, `features_used`.

- **`getInsights()`**: Rule-based engine producing 5 possible insight strings based on DER, NPM, currentRatio, ROA, TAT, revGrowth thresholds.

- **`buildResponse()`**: Combines rule-engine insights + Flask ML diagnostics into unified JSON payload with 4 pillar scores (profitability, liquidity, leverage, efficiency), prediction label, intensity_scores for histogram, and imbalance diagnostics.

- **`store()`**: Persists raw input + calculated ratios + AI prediction to `umkm_healths` table. Returns full response payload.

- **`apiLatest()`**: Serves latest analysis from DB for initial page load.

- **`simulate()`**: What-if mode — computes predictions without DB write, provides delta vs latest recorded entry.

### 2. Flask API (`Api_model/App.py`)
- Endpoint `/hitung-kesehatan` accepts 7 features: CR, DER, ROA, NPM, TATO, Operating_Cash_Flow, Revenue_Growth
- ROA/NPM/Revenue_Growth expected in decimal fraction (0.075 == 7.5% per training scale)
- CR/DER/TATO expected as ratio (×1 kali)
- Loads `model_rf_keuangan.pkl` via joblib, returns `hasil_prediksi`, `ai_prediction`, `confidence`, `features_used`

### 3. Routes (`routes/web.php`)
- `POST /hitung-kesehatan` → `UmkmHealthController@store`
- `POST /api/analisis-ml` → `UmkmHealthController@store`
- `POST /api/simulasi-kesehatan` → `UmkmHealthController@simulate`
- `GET /api/analisis-latest` → `UmkmHealthController@apiLatest`

### 4. Database
- Migration `2026_09_03_133133_create_umkm_healths_table.php` creates table with fields: nama_usaha, current_assets, current_liabilities, total_debt, total_equity, net_profit, total_assets, sales, cash_inflow, cash_outflow, previous_revenue, current_ratio, der, roa, npm, tat, ocf, rev_growth, ai_prediction, timestamps

## End-to-End Verification
```
POST http://127.0.0.1:8000/api/analisis-ml
Payload: { namaUsaha: "Test", currentAssets: 50000000, currentLiabilities: 25000000,
            totalDebt: 30000000, totalEquity: 70000000, netProfit: 8000000,
            totalAssets: 100000000, sales: 120000000, cashInflow: 130000000,
            cashOutflow: 115000000, previousRevenue: 100000000 }

Response (verified):
{
  "status": "sukses",
  "profitability_score": 70, "liquidity_score": 100, "leverage_score": 85, "efficiency_score": 36,
  "prediction": "SEHAT", "confidence": 0.89,
  "ai_prediction": "Sehat (Keuangan Stabil)",
  "current_ratio": 2, "debt_equity_ratio": 0.4286, "return_on_assets": 8,
  "net_profit_margin": 6.67, "total_asset_turnover": 1.2,
  "operating_cash_flow": 15000000, "revenue_growth": 20,
  "insights": ["Kondisi keuangan stabil..."],
  "intensity_scores": {"risk_intensity": 21.4, "profitability_intensity": 43.3, "liquidity_intensity": 66.7, "efficiency_intensity": 80},
  "imbalance": ["Struktur Keuangan Seimbang"]
}
```

## Confirmed Working
- ✅ Ratio calculation with division-by-zero guards
- ✅ Flask ML prediction (`model_rf_keuangan.pkl`)
- ✅ Laravel DB persistence to `umkm_healths`
- ✅ Full response payload (scores, insights, intensity_scores, imbalance)
- ✅ `/api/analisis-latest` serves latest from DB
- ✅ `/api/simulasi-kesehatan` what-if mode with delta analysis
- ✅ All 6+1 ratios mapped to model features

## Reported Metrics (sample run)
- CR = 2.0, DER = 0.43, ROA = 8.0%, NPM = 6.67%, TAT = 1.2, revGrowth = 20%
- Prediction: Sehat (Keuangan Stabil), confidence 0.89
- Intensity scores within 0-100 range
- Imbalance: Struktur Keuangan Seimbang (no critical flags triggered)

## Edge Cases Handled
- Division by zero when currentLiabilities = 0 → CR = 0
- Division by zero when totalEquity = 0 → DER = 0
- Division by zero when totalAssets = 0 → ROA = 0, TAT = 0
- Division by zero when sales = 0 → NPM = 0
- Division by zero when previousRevenue = 0 → revGrowth = 0

## Notes
- The model expects 7 features; Laravel computes all 7 (including OCF) from raw input.
- Flask ROA/NPM/Revenue_Growth are interpreted as decimal fractions per training scale.
- All ratio formulas match user spec: CR, DER, ROA, NPM, TAT, rev growth.
- No new dependencies installed — uses existing Laravel HTTP client + Flask joblib.