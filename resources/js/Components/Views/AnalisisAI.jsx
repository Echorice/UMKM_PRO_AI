import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AnalisisAI() {
    const [form, setForm] = useState({
        namaUsaha: '',
        currentAssets: '',
        currentLiabilities: '',
        totalDebt: '',
        totalEquity: '',
        netProfit: '',
        totalAssets: '',
        sales: '',
        cashInflow: '',
        cashOutflow: '',
        previousRevenue: ''
    });

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        fetch('/api/transaksi')
            .then(res => res.json())
            .then(transaksiList => {
                const totalMasuk = transaksiList
                    .filter(t => t.jenis === 'pemasukan')
                    .reduce((acc, curr) => acc + Number(curr.nominal), 0);

                const totalKeluar = transaksiList
                    .filter(t => t.jenis === 'pengeluaran')
                    .reduce((acc, curr) => acc + Number(curr.nominal), 0);

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
        return parseFloat(stringAngka.replace(/\./g, '').replace(',', '.')) || 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (['cashInflow', 'cashOutflow', 'currentAssets', 'currentLiabilities', 'totalDebt', 'totalEquity', 'netProfit', 'totalAssets', 'sales', 'previousRevenue'].includes(name)) {
            setForm({ ...form, [name]: formatAngka(value) });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const hitungML = async (e) => {
        e.preventDefault();
        if (!form.namaUsaha) {
            alert("Nama usaha wajib diisi!");
            return;
        }

        const payload = {
            nama_usaha: form.namaUsaha,
            current_assets: bersih(form.currentAssets),
            current_liabilities: bersih(form.currentLiabilities),
            total_debt: bersih(form.totalDebt),
            total_equity: bersih(form.totalEquity),
            net_profit: bersih(form.netProfit),
            total_assets: bersih(form.totalAssets),
            sales: bersih(form.sales),
            cash_inflow: bersih(form.cashInflow),
            cash_outflow: bersih(form.cashOutflow),
            previous_revenue: bersih(form.previousRevenue)
        };

        setLoading(true);
        try {
            const response = await fetch('/api/analisis-ml', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setResult(data);
        } catch (err) {
            console.error("Error:", err);
            alert("Terjadi kesalahan saat memproses prediksi ML");
        } finally {
            setLoading(false);
        }
    };

    const fmt = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);

    const getHealthColor = (score) => {
        if (score >= 80) return 'text-emerald-600';
        if (score >= 60) return 'text-amber-600';
        return 'text-rose-600';
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Analisis AI & Machine Learning</h1>
                    <p className="text-sm text-slate-500 mt-1">Prediksi kesehatan keuangan & performa usaha berbasis data transaksi real-time.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Input */}
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">Input Data Keuangan</h3>
                    <form onSubmit={hitungML} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nama Usaha</label>
                            <input type="text" name="namaUsaha" value={form.namaUsaha} onChange={handleChange} placeholder="Contoh: Toko Berkah Jaya" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm" required />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Kas Masuk</label>
                                <input type="text" name="cashInflow" value={form.cashInflow} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm font-semibold text-emerald-600" readOnly />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Kas Keluar</label>
                                <input type="text" name="cashOutflow" value={form.cashOutflow} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm font-semibold text-rose-600" readOnly />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Aset Lancar</label>
                                <input type="text" name="currentAssets" value={form.currentAssets} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Total Hutang</label>
                                <input type="text" name="totalDebt" value={form.totalDebt} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Total Ekuitas</label>
                                <input type="text" name="totalEquity" value={form.totalEquity} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Total Aset</label>
                                <input type="text" name="totalAssets" value={form.totalAssets} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Laba Bersih</label>
                            <input type="text" name="netProfit" value={form.netProfit} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Penjualan</label>
                                <input type="text" name="sales" value={form.sales} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Pendapatan Sebelumnya</label>
                                <input type="text" name="previousRevenue" value={form.previousRevenue} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm" />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className={`w-full py-3 text-white font-bold rounded-xl shadow-lg transition-all text-sm disabled:opacity-50 bg-purple-600 hover:bg-purple-700`}>
                            {loading ? 'Memproses ML...' : 'Prediksi Machine Learning'}
                        </button>
                    </form>
                </div>

                {/* Hasil Prediksi */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">Hasil Analisis & Visualisasi</h3>

                    {!result ? (
                        <div className="flex flex-col items-center justify-center h-96 text-slate-400">
                            <svg className="w-16 h-16 mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <p className="text-lg font-medium">Menunggu Data...</p>
                            <p className="text-sm mt-1">Masukkan data keuangan di sebelah kiri untuk mendapatkan visualisasi dan hasil prediksi ML.</p>
                        </div>
                    ) : (
                        <>
                            {/* Health Score Cards */}
                            <div className="grid grid-cols-4 gap-4 mb-6">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                    <p className="text-xs text-slate-400 uppercase font-bold">Profitability</p>
                                    <p className="text-2xl font-black mt-1">{result.profitability_score}/100</p>
                                    <p className={`text-xs mt-1 ${getHealthColor(result.profitability_score)}`}>
                                        {result.profitability_score >= 80 ? 'Sangat Baik' : result.profitability_score >= 60 ? 'Cukup' : 'Perlu Perbaikan'}
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                    <p className="text-xs text-slate-400 uppercase font-bold">Liquidity</p>
                                    <p className="text-2xl font-black mt-1">{result.liquidity_score}/100</p>
                                    <p className={`text-xs mt-1 ${getHealthColor(result.liquidity_score)}`}>
                                        {result.liquidity_score >= 80 ? 'Sangat Baik' : result.liquidity_score >= 60 ? 'Cukup' : 'Perlu Perbaikan'}
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                    <p className="text-xs text-slate-400 uppercase font-bold">Leverage</p>
                                    <p className="text-2xl font-black mt-1">{result.leverage_score}/100</p>
                                    <p className={`text-xs mt-1 ${getHealthColor(result.leverage_score)}`}>
                                        {result.leverage_score >= 80 ? 'Sangat Baik' : result.leverage_score >= 60 ? 'Cukup' : 'Perlu Perbaikan'}
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                    <p className="text-xs text-slate-400 uppercase font-bold">Efficiency</p>
                                    <p className="text-2xl font-black mt-1">{result.efficiency_score}/100</p>
                                    <p className={`text-xs mt-1 ${getHealthColor(result.efficiency_score)}`}>
                                        {result.efficiency_score >= 80 ? 'Sangat Baik' : result.efficiency_score >= 60 ? 'Cukup' : 'Perlu Perbaikan'}
                                    </p>
                                </div>
                            </div>

                            {/* Prediction Result */}
                            {result.prediction && (
                                <div className={`p-4 rounded-xl mb-6 ${result.prediction === 'SEHAT' ? 'bg-emerald-50 border border-emerald-200' : result.prediction === 'RISIKO' ? 'bg-amber-50 border border-amber-200' : 'bg-rose-50 border border-rose-200'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-3xl ${result.prediction === 'SEHAT' ? 'text-emerald-600' : result.prediction === 'RISIKO' ? 'text-amber-600' : 'text-rose-600'}`}>
                                                {result.prediction === 'SEHAT' ? '✅' : result.prediction === 'RISIKO' ? '⚠️' : '❌'}
                                            </span>
                                            <div>
                                                <p className="text-sm text-slate-500">Status Prediksi</p>
                                                <h4 className={`text-xl font-black ${result.prediction === 'SEHAT' ? 'text-emerald-700' : result.prediction === 'RISIKO' ? 'text-amber-700' : 'text-rose-700'}`}>
                                                    {result.prediction}
                                                </h4>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-slate-500">Confidence</p>
                                            <p className="text-xl font-black text-purple-700">{(result.confidence * 100).toFixed(1)}%</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="h-80">
                                    <h4 className="text-sm font-bold text-slate-600 mb-3">Perbandingan Metrik Kesehatan</h4>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={[
                                            { name: 'Profitability', value: result.profitability_score, color: '#10b981' },
                                            { name: 'Liquidity', value: result.liquidity_score, color: '#3b82f6' },
                                            { name: 'Leverage', value: result.leverage_score, color: '#f59e0b' },
                                            { name: 'Efficiency', value: result.efficiency_score, color: '#8b5cf6' }
                                        ]}>
                                            <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                                            <Tooltip formatter={(value) => [`${value}/100`, 'Score']} />
                                            <Bar dataKey="value">
                                                <Cell fill="#10b981" />
                                                <Cell fill="#3b82f6" />
                                                <Cell fill="#f59e0b" />
                                                <Cell fill="#8b5cf6" />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="h-80">
                                    <h4 className="text-sm font-bold text-slate-600 mb-3">Distribusi Rasio Keuangan</h4>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Current Ratio', value: result.current_ratio || 0 },
                                                    { name: 'Debt/Equity', value: result.debt_equity_ratio || 0 },
                                                    { name: 'ROA', value: result.return_on_assets || 0 },
                                                    { name: 'Net Profit Margin', value: result.net_profit_margin || 0 }
                                                ]}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={2}
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                labelLine={false}
                                            >
                                                <Cell fill="#10b981" />
                                                <Cell fill="#3b82f6" />
                                                <Cell fill="#f59e0b" />
                                                <Cell fill="#8b5cf6" />
                                            </Pie>
                                            <Tooltip formatter={(value) => [value.toFixed(2), 'Ratio']} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Recommendations */}
                            {result.recommendations && result.recommendations.length > 0 && (
                                <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
                                    <h4 className="text-sm font-bold text-purple-700 mb-2">💡 Rekomendasi AI</h4>
                                    <ul className="space-y-1 text-sm text-purple-800">
                                        {result.recommendations.map((rec, i) => (
                                            <li key={i} className="flex items-start gap-2">• {rec}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}