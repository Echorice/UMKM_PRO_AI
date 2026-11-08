import React from 'react';
import DangerButton from '@/Components/Atoms/DangerButton';
import SecondaryButton from '@/Components/Atoms/SecondaryButton';

const CASH_SOURCES = [
    { value: 'KAS_TUNAI', label: '💵 Kas Tunai' },
    { value: 'BANK_BCA', label: '🏦 Bank BCA' },
    { value: 'BANK_MANDIRI', label: '🏦 Bank Mandiri' },
    { value: 'QRIS', label: '📱 QRIS' }
];

const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
};

const SourceIcon = ({ value, className = 'w-4 h-4' }) => {
    const icons = {
        KAS_TUNAI: (
            <svg className={`${className} text-amber-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
        ),
        BANK_BCA: (
            <svg className={`${className} text-blue-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
        ),
        BANK_MANDIRI: (
            <svg className={`${className} text-emerald-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        ),
        QRIS: (
            <svg className={`${className} text-purple-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4m15-3a2 2 0 01-2 2H5a2 2 0 01-2-2V7h20v7a2 2 0 01-2 2zM9 10h6M9 14h6m-6-4h.01M15 10h.01M15 14h.01" />
            </svg>
        )
    };
    return icons[value] || icons.KAS_TUNAI;
};

const BukuKasTable = ({
    filteredTransaksi,
    periodeFilter,
    setPeriodeFilter,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    handleEdit,
    handleHapus
}) => {
    return (
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
            <h2 className="text-lg font-bold text-purple-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                Riwayat Buku Kas
                <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2.5 py-1 rounded-full">{filteredTransaksi.length} transaksi</span>
            </h2>
            <div className="mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3 flex-wrap">
                    <label className="text-xs font-semibold text-slate-600 uppercase text-white/0 hidden sm:block">Periode:</label>
                    <select value={periodeFilter} onChange={(e) => setPeriodeFilter(e.target.value)} className="px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm bg-white text-slate-900 min-w-[160px]">
                        <option value="semua">Semua Waktu</option>
                        <option value="hari_ini">Hari Ini</option>
                        <option value="minggu_ini">Minggu Ini</option>
                        <option value="bulan_ini">Bulan Ini</option>
                        <option value="custom">Custom Range</option>
                    </select>
                    {periodeFilter === 'custom' && (
                        <div className="flex items-center gap-2">
                            <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm bg-white text-slate-900" />
                            <span className="text-slate-400 text-sm">s/d</span>
                            <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm bg-white text-slate-900" />
                        </div>
                    )}
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wider">
                            <th className="py-3 px-4">Tanggal</th>
                            <th className="py-3 px-4">Sumber</th>
                            <th className="py-3 px-4">Keterangan</th>
                            <th className="py-3 px-4">Jenis</th>
                            <th className="py-3 px-4 text-right">Nominal</th>
                            <th className="py-3 px-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {filteredTransaksi.length > 0 ? (
                            filteredTransaksi.map((t) => (
                                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-3.5 px-4 text-slate-600 font-medium">{t.tanggal}</td>
                                    <td className="py-3.5 px-4">
                                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-700">
                                            {SourceIcon({ value: t.sumber_kas || 'KAS_TUNAI' })}
                                            {CASH_SOURCES.find(s => s.value === (t.sumber_kas || 'KAS_TUNAI'))?.label || 'Kas Tunai'}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-slate-800">
                                        {t.keterangan}<br/>
                                        <span className="text-[10px] text-slate-400 uppercase">{t.kategori}</span>
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1.5 w-fit ${t.jenis_transaksi === 'Pemasukan' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                            {t.jenis_transaksi === 'Pemasukan' ? (
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"/></svg>
                                            ) : (
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"/></svg>
                                            )}
                                            {t.jenis_transaksi}
                                        </span>
                                    </td>
                                    <td className={`py-3.5 px-4 text-right font-bold ${t.jenis_transaksi === 'Pemasukan' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {t.jenis_transaksi === 'Pemasukan' ? '+ ' : '- '}{formatRupiah(t.nominal)}
                                    </td>
                                    <td className="py-3.5 px-4 text-center flex justify-center gap-2">
                                        <SecondaryButton onClick={() => handleEdit(t)} variant="amber" size="sm">Edit</SecondaryButton>
                                        <DangerButton onClick={() => handleHapus(t.id)} size="sm">Hapus</DangerButton>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" className="text-center py-8 text-slate-400">Belum ada transaksi.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BukuKasTable;