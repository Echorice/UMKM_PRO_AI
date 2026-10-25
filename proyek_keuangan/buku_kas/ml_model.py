import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from .models import Transaksi

def analisis_kesehatan_keuangan():
    # 1. Ambil data transaksi dari PostgreSQL
    data = list(Transaksi.objects.all().values('jenis_transaksi', 'nominal', 'kategori'))

    if not data:
        return {"status": "Belum ada data", "pesan": "Masukkan minimal beberapa transaksi untuk dianalisis."}

    df = pd.DataFrame(data)

    # 2. Rekayasa Fitur (Feature Engineering)
    # Menghitung total pemasukan dan pengeluaran
    pemasukan = df[df['jenis_transaksi'] == 'Pemasukan']['nominal'].astype(float).sum()
    pengeluaran = df[df['jenis_transaksi'] == 'Pengeluaran']['nominal'].astype(float).sum()

    # Menghitung rasio kas (Cash Ratio / Rasio Operasional)
    rasio = pemasukan / (pengeluaran if pengeluaran > 0 else 1)

    # 3. Dummy Dataset & Training Model Random Forest Sederhana
    # Kita buat data latih simulasi untuk melatih pohon keputusan (Random Forest)
    # Fitur: [Total Pemasukan, Total Pengeluaran, Rasio]
    X_train = [
        [10000000, 2000000, 5.0],   # Sehat
        [5000000, 1000000, 5.0],    # Sehat
        [3000000, 3000000, 1.0],    # Waspada
        [1000000, 4000000, 0.25],   # Kritis
        [500000, 2500000, 0.2]      # Kritis
    ]
    # Label Target: 0 = Kritis, 1 = Waspada, 2 = Sehat
    y_train = [2, 2, 1, 0, 0]

    # Inisialisasi dan latih model Random Forest
    rf_model = RandomForestClassifier(n_estimators=10, random_state=42)
    rf_model.fit(X_train, y_train)

    # 4. Prediksi berdasarkan data riil UMKM saat ini
    fitur_terkini = [[float(pemasukan), float(pengeluaran), float(rasio)]]
    prediksi_skor = rf_model.predict(fitur_terkini)[0]

    # Terjemahkan hasil angka ke status teks
    status_map = {
        2: "Sehat (Keuangan Stabil)",
        1: "Waspada (Perlu Kontrol Pengeluaran)",
        0: "Kritis (Pengeluaran Melebihi Pemasukan)"
    }

    return {
        "total_pemasukan": pemasukan,
        "total_pengeluaran": pengeluaran,
        "rasio_keuangan": round(rasio, 2),
        "status_kesehatan": status_map.get(prediksi_skor, "Normal"),
        "model_info": "Random Forest Classifier (Scikit-Learn)"
    }

import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from .models import Transaksi

def prediksi_dari_metrics(data_input):
    # Dummy Dataset untuk Training Random Forest
    X_train = [
        [2.5, 0.5, 10.0, 15.0, 1.2, 5.0],  # Sehat
        [2.0, 0.8, 8.0, 10.0, 1.0, 4.0],   # Sehat
        [1.1, 1.5, 2.0, 2.0, 0.8, 1.0],    # Waspada
        [0.5, 2.5, -5.0, -2.0, 0.4, -2.0], # Kritis
        [0.3, 3.0, -10.0, -5.0, 0.2, -5.0] # Kritis
    ]
    y_train = [2, 2, 1, 0, 0] # 2: Sehat, 1: Waspada, 0: Kritis

    rf_model = RandomForestClassifier(n_estimators=10, random_state=42)
    rf_model.fit(X_train, y_train)

    # Ambil data kiriman dari Laravel
    cr = float(data_input.get('current_ratio', 1.0))
    der = float(data_input.get('der', 1.0))
    roa = float(data_input.get('roa', 5.0))
    npm = float(data_input.get('npm', 5.0))
    tat = float(data_input.get('tat', 1.0))
    rg = float(data_input.get('rev_growth', 5.0))

    fitur = [[cr, der, roa, npm, tat, rg]]
    prediksi = rf_model.predict(fitur)[0]

    status_map = {
        2: "Sehat (Keuangan Stabil)",
        1: "Waspada (Perlu Kontrol)",
        0: "Kritis (Performa Rendah)"
    }
    return status_map.get(prediksi, "Sehat (Keuangan Stabil)")