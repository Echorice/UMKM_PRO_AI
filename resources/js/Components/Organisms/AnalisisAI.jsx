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

    // What-If Simulation State
    const [salesChange, setSalesChange] = useState(0);
    const [debtChange, setDebtChange] = useState(0);

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
        if (score >= 80) return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
        if (score >= 60) return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
        return 'text-rose-400 bg-rose-500/20 border-rose-500/30';
    };

    return (
        <div className="bg-[#0E0B1D] min-h-screen p-6 md:p-8 text-slate-100">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Analisis AI & Machine Learning</h1>
                        <p className="text-[#C9C2E3] mt-1 text-sm">Prediksi kesehatan keuangan & performa usaha berbasis data transaksi real-time.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form Input */}
                    <div className="lg:col-span-1 bg-[#2A1E4D] p-6 rounded-2xl shadow-xl border border-[#3A3A52] h-fit">
                        <h3 className="text-lg font-bold text-white mb-4 pb-3 border-b border-[#3A3A52]">Input Data Keuangan</h3>
                        <form onSubmit={hitungML} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Nama Usaha</label>
                                <input type="text" name="namaUsaha" value={form.namaUsaha} onChange={handleChange} placeholder="Contoh: Toko Berkah Jaya" className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm" required />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Kas Masuk</label>
                                    <input type="text" name="cashInflow" value={form.cashInflow} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-emerald-400 focus:outline-none text-sm font-semibold" readOnly />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Kas Keluar</label>
                                    <input type="text" name="cashOutflow" value={form.cashOutflow} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-rose-400 focus:outline-none text-sm font-semibold" readOnly />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Aset Lancar</label>
                                    <input type="text" name="currentAssets" value={form.currentAssets} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Total Hutang</label>
                                    <input type="text" name="totalDebt" value={form.totalDebt} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Total Ekuitas</label>
                                    <input type="text" name="totalEquity" value={form.totalEquity} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Total Aset</label>
                                    <input type="text" name="totalAssets" value={form.totalAssets} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Laba Bersih</label>
                                <input type="text" name="netProfit" value={form.netProfit} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col justify-end">
                                    <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1 h-8 flex items-end">Penjualan</label>
                                    <input type="text" name="sales" value={form.sales} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm" />
                                </div>
                                <div className="flex flex-col justify-end">
                                    <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1 h-8 flex items-end">Pendapatan Sebelumnya</label>
                                    <input type="text" name="previousRevenue" value={form.previousRevenue} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm" />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="w-full py-3 text-white font-bold rounded-xl shadow-lg transition-all text-sm disabled:opacity-50 bg-gradient-to-r from-[#5A3B8C] to-[#8B7CC7] hover:opacity-90">
                                {loading ? 'Memproses ML...' : 'Prediksi Machine Learning'}
                            </button>
                        </form>
                    </div>

                    {/* Hasil Prediksi */}
                    <div className="lg:col-span-2 bg-[#2A1E4D] p-6 rounded-2xl shadow-xl border border-[#3A3A52]">
                        <h3 className="text-lg font-bold text-white mb-4 pb-3 border-b border-[#3A3A52]">Hasil Analisis & Visualisasi</h3>

                        {!result ? (
                            <div className="flex flex-col items-center justify-center h-96 text-[#C9C2E3]/60">
                                <svg className="w-16 h-16 mb-4 text-[#5A3B8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <p className="text-lg font-medium text-white">Menunggu Data...</p>
                                <p className="text-sm mt-1 text-[#C9C2E3]">Masukkan data keuangan di sebelah kiri untuk mendapatkan visualisasi dan hasil prediksi ML.</p>
                            </div>
                        ) : (
                            <>
                                {/* Health Score Cards */}
                                <div className="grid grid-cols-4 gap-4 mb-6">
                                    <div className="p-4 bg-[#0E0B1D] rounded-xl border border-[#3A3A52] text-center">
                                        <p className="text-xs text-[#C9C2E3] uppercase font-bold">Profitability</p>
                                        <p className="text-2xl font-black text-white mt-1">{result.profitability_score}/100</p>
                                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-2 border ${getHealthColor(result.profitability_score)}`}>
                                            {result.profitability_score >= 80 ? 'Sangat Baik' : result.profitability_score >= 60 ? 'Cukup' : 'Perlu Perbaikan'}
                                        </span>
                                    </div>
                                    <div className="p-4 bg-[#0E0B1D] rounded-xl border border-[#3A3A52] text-center">
                                        <p className="text-xs text-[#C9C2E3] uppercase font-bold">Liquidity</p>
                                        <p className="text-2xl font-black text-white mt-1">{result.liquidity_score}/100</p>
                                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-2 border ${getHealthColor(result.liquidity_score)}`}>
                                            {result.liquidity_score >= 80 ? 'Sangat Baik' : result.liquidity_score >= 60 ? 'Cukup' : 'Perlu Perbaikan'}
                                        </span>
                                    </div>
                                    <div className="p-4 bg-[#0E0B1D] rounded-xl border border-[#3A3A52] text-center">
                                        <p className="text-xs text-[#C9C2E3] uppercase font-bold">Leverage</p>
                                        <p className="text-2xl font-black text-white mt-1">{result.leverage_score}/100</p>
                                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-2 border ${getHealthColor(result.leverage_score)}`}>
                                            {result.leverage_score >= 80 ? 'Sangat Baik' : result.leverage_score >= 60 ? 'Cukup' : 'Perlu Perbaikan'}
                                        </span>
                                    </div>
                                    <div className="p-4 bg-[#0E0B1D] rounded-xl border border-[#3A3A52] text-center">
                                        <p className="text-xs text-[#C9C2E3] uppercase font-bold">Efficiency</p>
                                        <p className="text-2xl font-black text-white mt-1">{result.efficiency_score}/100</p>
                                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-2 border ${getHealthColor(result.efficiency_score)}`}>
                                            {result.efficiency_score >= 80 ? 'Sangat Baik' : result.efficiency_score >= 60 ? 'Cukup' : 'Perlu Perbaikan'}
                                        </span>
                                    </div>
                                </div>

                                {/* Prediction Result */}
                                {result.prediction && (
                                    <div className={`p-4 rounded-xl mb-6 border ${result.prediction === 'SEHAT' ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' : result.prediction === 'RISIKO' ? 'bg-amber-950/40 border-amber-500/30 text-amber-300' : 'bg-rose-950/40 border-rose-500/30 text-rose-300'}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl">
                                                    {result.prediction === 'SEHAT' ? '✅' : result.prediction === 'RISIKO' ? '⚠️' : '❌'}
                                                </span>
                                                <div>
                                                    <p className="text-xs text-[#C9C2E3] uppercase font-semibold">Status Prediksi</p>
                                                    <h4 className="text-xl font-black">
                                                        {result.prediction}
                                                    </h4>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-[#C9C2E3] uppercase font-semibold">Confidence</p>
                                                <p className="text-xl font-black text-[#8B7CC7]">{(result.confidence * 100).toFixed(1)}%</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Charts */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="h-80 bg-[#0E0B1D] p-4 rounded-xl border border-[#3A3A52]">
                                        <h4 className="text-xs font-bold text-[#C9C2E3] uppercase mb-3">Perbandingan Metrik Kesehatan</h4>
                                        <ResponsiveContainer width="100%" height="90%">
                                            <BarChart data={[
                                                { name: 'Profitability', value: result.profitability_score },
                                                { name: 'Liquidity', value: result.liquidity_score },
                                                { name: 'Leverage', value: result.leverage_score },
                                                { name: 'Efficiency', value: result.efficiency_score }
                                            ]}>
                                                <XAxis dataKey="name" stroke="#C9C2E3" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                                <YAxis domain={[0, 100]} stroke="#C9C2E3" tick={{ fontSize: 11 }} />
                                                <Tooltip contentStyle={{ backgroundColor: '#2A1E4D', borderColor: '#3A3A52', borderRadius: '12px', color: '#fff' }} formatter={(value) => [`${value}/100`, 'Score']} />
                                                <Bar dataKey="value" fill="#8B7CC7" radius={[6, 6, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="h-80 bg-[#0E0B1D] p-4 rounded-xl border border-[#3A3A52]">
                                        <h4 className="text-xs font-bold text-[#C9C2E3] uppercase mb-3">Distribusi Rasio Keuangan</h4>
                                        <ResponsiveContainer width="100%" height="90%">
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
                                                    innerRadius={50}
                                                    outerRadius={85}
                                                    paddingAngle={3}
                                                    dataKey="value"
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                    labelLine={false}
                                                >
                                                    <Cell fill="#5A3B8C" />
                                                    <Cell fill="#8B7CC7" />
                                                    <Cell fill="#10B981" />
                                                    <Cell fill="#F59E0B" />
                                                </Pie>
                                                <Tooltip contentStyle={{ backgroundColor: '#2A1E4D', borderColor: '#3A3A52', borderRadius: '12px', color: '#fff' }} formatter={(value) => [value.toFixed(2), 'Ratio']} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Recommendations */}
                                {result.recommendations && result.recommendations.length > 0 && (
                                    <div className="mt-6 p-5 bg-gradient-to-r from-amber-950/40 to-purple-950/40 rounded-xl border border-amber-500/30">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-xl">💡</span>
                                            <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wide">AI Actionable Insights & Rekomendasi Tindakan</h4>
                                        </div>
                                        <ul className="space-y-2 text-sm text-[#C9C2E3] pl-2">
                                            {result.recommendations.map((rec, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="text-amber-400 font-bold">•</span>
                                                    <span>{rec}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* What-If Simulation ("What-If" Analysis) */}
                                <div className="mt-6 p-5 bg-[#0E0B1D] rounded-xl border border-[#3A3A52]">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h4 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                                                <span>🎛️</span> Simulasi Keuangan ("What-If" Analysis)
                                            </h4>
                                            <p className="text-xs text-[#C9C2E3] mt-0.5">Geser slider untuk melihat simulasi real-time terhadap prediksi kesehatan ML.</p>
                                        </div>
                                        <button 
                                            onClick={() => { setSalesChange(0); setDebtChange(0); }}
                                            className="text-xs text-[#8B7CC7] hover:text-white underline"
                                        >
                                            Reset Simulasi
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <div className="flex justify-between text-xs text-[#C9C2E3] mb-1">
                                                <span>Simulasi Perubahan Penjualan</span>
                                                <span className="text-white font-bold">{salesChange > 0 ? `+${salesChange}%` : `${salesChange}%`}</span>
                                            </div>
                                            <input 
                                                type="range" 
                                                min="-50" 
                                                max="50" 
                                                value={salesChange} 
                                                onChange={(e) => setSalesChange(Number(e.target.value))}
                                                className="w-full accent-[#8B7CC7] cursor-pointer"
                                            />
                                            <div className="flex justify-between text-[10px] text-[#C9C2E3]/60 mt-1">
                                                <span>-50% (Turun)</span>
                                                <span>0% (Asli)</span>
                                                <span>+50% (Naik)</span>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-xs text-[#C9C2E3] mb-1">
                                                <span>Simulasi Perubahan Total Hutang</span>
                                                <span className="text-white font-bold">{debtChange > 0 ? `+${debtChange}%` : `${debtChange}%`}</span>
                                            </div>
                                            <input 
                                                type="range" 
                                                min="-50" 
                                                max="50" 
                                                value={debtChange} 
                                                onChange={(e) => setDebtChange(Number(e.target.value))}
                                                className="w-full accent-[#8B7CC7] cursor-pointer"
                                            />
                                            <div className="flex justify-between text-[10px] text-[#C9C2E3]/60 mt-1">
                                                <span>-50% (Pelunasan)</span>
                                                <span>0% (Asli)</span>
                                                <span>+50% (Penambahan)</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Simulated Score Preview */}
                                    <div className="mt-5 pt-4 border-t border-[#3A3A52] flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-[#C9C2E3] uppercase font-semibold">Hasil Simulasi Prediksi:</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                                (result.profitability_score + (salesChange * 0.4) - (debtChange * 0.2)) >= 75 
                                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                                                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                            }`}>
                                                {(result.profitability_score + (salesChange * 0.4) - (debtChange * 0.2)) >= 75 ? 'SEHAT (Simulasi Optimal)' : 'RISIKO (Perlu Perhatian Simulasi)'}
                                            </span>
                                        </div>
                                        <div className="text-xs text-[#C9C2E3]">
                                            Simulasi Skor Kesehatan: <strong className="text-white font-black text-sm">
                                                {Math.min(100, Math.max(0, Math.round(result.profitability_score + (salesChange * 0.3) - (debtChange * 0.2))))}/100
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}