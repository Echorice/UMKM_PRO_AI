import React from 'react';

export default function AiInsightsPanel({ result }) {
    const recommendations = [];

    if (result && result.profitability_score) {
        if (result.profitability_score < 60) {
            recommendations.push(
                'Peningkatkan marjinal laba dengan optimasi harga jual dan kurangi biaya operasi tidak efektif'
            );
        }
        if (result.profitability_score >= 80) {
            recommendations.push(
                'Laba sangat baik, pertimbangkan ekspansi toward new market atau investasi produk baru'
            );
        }
    }

    if (result && result.liquidity_score) {
        if (result.liquidity_score < 60) {
            recommendations.push(
                'Peningkatan likuiditas: ekspansi jaringan piutang yang lebih teratur dan cadangan tunai minimal 3 bulan operasional'
            );
        }
    }

    if (result && result.leverage_score !== undefined) {
        if (result.leverage_score < 60) {
            recommendations.push(
                'Reduksi derajat leverase: struktur utang yang lebih seimbang dengan ekuitas dan priorisasi hutang berjangka panjang'
            );
        }
    }

    if (result && result.efficiency_score) {
        if (result.efficiency_score < 60) {
            recommendations.push(
                'Peningkatan efisiensi operasional: review aliran kas rutin, otomatisasi pembayaran rutin, dan evaluasi efisiensi stok'
            );
        }
    }

    return (
        <div className="mt-6 p-5 bg-gradient-to-r from-amber-950/40 to-purple-950/40 rounded-xl border border-amber-500/30">
            <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">💡</span>
                <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wide">AI Actionable Insights & Rekomendasi Tindakan</h4>
            </div>

            <ul className="space-y-2 text-sm text-[#C9C2E3] pl-2">
                {recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{rec}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}