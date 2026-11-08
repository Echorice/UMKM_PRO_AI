import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function HasilPenilaian({ result, formData, onReset }) {
    const [salesChange, setSalesChange] = useState(0);
    const [debtChange, setDebtChange] = useState(0);

    const fmt = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);

    const getHealthColor = (score) => {
        if (score >= 80) return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
        if (score >= 60) return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
        return 'text-rose-400 bg-rose-500/20 border-rose-500/30';
    };

    const avgScore = Math.round((
        (result.profitability_score || 0) + 
        (result.liquidity_score || 0) + 
        (result.leverage_score || 0) + 
        (result.efficiency_score || 0)
    ) / 4);

    return (
        <div className="bg-[#0E0B1D] min-h-screen p-6 md:p-8 text-slate-100">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-[#5A3B8C] to-[#8B7CC7] rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="flex items-center gap-6 relative z-10">
                        {/* Circular Gauge */}
                        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <path className="text-white/20" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path strokeWidth="3.5" strokeDasharray={`${avgScore}, 100`} stroke="#FFFFFF" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <span className="text-3xl font-black text-white">{avgScore}</span>
                                <span className="text-[10px] text-purple-200 uppercase tracking-wider font-semibold">Skor</span>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/20">
                                    {result.prediction || 'SEHAT'}
                                </span>
                                {formData?.npwp && (
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                                        ✓ NPWP Terdaftar
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl font-black text-white">{formData?.namaUsaha || 'Usaha UMKM'}</h1>
                            <p className="text-purple-100 text-sm mt-1">
                                {formData?.sektor || 'Umum'} • {formData?.kota || 'Indonesia'} • {formData?.employeeRange || 'Mikro'}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 relative z-10">
                        <button 
                            onClick={onReset}
                            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold rounded-xl border border-white/20 transition-all text-sm flex items-center gap-2"
                        >
                            🔄 Penilaian Baru
                        </button>
                        <button 
                            onClick={() => window.print()}
                            className="px-5 py-2.5 bg-white text-[#5A3B8C] font-bold rounded-xl shadow-lg hover:bg-purple-50 transition-all text-sm flex items-center gap-2"
                        >
                            📥 Unduh Laporan (PDF)
                        </button>
                    </div>
                </div>

                {/* Pillar Score Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[#2A1E4D] p-5 rounded-2xl border border-[#3A3A52] text-center shadow-lg">
                        <p className="text-xs text-[#C9C2E3] uppercase font-bold">Profitability</p>
                        <p className="text-3xl font-black text-white mt-2">{result.profitability_score}/100</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-3 border ${getHealthColor(result.profitability_score)}`}>
                            {result.profitability_score >= 80 ? 'Sangat Baik' : result.profitability_score >= 60 ? 'Cukup' : 'Perlu Perbaikan'}
                        </span>
                    </div>
                    <div className="bg-[#2A1E4D] p-5 rounded-2xl border border-[#3A3A52] text-center shadow-lg">
                        <p className="text-xs text-[#C9C2E3] uppercase font-bold">Liquidity</p>
                        <p className="text-3xl font-black text-white mt-2">{result.liquidity_score}/100</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-3 border ${getHealthColor(result.liquidity_score)}`}>
                            {result.liquidity_score >= 80 ? 'Sangat Baik' : result.liquidity_score >= 60 ? 'Cukup' : 'Perlu Perbaikan'}
                        </span>
                    </div>
                    <div className="bg-[#2A1E4D] p-5 rounded-2xl border border-[#3A3A52] text-center shadow-lg">
                        <p className="text-xs text-[#C9C2E3] uppercase font-bold">Leverage</p>
                        <p className="text-3xl font-black text-white mt-2">{result.leverage_score}/100</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-3 border ${getHealthColor(result.leverage_score)}`}>
                            {result.leverage_score >= 80 ? 'Sangat Baik' : result.leverage_score >= 60 ? 'Cukup' : 'Perlu Perbaikan'}
                        </span>
                    </div>
                    <div className="bg-[#2A1E4D] p-5 rounded-2xl border border-[#3A3A52] text-center shadow-lg">
                        <p className="text-xs text-[#C9C2E3] uppercase font-bold">Efficiency</p>
                        <p className="text-3xl font-black text-white mt-2">{result.efficiency_score}/100</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-3 border ${getHealthColor(result.efficiency_score)}`}>
                            {result.efficiency_score >= 80 ? 'Sangat Baik' : result.efficiency_score >= 60 ? 'Cukup' : 'Perlu Perbaikan'}
                        </span>
                    </div>
                </div>

                {/* Charts & Financial Ratios Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Bar Chart */}
                    <div className="bg-[#2A1E4D] p-6 rounded-2xl shadow-xl border border-[#3A3A52]">
                        <h3 className="text-base font-bold text-white mb-4 pb-3 border-b border-[#3A3A52] flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#8B7CC7]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                            Perbandingan Skor 4 Pilar Kesehatan
                        </h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { name: 'Profitability', value: result.profitability_score },
                                    { name: 'Liquidity', value: result.liquidity_score },
                                    { name: 'Leverage', value: result.leverage_score },
                                    { name: 'Efficiency', value: result.efficiency_score }
                                ]}>
                                    <XAxis dataKey="name" stroke="#C9C2E3" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 100]} stroke="#C9C2E3" tick={{ fontSize: 11 }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#2A1E4D', borderColor: '#3A3A52', borderRadius: '12px', color: '#fff' }} formatter={(value) => [`${value}/100`, 'Score']} />
                                    <Bar dataKey="value" fill="#8B7CC7" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Financial Ratios Table */}
                    <div className="bg-[#2A1E4D] p-6 rounded-2xl shadow-xl border border-[#3A3A52] flex flex-col justify-between">
                        <div>
                            <h3 className="text-base font-bold text-white mb-4 pb-3 border-b border-[#3A3A52] flex items-center gap-2">
                                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                                Analisis Rasio Keuangan Utama
                            </h3>
                        </div>
                        <div className="space-y-4 my-auto">
                            <div className="flex justify-between items-center py-2.5 border-b border-[#3A3A52]">
                                <span className="text-sm text-[#C9C2E3]">Current Ratio (Likuiditas)</span>
                                <span className="text-sm font-black text-emerald-400">{(result.current_ratio || 0).toFixed(2)}x</span>
                            </div>
                            <div className="flex justify-between items-center py-2.5 border-b border-[#3A3A52]">
                                <span className="text-sm text-[#C9C2E3]">Debt to Equity Ratio (DER)</span>
                                <span className="text-sm font-black text-amber-400">{(result.debt_equity_ratio || 0).toFixed(2)}x</span>
                            </div>
                            <div className="flex justify-between items-center py-2.5 border-b border-[#3A3A52]">
                                <span className="text-sm text-[#C9C2E3]">Return on Assets (ROA)</span>
                                <span className="text-sm font-black text-emerald-400">{(result.return_on_assets || 0).toFixed(2)}%</span>
                            </div>
                            <div className="flex justify-between items-center py-2.5">
                                <span className="text-sm text-[#C9C2E3]">Net Profit Margin (NPM)</span>
                                <span className="text-sm font-black text-emerald-400">{(result.net_profit_margin || 0).toFixed(2)}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Recommendations */}
                {result.recommendations && result.recommendations.length > 0 && (
                    <div className="bg-gradient-to-r from-amber-950/40 to-purple-950/40 p-6 rounded-2xl border border-amber-500/30">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">💡</span>
                            <h3 className="text-base font-bold text-amber-300 uppercase tracking-wide">Rekomendasi Pintar & Tindakan Intervensi</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {result.recommendations.map((rec, i) => (
                                <div key={i} className="p-4 bg-[#0E0B1D]/60 rounded-xl border border-amber-500/20 flex items-start gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">{i + 1}</div>
                                    <p className="text-sm text-[#C9C2E3] leading-relaxed">{rec}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* What-If Simulation */}
                <div className="bg-[#2A1E4D] p-6 rounded-2xl shadow-xl border border-[#3A3A52]">
                    <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#3A3A52]">
                        <div>
                            <h3 className="text-base font-bold text-white uppercase tracking-wide flex items-center gap-2">
                                <span>🎛️</span> Simulasi Keuangan ("What-If" Analysis)
                            </h3>
                            <p className="text-xs text-[#C9C2E3] mt-1">Geser slider untuk melihat simulasi real-time terhadap prediksi kesehatan.</p>
                        </div>
                        <button 
                            onClick={() => { setSalesChange(0); setDebtChange(0); }}
                            className="text-xs text-[#8B7CC7] hover:text-white underline"
                        >
                            Reset Simulasi
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <div className="flex justify-between text-xs text-[#C9C2E3] mb-2">
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
                        </div>
                        <div>
                            <div className="flex justify-between text-xs text-[#C9C2E3] mb-2">
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
                        </div>
                    </div>

                    <div className="p-4 bg-[#0E0B1D] rounded-xl border border-[#3A3A52] flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-[#C9C2E3] uppercase font-semibold">Hasil Simulasi:</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                (avgScore + (salesChange * 0.3) - (debtChange * 0.2)) >= 70 
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            }`}>
                                {(avgScore + (salesChange * 0.3) - (debtChange * 0.2)) >= 70 ? 'SEHAT (Simulasi Optimal)' : 'RISIKO (Perlu Perhatian)'}
                            </span>
                        </div>
                        <div className="text-xs text-[#C9C2E3]">
                            Simulasi Skor Kesehatan: <strong className="text-white font-black text-sm">
                                {Math.min(100, Math.max(0, Math.round(avgScore + (salesChange * 0.3) - (debtChange * 0.2))))}/100
                            </strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}