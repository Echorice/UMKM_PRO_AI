import React, { useState, useEffect } from 'react';

export default function AnalisisAI() {
    const [analisis, setAnalisis] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fungsi untuk mengambil data hasil analisis dari Django Machine Learning API
    const fetchAnalisisAI = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8001/api/analisis/');
            const data = await response.json();
            setAnalisis(data);
        } catch (error) {
            console.error('Gagal memuat analisis AI:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalisisAI();
    }, []);

    const formatRupiah = (angka) => {
        if (!angka) return 'Rp0';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
    };

    // Menentukan warna badge status kesehatan berdasarkan hasil prediksi
    const getStatusColor = (status) => {
        if (!status) return 'bg-slate-100 text-slate-700';
        if (status.includes('Sehat')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        if (status.includes('Waspada')) return 'bg-amber-100 text-amber-800 border-amber-200';
        return 'bg-rose-100 text-rose-800 border-rose-200';
    };

    if (loading) {
        return (
            <div className="p-8 max-w-7xl mx-auto text-center text-slate-500">
                <p>🤖 Sedang memproses model Random Forest, mohon tunggu...</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header Halaman */}
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-purple-900 tracking-tight">🧠 Analisis Kesehatan Keuangan AI</h1>
                    <p className="text-slate-500 mt-1">Diagnosis otomatis performa finansial UMKM menggunakan algoritma Random Forest.</p>
                </div>
                <button
                    onClick={fetchAnalisisAI}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow transition-all text-sm"
                >
                    🔄 Perbarui Analisis
                </button>
            </div>

            {/* Konten Utama Hasil Analisis */}
            {analisis && analisis.status ? (
                <div className="space-y-6">
                    {/* Kartu Status Utama */}
                    <div className="bg-gradient-to-br from-purple-800 to-indigo-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                        <div className="absolute right-[-20px] bottom-[-30px] text-purple-700/20 text-9xl font-bold select-none pointer-events-none">
                            AI
                        </div>
                        <p className="text-purple-200 text-sm font-semibold uppercase tracking-wider">Status Diagnosis Model</p>
                        <h2 className="text-3xl md:text-4xl font-extrabold mt-2">
                            {analisis.status_kesehatan || analisis.status}
                        </h2>
                        <div className="mt-6 flex flex-wrap gap-4 items-center">
                            <span className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs text-purple-100 border border-white/10">
                                ⚙️ Mesin: {analisis.model_info || 'Random Forest Classifier'}
                            </span>
                            <span className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs text-purple-100 border border-white/10">
                                📊 Rasio Finansial: {analisis.rasio_keuangan ?? 'N/A'}
                            </span>
                        </div>
                    </div>

                    {/* Grid Informasi Metrik */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                            <p className="text-slate-400 text-sm font-medium">Akumulasi Pemasukan Dianalisis</p>
                            <h3 className="text-2xl font-bold text-emerald-600 mt-2">
                                {formatRupiah(analisis.total_pemasukan)}
                            </h3>
                            <p className="text-xs text-slate-400 mt-2">Sumber data riil dari tabel transaksi PostgreSQL.</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                            <p className="text-slate-400 text-sm font-medium">Akumulasi Pengeluaran Dianalisis</p>
                            <h3 className="text-2xl font-bold text-rose-600 mt-2">
                                {formatRupiah(analisis.total_pengeluaran)}
                            </h3>
                            <p className="text-xs text-slate-400 mt-2">Beban operasional dan pengeluaran tercatat.</p>
                        </div>
                    </div>

                    {/* Saran / Catatan AI */}
                    <div className="bg-purple-50 border border-purple-100 p-6 rounded-2xl shadow-sm">
                        <h4 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                            💡 Catatan & Rekomendasi Pintar
                        </h4>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Model klasifikasi Random Forest mengevaluasi perbandingan antara pemasukan dan pengeluaran harian Anda.
                            Pastikan Anda rajin memperbarui data pada menu <strong>Buku Kas Harian</strong> agar sistem AI dapat memberikan evaluasi kestabilan finansial UMKM yang semakin akurat.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-white p-12 text-center rounded-2xl shadow-lg border border-slate-100">
                    <p className="text-slate-500">Belum ada cukup data transaksi untuk diproses oleh model Machine Learning.</p>
                </div>
            )}
        </div>
    );
}