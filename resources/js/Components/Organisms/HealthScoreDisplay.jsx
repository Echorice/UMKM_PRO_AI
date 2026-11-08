import React from 'react';

const getHealthColor = (score) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
    if (score >= 60) return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/20 border-rose-500/30';
};

export default function HealthScoreDisplay({ result }) {
    return (
        <div className="p-4 bg-[#0E0B1D] rounded-xl border border-[#3A3A52] text-center">
            <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-[#C9C2E3] uppercase font-bold">Profitability</p>
                <p className="text-2xl font-black text-white mt-1">{result.profitability_score}/100</p>
            </div>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-2 border ${getHealthColor(result.profitability_score)}`}>
                {result.profitability_score >= 80 ? 'Sangat Baik' : result.profitability_score >= 60 ? 'Cukup' : 'Perlu Perbaikan'}
            </span>
        </div>
    );
}