from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

# Deklarasi awal aplikasi Flask (Ini yang hilang sebelumnya)
app = Flask(__name__)
CORS(app)

# Load model Machine Learning
model = joblib.load('model_rf_keuangan.pkl')

@app.route('/hitung-kesehatan', methods=['POST'])
def hitung_kesehatan():
    try:
        # 1. Tangkap paket data JSON dari Home.jsx
        data = request.get_json()
        nama_usaha = data.get('namaUsaha', 'Tanpa Nama')

        # 2. Ekstrak angka mentah dari frontend
        current_assets = float(data.get('currentAssets', 0))
        current_liabilities = float(data.get('currentLiabilities', 0))
        total_debt = float(data.get('totalDebt', 0))
        total_equity = float(data.get('totalEquity', 0))
        net_profit = float(data.get('netProfit', 0))
        total_assets = float(data.get('totalAssets', 0))
        sales = float(data.get('sales', 0))
        cash_inflow = float(data.get('cashInflow', 0))
        cash_outflow = float(data.get('cashOutflow', 0))
        previous_revenue = float(data.get('previousRevenue', 0))

        # 3. Hitung Rasio Keuangan (dengan pencegahan error pembagian dengan nol)
        cr = current_assets / current_liabilities if current_liabilities != 0 else 0
        der = total_debt / total_equity if total_equity != 0 else 0
        roa = net_profit / total_assets if total_assets != 0 else 0
        npm = net_profit / sales if sales != 0 else 0
        tato = sales / total_assets if total_assets != 0 else 0
        operating_cash_flow = cash_inflow - cash_outflow
        revenue_growth = ((sales - previous_revenue) / previous_revenue) if previous_revenue != 0 else 0

        # 4. Susun fitur persis seperti yang diminta oleh model Colab Anda
        fitur_model = {
            'CR': cr,
            'DER': der,
            'ROA': roa,
            'NPM': npm,
            'TATO': tato,
            'Operating_Cash_Flow': operating_cash_flow,
            'Revenue_Growth': revenue_growth
        }

        # 5. Konversi ke DataFrame dan lakukan prediksi
        df_input = pd.DataFrame([fitur_model])
        hasil_prediksi = model.predict(df_input)[0]

        # 6. Format respon yang dikembalikan ke Home.jsx
        status_kesehatan = 'Sehat (Keuangan Stabil)' if hasil_prediksi == 1 else 'Beresiko (Perlu Perhatian)'

        return jsonify({
            'status': 'sukses',
            'nama_usaha': nama_usaha,
            'hasil_prediksi': int(hasil_prediksi),
            'ai_prediction': status_kesehatan
        })

    except Exception as e:
        return jsonify({'status': 'error', 'pesan': str(e)}), 500

# Baris ini wajib ada di paling bawah untuk menjalankan server
if __name__ == '__main__':
    app.run(debug=True, port=5000)