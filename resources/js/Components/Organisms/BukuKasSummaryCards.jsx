import React from 'react';

const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
};

const formatRupiahShort = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0, notation: 'compact' }).format(angka);
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

const BukuKasSummaryCards = ({ totalPemasukan, totalPengeluaran, totalSaldo, totalPiutang }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white p-5 rounded-2xl shadow-xl flex items-center justify-between">
                <div>
                    <p className="text-emerald-100 text-sm font-medium">Total Pemasukan</p>
                    <h3 className="text-2xl font-bold mt-1">{formatRupiah(totalPemasukan)}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-.879-.659-.879-1.798 0-2.518L12 6z"/></svg>
                </div>
            </div>
            <div className="bg-gradient-to-br from-rose-500 to-rose-700 text-white p-5 rounded-2xl shadow-xl flex items-center justify-between">
                <div>
                    <p className="text-rose-100 text-sm font-medium">Total Pengeluaran</p>
                    <h3 className="text-2xl font-bold mt-1">{formatRupiah(totalPengeluaran)}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"/></svg>
                </div>
            </div>
            <div className="bg-gradient-to-br from-purple-700 to-purple-900 text-white p-5 rounded-2xl shadow-xl flex items-center justify-between">
                <div>
                    <p className="text-purple-100 text-sm font-medium">Total Saldo Keseluruhan</p>
                    <h3 className="text-2xl font-bold mt-1">{formatRupiah(totalSaldo)}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-5 rounded-2xl shadow-xl flex items-center justify-between">
                <div>
                    <p className="text-blue-100 text-sm font-medium">Piutang Aktif</p>
                    <h3 className="text-2xl font-bold mt-1">{formatRupiahShort(totalPiutang)}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
                </div>
            </div>
        </div>
    );
};

export default BukuKasSummaryCards;