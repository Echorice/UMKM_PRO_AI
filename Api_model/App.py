import os
from pathlib import Path

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)

MODEL_PATH = Path(__file__).with_name('model_rf_keuangan.pkl')
model = joblib.load(MODEL_PATH)

FEATURES = ['CR', 'DER', 'ROA', 'NPM', 'TATO', 'Operating_Cash_Flow', 'Revenue_Growth']


def _num(payload, *keys):
    """Ambil angka pertama yang ada; 0 kalau tidak ada / bukan angka."""
    for k in keys:
        v = payload.get(k)
        if v is not None and v != '':
            try:
                return float(v)
            except (TypeError, ValueError):
                continue
    return 0.0


@app.route('/hitung-kesehatan', methods=['POST'])
def hitung_kesehatan():
    """Mesin prediksi saja: terima 6 rasio dari Laravel, kembalikan vonis model.

    Laravel yang menghitung rasio dari nominal mentah. Endpoint ini tidak
    menghitung ulang rasio dan tidak menyentuh database.
    """
    try:
        data = request.get_json(silent=True) or {}

        cr = _num(data, 'CR', 'cr', 'current_ratio', 'currentRatio')
        der = _num(data, 'DER', 'der', 'debt_equity_ratio', 'debtEquityRatio')
        roa = _num(data, 'ROA', 'roa', 'return_on_assets', 'returnOnAssets')
        npm = _num(data, 'NPM', 'npm', 'net_profit_margin', 'netProfitMargin')
        tato = _num(data, 'TATO', 'tato', 'total_asset_turnover', 'totalAssetTurnover', 'TAT')
        ocf = _num(data, 'Operating_Cash_Flow', 'operating_cash_flow', 'ocf', 'cashFlow')
        rev_growth = _num(data, 'Revenue_Growth', 'revenue_growth', 'rev_growth', 'revenueGrowth')

        # Skala diserahkan ke caller: ROA / NPM / Revenue_Growth diharapkan
        # dalam fraksi desimal (0.075 == 7.5%) sesuai skala training model.
        # CR / DER / TATO dalam rasio (x kali).

        fitur = {
            'CR': cr,
            'DER': der,
            'ROA': roa,
            'NPM': npm,
            'TATO': tato,
            'Operating_Cash_Flow': ocf,
            'Revenue_Growth': rev_growth,
        }

        df_input = pd.DataFrame([fitur], columns=FEATURES)
        hasil = model.predict(df_input)[0]

        confidence = 0.85
        try:
            confidence = float(max(model.predict_proba(df_input)[0]))
        except Exception:
            pass

        sehat = int(hasil) == 1
        status = 'Sehat (Keuangan Stabil)' if sehat else 'Beresiko (Perlu Perhatian)'

        return jsonify({
            'status': 'sukses',
            'hasil_prediksi': int(hasil),
            'ai_prediction': status,
            'prediction': status,
            'confidence': round(confidence, 4),
            'features_used': {k: round(v, 4) for k, v in fitur.items()},
        })

    except Exception as e:
        return jsonify({'status': 'error', 'pesan': str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model': MODEL_PATH.name})


if __name__ == '__main__':
    app.run(port=5000)
