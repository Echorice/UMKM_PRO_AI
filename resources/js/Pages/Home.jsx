import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import DashboardLayout from '../Layouts/DashboardLayout';

export default function Home({ latestData }) {
    // 1. Menggunakan useState React murni untuk mem-bypass total error dari useForm Inertia
    const [form, setForm] = useState({
        namaUsaha: '', currentAssets: '', currentLiabilities: '', totalDebt: '',
        totalEquity: '', netProfit: '', totalAssets: '', sales: '', cashInflow: '',
        cashOutflow: '', previousRevenue: ''
    });

    const [loading, setLoading] = useState(false);

    // 2. Ambil data kas masuk dan kas keluar otomatis dari API Laravel internal (/api/transaksi)
    useEffect(() => {
        fetch('/api/transaksi')
            .then(res => res.json())
            .then(transaksiList => {
                const list = Array.isArray(transaksiList) ? transaksiList : (transaksiList.data || []);
                const totalMasuk = list
                    .filter(t => t.jenis_transaksi === 'Pemasukan' || t.jenis === 'Pemasukan')
                    .reduce((acc, curr) => acc + Number(curr.nominal || 0), 0);

                const totalKeluar = list
                    .filter(t => t.jenis_transaksi === 'Pengeluaran' || t.jenis === 'Pengeluaran')
                    .reduce((acc, curr) => acc + Number(curr.nominal || 0), 0);

                setForm(prev => ({
                    ...prev,
                    cashInflow: formatAngka(totalMasuk.toString()),
                    cashOutflow: formatAngka(totalKeluar.toString())
                }));
            })
            .catch(err => console.error("Gagal sinkronisasi buku kas:", err));
    }, []);

    const formatAngka = (value) => {
        if (!value) return '';
        const numberString = value.replace(/[^,\d]/g, '').toString();
        return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const bersih = (stringAngka) => {
        if (!stringAngka) return 0;
        return Number(stringAngka.toString().replace(/\./g, '')) || 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: name === 'namaUsaha' ? value : formatAngka(value)
        }));
    };

    // 3. Solusi Praktis: Eksekusi menggunakan Fetch API asli dari browser
    const hitungPrediksiAI = async (e) => {
        e.preventDefault();
        setLoading(true);

        const paketData = {
            namaUsaha: form.namaUsaha,
            currentAssets: bersih(form.currentAssets),
            currentLiabilities: bersih(form.currentLiabilities),
            totalDebt: bersih(form.totalDebt),
            totalEquity: bersih(form.totalEquity),
            netProfit: bersih(form.netProfit),
            totalAssets: bersih(form.totalAssets),
            sales: bersih(form.sales),
            cashInflow: bersih(form.cashInflow),
            cashOutflow: bersih(form.cashOutflow),
            previousRevenue: bersih(form.previousRevenue)
        };

        try {
            // Mengambil token keamanan langsung dari template Laravel
            const csrfToken = document.head.querySelector('meta[name="csrf-token"]')?.content;

            const response = await fetch('/hitung-kesehatan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(paketData)
            });

            if (response.ok) {
                // MUAT ULANG HALAMAN (Hard Refresh) untuk mengambil latestData terbaru dari Database
                window.location.reload();
            } else {
                alert('Gagal memproses data. Silakan periksa terminal backend Anda.');
                setLoading(false);
            }
        } catch (error) {
            console.error('Terjadi kesalahan fetch:', error);
            setLoading(false);
        }
    };

    // 4. Persiapan Data Grafik
    // Jika user mengetik input form totalDebt / totalEquity, gunakan nilai input form real-time.
    // Jika input form kosong / belum diisi, gunakan latestData dari database.
    const currentDebt = form.totalDebt ? bersih(form.totalDebt) : (parseFloat(latestData?.total_debt) || 0);
    const currentEquity = form.totalEquity ? bersih(form.totalEquity) : (parseFloat(latestData?.total_equity) || 0);

    let dataHistogram = [];
    let dataPie = [
        { name: 'Total Hutang', value: currentDebt },
        { name: 'Total Ekuitas', value: currentEquity },
    ];
    let warnaPie = ['#ef4444', '#8b5cf6']; // Merah untuk Hutang, Ungu untuk Ekuitas

    if (latestData) {
        // Histogram menampilkan 6 Indikator Rasio dari riwayat Database terakhir
        dataHistogram = [
            { name: 'CR (x)', nilai: parseFloat(latestData.current_ratio) || 0 },
            { name: 'DER (x)', nilai: parseFloat(latestData.der) || 0 },
            { name: 'ROA (%)', nilai: parseFloat(latestData.roa) || 0 },
            { name: 'NPM (%)', nilai: parseFloat(latestData.npm) || 0 },
            { name: 'TAT (x)', nilai: parseFloat(latestData.tat) || 0 },
            { name: 'Rev Growth (%)', nilai: parseFloat(latestData.rev_growth) || 0 },
        ];
    }

    return (
        <div className="py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-purple-900 tracking-tight">✨ Machine Learning Diagnostic</h1>
                    <p className="mt-3 text-lg text-slate-500">Masukkan metrik keuangan UMKM Anda untuk analisis mendalam.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* KOLOM KIRI: Input Form */}
                    <div className="lg:w-5/12 w-full bg-white p-8 rounded-2xl shadow-xl border-t-4 border-purple-600 h-fit">
                        <form className="space-y-4" onSubmit={hitungPrediksiAI}>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700">Nama Usaha</label>
                                <input name="namaUsaha" type="text" className="mt-1 block w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500" value={form.namaUsaha} onChange={handleChange} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-medium text-slate-700">Aset Lancar</label><input name="currentAssets" type="text" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg" value={form.currentAssets} onChange={handleChange} required/></div>
                                <div><label className="block text-xs font-medium text-slate-700">Kewajiban Lancar</label><input name="currentLiabilities" type="text" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg" value={form.currentLiabilities} onChange={handleChange} required/></div>
                                <div><label className="block text-xs font-medium text-slate-700">Total Hutang</label><input name="totalDebt" type="text" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg" value={form.totalDebt} onChange={handleChange} required/></div>
                                <div><label className="block text-xs font-medium text-slate-700">Total Ekuitas</label><input name="totalEquity" type="text" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg" value={form.totalEquity} onChange={handleChange} required/></div>
                                <div><label className="block text-xs font-medium text-slate-700">Laba Bersih</label><input name="netProfit" type="text" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg" value={form.netProfit} onChange={handleChange} required/></div>
                                <div><label className="block text-xs font-medium text-slate-700">Total Aset</label><input name="totalAssets" type="text" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg" value={form.totalAssets} onChange={handleChange} required/></div>
                                <div><label className="block text-xs font-medium text-slate-700">Pendapatan (Sales)</label><input name="sales" type="text" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg" value={form.sales} onChange={handleChange} required/></div>
                                <div><label className="block text-xs font-medium text-slate-700">Pendapatan Thn Lalu</label><input name="previousRevenue" type="text" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg" value={form.previousRevenue} onChange={handleChange} required/></div>
                                <div><label className="block text-xs font-medium text-slate-700">Kas Masuk (Auto)</label><input name="cashInflow" type="text" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50" value={form.cashInflow} onChange={handleChange} required/></div>
                                <div><label className="block text-xs font-medium text-slate-700">Kas Keluar (Auto)</label><input name="cashOutflow" type="text" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50" value={form.cashOutflow} onChange={handleChange} required/></div>
                            </div>
                            <button type="submit" disabled={loading} className="w-full mt-4 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg transition-all duration-200">
                                {loading ? 'Menganalisis...' : '🤖 Prediksi Machine Learning'}
                            </button>
                        </form>
                    </div>

                    {/* KOLOM KANAN: Visualisasi Data */}
                    <div className="lg:w-7/12 w-full space-y-6">
                        {latestData ? (
                            <div className="flex flex-col gap-6">

                                {/* KARTU HASIL AI */}
                                <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Hasil Analisis ML</h3>
                                        <p className="text-2xl font-extrabold text-slate-800 mt-1 capitalize">{latestData.nama_usaha}</p>
                                    </div>
                                    <div className={`px-6 py-3 rounded-full font-bold text-lg shadow-sm border ${
                                        latestData.ai_prediction && latestData.ai_prediction.includes('Sehat') ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'
                                    }`}>{latestData.ai_prediction}</div>
                                </div>

                                {/* Pie Chart berdasarkan latestData */}
                                <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
                                    <h4 className="text-sm font-bold text-slate-600 mb-4 text-center">Struktur Modal (Hutang vs Ekuitas)</h4>
                                    <div className="h-64 flex flex-col items-center justify-center">
                                        {latestData.total_debt == 0 && latestData.total_equity == 0 ? (<p className="text-slate-400 text-sm">Data tidak mencukupi</p>) : (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie data={dataPie} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={5} dataKey="value" animationDuration={1000}>
                                                        {dataPie.map((entry, index) => (<Cell key={`cell-${index}`} fill={warnaPie[index % warnaPie.length]} />))}
                                                    </Pie>
                                                    <Tooltip formatter={(value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        )}
                                        <div className="flex gap-4 mt-2 text-xs justify-center">
                                            <span className="flex items-center"><div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>Hutang</span>
                                            <span className="flex items-center"><div className="w-3 h-3 bg-purple-500 rounded-full mr-1"></div>Ekuitas</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bar Chart (Histogram) berdasarkan latestData - Tampilan Ungu Asli */}
                                <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
                                    <h4 className="text-sm font-bold text-slate-600 mb-4 text-center">Distribusi Indikator Rasio</h4>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={dataHistogram} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                                <XAxis dataKey="name" tick={{fontSize: 11}} interval={0} />
                                                <YAxis tick={{fontSize: 11}} />
                                                <Tooltip cursor={{fill: '#f3e8ff'}} />
                                                <Bar dataKey="nilai" fill="#8b5cf6" radius={[4, 4, 0, 0]} animationDuration={1000} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                            </div>
                        ) : (
                            <div className="bg-purple-50 p-10 rounded-2xl shadow-inner border border-purple-100 text-center h-full flex flex-col justify-center">
                                <span className="text-6xl mb-4">📊</span>
                                <h3 className="text-xl font-bold text-purple-900 mb-2">Menunggu Data...</h3>
                                <p className="text-slate-500">Silakan masukkan data keuangan UMKM di sebelah kiri untuk melihat visualisasi dan hasil prediksi Machine Learning.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

Home.layout = page => <DashboardLayout children={page} />;