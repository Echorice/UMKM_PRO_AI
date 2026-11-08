import React from 'react';

const getSimulatedScore = (baseScore, salesChangePct, debtChangePct) => {
    // Simple simulation: base + 0.4 * sales_change - 0.2 * debt_change
    return Math.min(100, Math.max(0, Math.round(baseScore + (salesChangePct * 0.3) - (debtChangePct * 0.2))));
};

const getSimulatedStatus = (score) => score >= 75 ? 'SEHAT (Simulasi Optimal)' : 'RISIKO (Perlu Perhatian Simulasi)';

export default function WhatIfSimulator({ result, onScoreChange }) {
    const [salesChange, setSalesChange] = React.useState(0);
    const [debtChange, setDebtChange] = React.useState(0);

    const handleSalesChange = (e) => {
        const val = Number(e.target.value);
        setSalesChange(val);
        onScoreChange(getSimulatedScore(result.profitability_score, val, debtChange), val);
    };

    const handleDebtChange = (e) => {
        const val = Number(e.target.value);
        setDebtChange(val);
        onScoreChange(getSimulatedScore(result.profitability_score, salesChange, val), debtChange);
    };

    const handleReset = () => {
        setSalesChange(0);
        setDebtChange(0);
        onScoreChange(result.profitability_score, 0);
    };

    return (
        <div className="mt-6 p-5 bg-[#0E0B1D] rounded-xl border border-[#3A3A52]">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                        <span>🎛️</span> Simulasi Keuangan ("What-If" Analysis)
                    </h4>
                    <p className="text-xs text-[#C9C2E3] mt-0.5">Geser slider untuk melihat simulasi real-time terhadap prediksi kesehatan ML.</p>
                </div>
                <button
                    onClick={handleReset}
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
                        onChange={handleSalesChange}
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
                        onChange={handleDebtChange}
                        className="w-full accent-[#8B7CC7] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-[#C9C2E3]/60 mt-1">
                        <span>-50% (Pelunasan)</span>
                        <span>0% (Asli)</span>
                        <span>+50% (Penambahan)</span>
                    </div>
                </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#3A3A52] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="text-xs text-[#C9C2E3] uppercase font-semibold">Hasil Simulasi Prediksi:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        (result.profitability_score + (salesChange * 0.4) - (debtChange * 0.2)) >= 75
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}>
                        {((result.profitability_score + (salesChange * 0.4) - (debtChange * 0.2)) >= 75
                            ? 'SEHAT (Simulasi Optimal)'
                            : 'RISIKO (Perlu Perhatian Simulasi)')}
                    </span>
                </div>
                <div className="text-xs text-[#C9C2E3]">
                    Simulasi Skor Kesehatan: <strong className="text-white font-black text-sm">
                        {Math.min(100, Math.max(0, Math.round(result.profitability_score + (salesChange * 0.3) - (debtChange * 0.2))))}/100
                    </strong>
                </div>
            </div>
        </div>
    );
}