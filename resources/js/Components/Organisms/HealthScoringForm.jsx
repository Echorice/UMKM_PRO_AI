import React from 'react';

export default function HealthScoringForm({ form, handleChange, loading, onSubmit }) {
    const formatAngka = (value) => {
        if (!value) return '';
        const numberString = value.replace(/[^,\d]/g, '').toString();
        return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    return (
        <div className="bg-[#2A1E4D] p-6 rounded-2xl shadow-xl border border-[#3A3A52] h-fit">
            <h3 className="text-lg font-bold text-white mb-4 pb-3 border-b border-[#3A3A52]">Input Data Keuangan</h3>
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Nama Usaha</label>
                    <input
                        type="text"
                        name="namaUsaha"
                        value={form.namaUsaha}
                        onChange={handleChange}
                        placeholder="Contoh: Toko Berkah Jaya"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Kas Masuk</label>
                        <input
                            type="text"
                            name="cashInflow"
                            value={form.cashInflow}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-emerald-400 focus:outline-none text-sm font-semibold"
                            readOnly
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Kas Keluar</label>
                        <input
                            type="text"
                            name="cashOutflow"
                            value={form.cashOutflow}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-rose-400 focus:outline-none text-sm font-semibold"
                            readOnly
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Aset Lancar</label>
                        <input
                            type="text"
                            name="currentAssets"
                            value={form.currentAssets}
                            onChange={handleChange}
                            placeholder="0"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Total Hutang</label>
                        <input
                            type="text"
                            name="totalDebt"
                            value={form.totalDebt}
                            onChange={handleChange}
                            placeholder="0"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Total Ekuitas</label>
                        <input
                            type="text"
                            name="totalEquity"
                            value={form.totalEquity}
                            onChange={handleChange}
                            placeholder="0"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Total Aset</label>
                        <input
                            type="text"
                            name="totalAssets"
                            value={form.totalAssets}
                            onChange={handleChange}
                            placeholder="0"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Laba Bersih</label>
                    <input
                        type="text"
                        name="netProfit"
                        value={form.netProfit}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col justify-end">
                        <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1 h-8 flex items-end">Penjualan</label>
                        <input
                            type="text"
                            name="sales"
                            value={form.sales}
                            onChange={handleChange}
                            placeholder="0"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm"
                        />
                    </div>
                    <div className="flex flex-col justify-end">
                        <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1 h-8 flex items-end">Pendapatan Sebelumnya</label>
                        <input
                            type="text"
                            name="previousRevenue"
                            value={form.previousRevenue}
                            onChange={handleChange}
                            placeholder="0"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 text-white font-bold rounded-xl shadow-lg transition-all text-sm disabled:opacity-50 bg-gradient-to-r from-[#5A3B8C] to-[#8B7CC7] hover:opacity-90"
                >
                    {loading ? 'Memproses ML...' : 'Prediksi Machine Learning'}
                </button>
            </form>
        </div>
    );
}