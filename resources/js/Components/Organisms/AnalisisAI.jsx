import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { InfoIcon, AlertTriangle } from 'lucide-react';

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
    const [simResult, setSimResult] = useState(null);

    // What-If Simulation State
    const [simulationMode, setSimulationMode] = useState(false);
    const [salesChange, setSalesChange] = useState(0);
    const [debtChange, setDebtChange] = useState(0);
    const [opexChange, setOpexChange] = useState(0);

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

    // Fetch latest analysis from database on mount
    useEffect(() => {
        fetch('/api/analisis-latest')
            .then(res => res.json())
            .then(data => {
                if (data && data.status !== 'empty') {
                    setResult(data);
                }
            })
            .catch(err => console.error("Gagal memuat analisis terakhir:", err));
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

    const handleSubmit = async (e) => {
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

        // Add simulation params when in simulation mode
        if (simulationMode) {
            payload.sales_change_pct = salesChange;
            payload.debt_change_pct = debtChange;
            payload.opex_change_pct = opexChange;
        }

        const endpoint = simulationMode ? '/api/simulasi-kesehatan' : '/api/analisis-ml';
        const targetState = simulationMode ? setSimResult : setResult;

        setLoading(true);
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            targetState(data);
        } catch (err) {
            console.error("Error:", err);
            alert(simulationMode ? "Terjadi kesalahan saat menjalankan simulasi" : "Terjadi kesalahan saat memproses prediksi ML");
        } finally {
            setLoading(false);
        }
    };

    const fmt = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);

    const getHealthColor = (score) => {
        if (score >= 80) return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
        if (score >= 50 && score < 80) return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
        return 'text-rose-400 bg-rose-500/20 border-rose-500/30';
    };

    const getHealthStatus = (score) => {
        if (score >= 80) return 'Sehat';
        if (score >= 50 && score < 80) return 'Beresiko';
        return 'Krisis';
    };

    const scores = {
        profitability: Number(result?.scores?.profitability ?? result?.profitability_score ?? 0),
        liquidity: Number(result?.scores?.liquidity ?? result?.liquidity_score ?? 0),
        leverage: Number(result?.scores?.leverage ?? result?.leverage_score ?? 0),
        efficiency: Number(result?.scores?.efficiency ?? result?.efficiency_score ?? 0),
    };

    // Rerata 4 pilar: kolom DB (health_score) > scores.average dari API > hitung lokal
    const avgScore = typeof result?.health_score === 'number' ? result.health_score
        : typeof result?.scores?.average === 'number' ? result.scores.average
        : (scores.profitability + scores.liquidity + scores.leverage + scores.efficiency) / 4;

    const ratioHistogramData = result?.bar_chart ? [
        { name: 'CR (Liquidity)', value: Number(result.bar_chart.cr ?? 0), fill: '#8B7CC7' },
        { name: 'DER (Risk)', value: Number(result.bar_chart.der ?? 0), fill: '#EF4444' },
        { name: 'ROA (Profit)', value: Number(result.bar_chart.roa ?? 0), fill: '#10B981' },
        { name: 'NPM (Profit)', value: Number(result.bar_chart.npm ?? 0), fill: '#F59E0B' },
        { name: 'TAT (Efficiency)', value: Number(result.bar_chart.tat ?? 0), fill: '#3B82F6' },
        { name: 'Growth (Efficiency)', value: Number(result.bar_chart.growth ?? 0), fill: '#EC4899' },
    ] : [
        { name: 'CR (Liquidity)', value: Number(result?.intensity_scores?.liquidity_intensity ?? result?.liquidity_intensity ?? result?.liquidity_score ?? 0), fill: '#8B7CC7' },
        { name: 'DER (Risk)', value: Number(result?.intensity_scores?.risk_intensity ?? result?.risk_intensity ?? result?.leverage_score ?? 0), fill: '#EF4444' },
        { name: 'ROA (Profit)', value: Number(result?.intensity_scores?.profitability_intensity ?? result?.profitability_intensity ?? result?.profitability_score ?? 0), fill: '#10B981' },
        { name: 'NPM (Profit)', value: Number(result?.intensity_scores?.profitability_intensity ?? result?.profitability_intensity ?? result?.profitability_score ?? 0), fill: '#F59E0B' },
        { name: 'TAT (Efficiency)', value: Number(result?.intensity_scores?.efficiency_intensity ?? result?.efficiency_intensity ?? result?.efficiency_score ?? 0), fill: '#3B82F6' },
        { name: 'Growth (Efficiency)', value: Number(result?.intensity_scores?.efficiency_intensity ?? result?.efficiency_intensity ?? result?.efficiency_score ?? 0), fill: '#EC4899' },
    ];

    // Prepare data for Total Debt vs Total Equity Pie Chart
    const debtVsEquityData = result ? [
        { name: 'Total Hutang', value: Number(result.raw?.total_debt ?? result.total_debt) || 0, fill: '#EF4444' },
        { name: 'Total Ekuitas', value: Number(result.raw?.total_equity ?? result.total_equity) || 0, fill: '#3B82F6' }
    ] : [];


    const renderDelta = (d) => {
        const delta = d.sim - d.factual;
        const deltaAbs = Math.abs(delta);
        const fmtDelta = deltaAbs.toFixed(d.decimals || 0);
        const sign = delta > 0 ? '+' : delta < 0 ? '' : '±';
        const deltaStr = `${sign}${fmtDelta}${d.unit}`;
        const isPositive = delta > 0;
        const statusColor = isPositive ? 'text-emerald-400' : delta < 0 ? 'text-rose-400' : 'text-amber-400';
        const statusText = isPositive ? 'Membaik' : delta < 0 ? 'Memburuk' : 'Stabil';
        return (
            <div key={d.label} className="bg-[#0E0B1D] rounded-xl border border-[#3A3A52] p-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-[#C9C2E3] uppercase">{d.label}</span>
                    <span className={`text-xs font-bold ${statusColor}`}>{statusText}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-[#C9C2E3]">
                    <div>
                        <p className="text-white font-semibold">{d.factual.toFixed(d.decimals || 0)}{d.unit}</p>
                        <p className="text-[10px]">Faktual</p>
                    </div>
                    <div className="relative">
                        <p className="text-white font-semibold">{d.sim.toFixed(d.decimals || 0)}{d.unit}</p>
                        <p className="text-[10px]">Simulasi</p>
                    </div>
                    <div>
                        <p className={`text-white font-bold ${statusColor}`}>{deltaStr}</p>
                        <p className="text-[10px]">Delta</p>
                    </div>
                </div>
            </div>
        );
    };

    // Helper functions for prediction styling
    const PredictionBorder = ({ prediction }) => {
        if (!prediction) return 'border-[#3A3A52]';
        const p = prediction.toLowerCase();
        if (p.includes('sehat')) return 'border-emerald-500/50';
        if (p.includes('beresiko') || p.includes('risk')) return 'border-amber-500/50';
        return 'border-rose-500/50';
    };

    const PredictionBg = ({ prediction }) => {
        if (!prediction) return 'bg-[#3A3A52]/30';
        const p = prediction.toLowerCase();
        if (p.includes('sehat')) return 'bg-emerald-500/20';
        if (p.includes('beresiko') || p.includes('risk')) return 'bg-amber-500/20';
        return 'bg-rose-500/20';
    };

    const PredictionIcon = ({ prediction }) => {
        if (!prediction) return <div className="w-6 h-6 text-[#C9C2E3]" />;
        const p = prediction.toLowerCase();
        if (p.includes('sehat')) {
            return (
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
        }
        if (p.includes('beresiko') || p.includes('risk')) {
            return (
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            );
        }
        return (
            <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        );
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

                {/* Form Input Data Keuangan - Dipindah ke Paling Atas */}
                <div className="bg-[#2A1E4D] p-6 rounded-2xl shadow-xl border border-[#3A3A52]">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#3A3A52]">
                        <h3 className="text-lg font-bold text-white">Input Data Keuangan Usaha</h3>
                        {/* Simulation Mode Toggle */}
                        <div className="flex items-center gap-3 bg-[#0E0B1D] px-4 py-2 rounded-xl border border-[#3A3A52]">
                            <div>
                                <p className="text-xs font-bold text-white">Mode Simulasi</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setSimulationMode(!simulationMode); setSimResult(null); }}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    simulationMode ? 'bg-amber-500' : 'bg-slate-600'
                                }`}
                                aria-pressed={simulationMode}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        simulationMode ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Nama Usaha</label>
                                <input type="text" name="namaUsaha" value={form.namaUsaha} onChange={handleChange} placeholder="Toko Berkah Jaya" className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm" required />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Kas Masuk</label>
                                <input type="text" name="cashInflow" value={form.cashInflow} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-emerald-400 focus:outline-none text-sm font-semibold" readOnly />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Kas Keluar</label>
                                <input type="text" name="cashOutflow" value={form.cashOutflow} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-rose-400 focus:outline-none text-sm font-semibold" readOnly />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Aset Lancar</label>
                                <input type="text" name="currentAssets" value={form.currentAssets} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Kewajiban Lancar</label>
                                <input type="text" name="currentLiabilities" value={form.currentLiabilities} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Total Hutang</label>
                                <input type="text" name="totalDebt" value={form.totalDebt} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Total Ekuitas</label>
                                <input type="text" name="totalEquity" value={form.totalEquity} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Total Aset</label>
                                <input type="text" name="totalAssets" value={form.totalAssets} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Laba Bersih</label>
                                <input type="text" name="netProfit" value={form.netProfit} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Penjualan</label>
                                <input type="text" name="sales" value={form.sales} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Pendapatan Sblmnya</label>
                                <input type="text" name="previousRevenue" value={form.previousRevenue} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm" />
                            </div>
                            <div className="sm:col-span-2 flex items-end">
                                <button type="submit" disabled={loading} className="w-full py-2.5 text-white font-bold rounded-xl shadow-lg transition-all text-sm disabled:opacity-50 bg-gradient-to-r from-[#5A3B8C] to-[#8B7CC7] hover:opacity-90">
                                    {loading ? (simulationMode ? 'Menjalankan Simulasi...' : 'Memproses ML...') : (simulationMode ? 'Jalankan Simulasi What-If' : 'Analisis Kesehatan Finansial')}
                                </button>
                            </div>
                        </div>

                        {/* Simulation Sliders - Only show in simulation mode */}
                        {simulationMode && (
                            <div className="bg-[#0E0B1D] rounded-xl border border-amber-500/30 p-4 grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <div>
                                    <div className="flex justify-between text-xs text-[#C9C2E3] mb-1">
                                        <span>Perubahan Penjualan (%)</span>
                                        <span className="text-white font-bold">{salesChange > 0 ? `+${salesChange}%` : `${salesChange}%`}</span>
                                    </div>
                                    <input type="range" min="-50" max="50" value={salesChange} onChange={(e) => setSalesChange(Number(e.target.value))} className="w-full accent-amber-500 cursor-pointer" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs text-[#C9C2E3] mb-1">
                                        <span>Perubahan Total Hutang (%)</span>
                                        <span className="text-white font-bold">{debtChange > 0 ? `+${debtChange}%` : `${debtChange}%`}</span>
                                    </div>
                                    <input type="range" min="-50" max="50" value={debtChange} onChange={(e) => setDebtChange(Number(e.target.value))} className="w-full accent-amber-500 cursor-pointer" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs text-[#C9C2E3] mb-1">
                                        <span>Perubahan Biaya Operasional (%)</span>
                                        <span className="text-white font-bold">{opexChange > 0 ? `+${opexChange}%` : `${opexChange}%`}</span>
                                    </div>
                                    <input type="range" min="-50" max="50" value={opexChange} onChange={(e) => setOpexChange(Number(e.target.value))} className="w-full accent-amber-500 cursor-pointer" />
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Hasil Prediksi & Visualisasi Baru */}
                <div className="bg-[#2A1E4D] p-6 rounded-2xl shadow-xl border border-[#3A3A52]">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 pb-3 border-b border-[#3A3A52] gap-4">
                        <h3 className="text-lg font-bold text-white">Hasil Analisis & Visualisasi</h3>
                        {/* Status Prediksi Card - Dinamis dari API */}
                        {result && (
                            <div className={`px-4 py-2 rounded-xl border flex items-center gap-3 ${PredictionBorder({ prediction: getHealthStatus(avgScore) })} bg-[#0E0B1D]`}>
                                <div className={`p-1.5 rounded-lg ${PredictionBg({ prediction: getHealthStatus(avgScore) })}`}>
                                    <PredictionIcon prediction={getHealthStatus(avgScore)} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-[#C9C2E3] uppercase font-semibold">Status</p>
                                    <p className="text-xs font-black text-white">
                                        {getHealthStatus(avgScore)}
                                        {typeof result.confidence === 'number' ? (
                                            <span className="text-[#8B7CC7] font-semibold ml-1"> ({result.confidence.toFixed(1)}%)</span>
                                        ) : (
                                            <span className="text-[#8B7CC7] font-semibold ml-1"> ({avgScore.toFixed(1)}%)</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {!result ? (
                        <div className="flex flex-col items-center justify-center h-96 text-[#C9C2E3]/60">
                            <svg className="w-16 h-16 mb-4 text-[#5A3B8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <p className="text-lg font-medium text-white">Menunggu Data...</p>
                            <p className="text-sm mt-1 text-[#C9C2E3]">Masukkan data keuangan di atas untuk mendapatkan visualisasi dan hasil prediksi ML.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Row 1: Health Score Cards (4 Pilar) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="p-4 bg-[#0E0B1D] rounded-xl border border-[#3A3A52] text-center">
                                    <p className="text-xs text-[#C9C2E3] uppercase font-bold">Profitability</p>
                                    <p className="text-2xl font-black text-white mt-1">{scores.profitability}/100</p>
                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-2 border ${getHealthColor(scores.profitability)}`}>
                                        {scores.profitability >= 80 ? 'Sangat Baik' : scores.profitability >= 50 ? 'Perlu Perhatian' : 'Perlu Perbaikan'}
                                    </span>
                                </div>
                                <div className="p-4 bg-[#0E0B1D] rounded-xl border border-[#3A3A52] text-center">
                                    <p className="text-xs text-[#C9C2E3] uppercase font-bold">Liquidity</p>
                                    <p className="text-2xl font-black text-white mt-1">{scores.liquidity}/100</p>
                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-2 border ${getHealthColor(scores.liquidity)}`}>
                                        {scores.liquidity >= 80 ? 'Sangat Baik' : scores.liquidity >= 50 ? 'Perlu Perhatian' : 'Perlu Perbaikan'}
                                    </span>
                                </div>
                                <div className="p-4 bg-[#0E0B1D] rounded-xl border border-[#3A3A52] text-center">
                                    <p className="text-xs text-[#C9C2E3] uppercase font-bold">Leverage</p>
                                    <p className="text-2xl font-black text-white mt-1">{scores.leverage}/100</p>
                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-2 border ${getHealthColor(scores.leverage)}`}>
                                        {scores.leverage >= 80 ? 'Sangat Baik' : scores.leverage >= 50 ? 'Perlu Perhatian' : 'Perlu Perbaikan'}
                                    </span>
                                </div>
                                <div className="p-4 bg-[#0E0B1D] rounded-xl border border-[#3A3A52] text-center">
                                    <p className="text-xs text-[#C9C2E3] uppercase font-bold">Efficiency</p>
                                    <p className="text-2xl font-black text-white mt-1">{scores.efficiency}/100</p>
                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-2 border ${getHealthColor(scores.efficiency)}`}>
                                        {scores.efficiency >= 80 ? 'Sangat Baik' : scores.efficiency >= 50 ? 'Perlu Perhatian' : 'Perlu Perbaikan'}
                                    </span>
                                </div>
                            </div>

                            {/* Row 2: Histogram 6 Rasio - Full Width, Horizontal Bars */}
                            <div className="h-80 bg-[#0E0B1D] p-4 rounded-xl border border-[#3A3A52]">
                                <h4 className="text-xs font-bold text-[#C9C2E3] uppercase mb-3">Intensitas Rasio Keuangan</h4>
                                <ResponsiveContainer width="100%" height="90%">
                                    <BarChart layout="vertical" data={ratioHistogramData} margin={{ top: 5, right: 10, left: 100, bottom: 5 }}>
                                        <XAxis type="number" domain={[0, 100]} stroke="#C9C2E3" fontSize={10} tick={{ fill: '#C9C2E3' }} />
                                        <YAxis type="category" dataKey="name" stroke="#C9C2E3" fontSize={10} width={100} tick={{ fill: '#C9C2E3' }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#2A1E4D', borderColor: '#3A3A52', borderRadius: '12px', color: '#fff' }} formatter={(value) => [`${value}/100`, 'Intensity']} />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                            {ratioHistogramData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Row 3: Perbandingan Metrik Kesehatan & Pie Chart Hutang vs Ekuitas (Sejajar) */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="h-80 bg-[#0E0B1D] p-4 rounded-xl border border-[#3A3A52]">
                                    <h4 className="text-xs font-bold text-[#C9C2E3] uppercase mb-3">Perbandingan Metrik Kesehatan</h4>
                                    <ResponsiveContainer width="100%" height="90%">
                                        <BarChart data={[
                                            { name: 'Profitability', value: scores.profitability },
                                            { name: 'Liquidity', value: scores.liquidity },
                                            { name: 'Leverage', value: scores.leverage },
                                            { name: 'Efficiency', value: scores.efficiency }
                                        ]}>
                                            <XAxis dataKey="name" stroke="#C9C2E3" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <YAxis domain={[0, 100]} stroke="#C9C2E3" tick={{ fontSize: 11 }} />
                                            <Tooltip contentStyle={{ backgroundColor: '#2A1E4D', borderColor: '#3A3A52', borderRadius: '12px', color: '#fff' }} formatter={(value) => [`${value}/100`, 'Score']} />
                                            <Bar dataKey="value" fill="#8B7CC7" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="h-80 bg-[#0E0B1D] p-4 rounded-xl border border-[#3A3A52]">
                                    <h4 className="text-xs font-bold text-[#C9C2E3] uppercase mb-3">Hutang vs Ekuitas</h4>
                                    <ResponsiveContainer width="100%" height="90%">
                                        <PieChart>
                                            <Pie
                                                data={debtVsEquityData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {debtVsEquityData.map((entry, index) => (
                                                    <Cell key={`pie-cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(val) => `Rp ${Number(val).toLocaleString('id-ID')}`} contentStyle={{ backgroundColor: '#2A1E4D', borderColor: '#3A3A52', borderRadius: '12px', color: '#fff' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Row 5: Kartu Distribusi Rasio Keuangan - Intensity Scores + Imbalance Diagnostics */}
                            <div className="bg-[#0E0B1D] p-5 rounded-2xl border border-[#3A3A52]">
                                <h4 className="text-xs font-bold text-[#C9C2E3] uppercase mb-4">Distribusi Rasio Keuangan & Diagnostik Ketidakseimbangan</h4>

                                {/* Intensity Score Bars */}
                                <div className="space-y-3 mb-5">
                                    {[
                                        { label: 'Liquidity Intensity (CR)', value: Number(result.bar_chart?.cr ?? result.intensity_scores?.liquidity_intensity ?? result.liquidity_intensity ?? result.liquidity_score ?? 0), color: '#8B7CC7' },
                                        { label: 'Risk Intensity (DER)', value: Number(result.bar_chart?.der ?? result.intensity_scores?.risk_intensity ?? result.risk_intensity ?? result.leverage_score ?? 0), color: '#EF4444' },
                                        { label: 'Profitability Intensity (ROA+NPM)', value: Number(result.bar_chart?.roa ?? result.intensity_scores?.profitability_intensity ?? result.profitability_intensity ?? result.profitability_score ?? 0), color: '#10B981' },
                                        { label: 'Efficiency Intensity (TAT+Growth)', value: Number(result.bar_chart?.tat ?? result.intensity_scores?.efficiency_intensity ?? result.efficiency_intensity ?? result.efficiency_score ?? 0), color: '#3B82F6' }
                                    ].map((item, idx) => (
                                        <div key={idx} className="bg-[#2A1E4D] rounded-xl p-3 border border-[#3A3A52]/50">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-[#C9C2E3] font-semibold">{item.label}</span>
                                                <span className="text-white font-black">{item.value}/100</span>
                                            </div>
                                            <div className="h-3 bg-[#0E0B1D] rounded-full overflow-hidden relative">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${Math.min(100, Math.max(0, item.value))}%`,
                                                        backgroundColor: item.color
                                                    }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-[10px] text-[#C9C2E3]/60 mt-1">
                                                <span>0</span>
                                                <span>50</span>
                                                <span>100</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Imbalance Diagnostics */}
                                {result.imbalance && result.imbalance.length > 0 && (
                                    <div className="pt-4 border-t border-[#3A3A52]/40">
                                        <p className="text-xs font-bold text-rose-400 uppercase mb-2 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            Imbalance Diagnostics
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {result.imbalance.map((diag, idx) => {
                                                const isBalanced = diag.toLowerCase().includes('seimbang');
                                                return (
                                                    <span key={idx} className={`px-3 py-1.5 text-xs rounded-full font-medium ${isBalanced
                                                        ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                                                        : 'bg-rose-500/20 border border-rose-500/30 text-rose-300'
                                                    }`}>
                                                        {diag}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Recommendations */}
                            {result.recommendations && result.recommendations.length > 0 && (
                                <div className="p-5 bg-gradient-to-r from-amber-950/40 to-purple-950/40 rounded-xl border border-amber-500/30">
                                    <div className="flex items-center gap-3 mb-2">
                                        <InfoIcon className="w-5 h-5 text-amber-400 flex-shrink-0" />
                                        <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wide">AI Actionable Insights & Rekomendasi Tindakan</h4>
                                    </div>
                                    <ul className="space-y-2 text-sm text-[#C9C2E3] pl-2">
                                        {result.recommendations.map((rec, i) => {
                                            const isWarning = rec.toLowerCase().includes('hutang') || rec.toLowerCase().includes('arus kas') || rec.toLowerCase().includes('likuiditas') || rec.toLowerCase().includes('risiko') || rec.toLowerCase().includes('perbaikan');
                                            return (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className={isWarning ? 'text-rose-400 font-bold' : 'text-amber-400 font-bold'}>
                                                        {isWarning ? <AlertTriangle className="w-4 h-4 inline" /> : '•'}
                                                    </span>
                                                    <span>{rec}</span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}

                            {/* Delta Analysis */}
                            {simulationMode && simResult && result && deltaData.length > 0 && (
                                <div className="p-5 bg-gradient-to-r from-emerald-950/40 to-purple-950/40 rounded-xl border border-emerald-500/30">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-xl">📊</span>
                                        <h4 className="text-sm font-bold text-emerald-300 uppercase tracking-wide">Delta Analysis: Faktual vs Simulasi</h4>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                        {deltaData.map(renderDelta)}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}