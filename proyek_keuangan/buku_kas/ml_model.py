import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from .models import Transaksi

def compute_financial_metrics():
    """Ambil data transaksi, hitung rasio keuangan riil (CR, DER, ROA, NPM, TAT, Rev Growth)."""
    data = list(Transaksi.objects.all().values('jenis_transaksi', 'nominal', 'kategori', 'tanggal'))

    if not data:
        return None

    df = pd.DataFrame(data)
    df['nominal'] = df['nominal'].astype(float)

    # Agregasi sederhana dari buku kas
    pemasukan = df[df['jenis_transaksi'] == 'Pemasukan']['nominal'].sum()
    pengeluaran = df[df['jenis_transaksi'] == 'Pengeluaran']['nominal'].sum()

    # Untuk simulasi: asumsikan aset lancar ~ pemasukan, utang lancar ~ pengeluaran
    # Asumsi rough: total assets = pemasukan, equity = pemasukan - pengeluaran, debt = pengeluaran
    # Ini hanya estimasi dari cash book, bukan neraca penuh
    ca = pemasukan if pemasukan > 0 else 1
    cl = pengeluaran if pengeluaran > 0 else 1
    td = pengeluaran
    te = max(pemasukan - pengeluaran, 1)
    ta = ca + td  # simplified
    np = pemasukan - pengeluaran
    sales = pemasukan  # anggap semua pemasukan = penjualan

    # Hitung metrik
    cr = ca / cl if cl > 0 else 0
    der = td / te if te > 0 else 0
    roa = (np / ta) * 100 if ta > 0 else 0
    npm = (np / sales) * 100 if sales > 0 else 0
    tat = sales / ta if ta > 0 else 0

    # Rev growth: butuh data historis, kita set 0 default
    rg = 0.0

    # Clamp ke range wajar
    npm = max(min(npm, 100), -100)
    roa = max(min(roa, 100), -50)
    tat = max(min(tat, 10), 0)
    der = max(min(der, 10), 0)
    cr = max(min(cr, 20), 0)

    return {
        'current_ratio': round(cr, 2),
        'der': round(der, 2),
        'roa': round(roa, 2),
        'npm': round(npm, 2),
        'tat': round(tat, 2),
        'rev_growth': round(rg, 2),
        'total_pemasukan': pemasukan,
        'total_pengeluaran': pengeluaran,
    }


def analisis_kesehatan_keuangan():
    # 1. Ambil data transaksi dari PostgreSQL
    metrics = compute_financial_metrics()

    if not metrics:
        return {
            "status": "Belum ada data",
            "pesan": "Masukkan minimal beberapa transaksi untuk dianalisis."
        }

    pemasukan = metrics['total_pemasukan']
    pengeluaran = metrics['total_pengeluaran']

    # Rasio kas sederhana
    rasio = pemasukan / (pengeluaran if pengeluaran > 0 else 1)

    # Dummy Dataset & Training Model Random Forest Sederhana
    X_train = [
        [10000000, 2000000, 5.0],   # Sehat
        [5000000, 1000000, 5.0],    # Sehat
        [3000000, 3000000, 1.0],    # Waspada
        [1000000, 4000000, 0.25],   # Kritis
        [500000, 2500000, 0.2]      # Kritis
    ]
    y_train = [2, 2, 1, 0, 0]

    rf_model = RandomForestClassifier(n_estimators=10, random_state=42)
    rf_model.fit(X_train, y_train)

    fitur_terkini = [[float(pemasukan), float(pengeluaran), float(rasio)]]
    prediksi_skor = rf_model.predict(fitur_terkini)[0]

    status_map = {
        2: "Sehat (Keuangan Stabil)",
        1: "Waspada (Perlu Kontrol Pengeluaran)",
        0: "Kritis (Pengeluaran Melebihi Pemasukan)"
    }

    # Gabungkan metrics + status
    result = {
        "total_pemasukan": pemasukan,
        "total_pengeluaran": pengeluaran,
        "rasio_keuangan": round(rasio, 2),
        "status_kesehatan": status_map.get(prediksi_skor, "Normal"),
        "model_info": "Random Forest Classifier (Scikit-Learn)",
    }
    result.update(metrics)
    return result


def prediksi_dari_metrics(data_input):
    # Dummy Dataset untuk Training Random Forest (6 fitur finansial)
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
    
    # Return full metrics + prediction
    return {
        "prediction": status_map.get(prediksi, "Sehat (Keuangan Stabil)"),
        "metrics": {
            "current_ratio": cr,
            "der": der,
            "roa": roa,
            "npm": npm,
            "tat": tat,
            "rev_growth": rg
        }
    }