import React from 'react';
import TextInput from '@/Components/Atoms/TextInput';
import PrimaryButton from '@/Components/Atoms/PrimaryButton';
import InputLabel from '@/Components/Atoms/InputLabel';

const CASH_SOURCES = [
    { value: 'KAS_TUNAI', label: '💵 Kas Tunai' },
    { value: 'BANK_BCA', label: '🏦 Bank BCA' },
    { value: 'BANK_MANDIRI', label: '🏦 Bank Mandiri' },
    { value: 'QRIS', label: '📱 QRIS' }
];

const KATEGORI_PEMASUKAN = ['Penjualan', 'Lainnya'];
const KATEGORI_PENGELUARAN = ['Bahan Baku', 'Operasional', 'Gaji', 'Sewa', 'Lainnya'];

const getKategoriOptions = (jenisTransaksi) => jenisTransaksi === 'Pemasukan' ? KATEGORI_PEMASUKAN : KATEGORI_PENGELUARAN;

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

const BukuKasForm = ({
    form,
    setForm,
    editId,
    loading,
    handleSubmit,
    handleNominalChange,
    batalEdit
}) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 h-fit">
            <h2 className="text-lg font-bold text-purple-900 mb-4 pb-2 border-b border-slate-100 flex justify-between items-center">
                <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    {editId ? 'Edit Transaksi' : 'Tambah Transaksi'}
                </span>
                {editId && <button type="button" onClick={batalEdit} className="text-xs text-rose-500 hover:underline">Batal Edit</button>}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <InputLabel>Tanggal</InputLabel>
                    <input type="date" value={form.tanggal} onChange={(e) => setForm({...form, tanggal: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm text-slate-900" required/>
                </div>
                <div>
                    <InputLabel>Jenis Transaksi</InputLabel>
                    <select value={form.jenis_transaksi} onChange={(e) => setForm({...form, jenis_transaksi: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm bg-white text-slate-900">
                        <option value="Pemasukan">Pemasukan (Masuk)</option>
                        <option value="Pengeluaran">Pengeluaran (Keluar)</option>
                    </select>
                </div>
                <div>
                    <InputLabel>Sumber Kas / Metode Pembayaran</InputLabel>
                    <select value={form.sumber_kas} onChange={(e) => setForm({...form, sumber_kas: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm bg-white text-slate-900">
                        {CASH_SOURCES.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <InputLabel>Kategori</InputLabel>
                    <select value={form.kategori} onChange={(e) => setForm({...form, kategori: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm bg-white text-slate-900">
                        {getKategoriOptions(form.jenis_transaksi).map((kat, i) => (
                            <option key={i} value={kat}>{kat}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <InputLabel>Keterangan</InputLabel>
                    <input type="text" value={form.keterangan} onChange={(e) => setForm({...form, keterangan: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm text-slate-900" required/>
                </div>
                <div>
                    <InputLabel>Nominal (Rp)</InputLabel>
                    <input type="text" value={form.nominal} onChange={(e) => handleNominalChange(e, 'transaksi')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm font-semibold text-purple-900" required/>
                </div>

                <PrimaryButton type="submit" disabled={loading} variant={editId ? 'amber' : 'purple'}>
                    {loading ? 'Menyimpan...' : (editId ? 'Update Transaksi' : 'Simpan Transaksi')}
                </PrimaryButton>
            </form>
        </div>
    );
};

export default BukuKasForm;