import React, { useState, useEffect } from 'react';

export default function BukuKas() {
    const [transaksi, setTransaksi] = useState([]);
    const [loading, setLoading] = useState(false);

    // State untuk mode edit
    const [editId, setEditId] = useState(null);

    const [form, setForm] = useState({
        tanggal: new Date().toISOString().split('T')[0],
        jenis_transaksi: 'Pemasukan',
        kategori: 'Penjualan',
        keterangan: '',
        nominal: ''
    });

    const fetchTransaksi = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8001/api/transaksi/');
            const data = await response.json();
            setTransaksi(data);
        } catch (error) {
            console.error('Gagal mengambil data:', error);
        }
    };

    useEffect(() => {
        fetchTransaksi();
    }, []);

    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
    };

    const handleNominalChange = (e) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        if (rawValue === '') {
            setForm({ ...form, nominal: '' });
            return;
        }
        const formatted = new Intl.NumberFormat('id-ID').format(rawValue);
        setForm({ ...form, nominal: formatted });
    };

    // Kalkulasi Total
    const totalPemasukan = transaksi
        .filter(t => t.jenis_transaksi === 'Pemasukan')
        .reduce((acc, curr) => acc + Number(curr.nominal), 0);

    const totalPengeluaran = transaksi
        .filter(t => t.jenis_transaksi === 'Pengeluaran')
        .reduce((acc, curr) => acc + Number(curr.nominal), 0);

    const saldoAkhir = totalPemasukan - totalPengeluaran;

    // Logika Edit & Hapus
    const handleEdit = (item) => {
        setEditId(item.id);
        setForm({
            tanggal: item.tanggal,
            jenis_transaksi: item.jenis_transaksi,
            kategori: item.kategori,
            keterangan: item.keterangan,
            nominal: new Intl.NumberFormat('id-ID').format(item.nominal)
        });
    };

    const handleHapus = async (id) => {
        if (!window.confirm('Yakin ingin menghapus transaksi ini?')) return;

        try {
            const response = await fetch(`http://127.0.0.1:8001/api/transaksi/${id}/`, {
                method: 'DELETE'
            });
            if (response.ok) fetchTransaksi();
        } catch (error) {
            console.error('Gagal menghapus:', error);
        }
    };

    const batalEdit = () => {
        setEditId(null);
        setForm({
            tanggal: new Date().toISOString().split('T')[0],
            jenis_transaksi: 'Pemasukan',
            kategori: 'Penjualan',
            keterangan: '',
            nominal: ''
        });
    };

    // Logika Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.keterangan || !form.nominal) return;

        setLoading(true);
        const cleanNominal = Number(form.nominal.toString().replace(/\./g, ''));

        const url = editId ? `http://127.0.0.1:8001/api/transaksi/${editId}/` : 'http://127.0.0.1:8001/api/transaksi/';
        const method = editId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    tanggal: form.tanggal,
                    jenis_transaksi: form.jenis_transaksi,
                    kategori: form.kategori,
                    keterangan: form.keterangan,
                    nominal: cleanNominal
                })
            });

            if (response.ok) {
                fetchTransaksi();
                batalEdit();
            }
        } catch (error) {
            console.error('Fetch Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header Halaman */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-purple-900 tracking-tight">💰 Buku Kas Harian UMKM</h1>
                <p className="text-slate-500 mt-1">Pencatatan arus kas masuk dan keluar yang tersimpan aman di Database.</p>
            </div>

            {/* KARTU RINGKASAN SALDO (YANG SEMPAT HILANG) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-purple-700 to-purple-900 text-white p-6 rounded-2xl shadow-xl">
                    <p className="text-purple-200 text-sm font-medium">Total Saldo Kas</p>
                    <h3 className="text-3xl font-bold mt-2">{formatRupiah(saldoAkhir)}</h3>
                    <div className="mt-4 text-xs bg-purple-600/50 inline-block px-3 py-1 rounded-full text-purple-100">
                        Database Sinkron
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 flex flex-col justify-between">
                    <div>
                        <p className="text-slate-400 text-sm font-medium">Total Pemasukan</p>
                        <h3 className="text-2xl font-bold text-emerald-600 mt-2">{formatRupiah(totalPemasukan)}</h3>
                    </div>
                    <span className="text-xs text-emerald-500 font-semibold mt-4 flex items-center gap-1">
                        📈 Arus kas masuk
                    </span>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 flex flex-col justify-between">
                    <div>
                        <p className="text-slate-400 text-sm font-medium">Total Pengeluaran</p>
                        <h3 className="text-2xl font-bold text-rose-600 mt-2">{formatRupiah(totalPengeluaran)}</h3>
                    </div>
                    <span className="text-xs text-rose-500 font-semibold mt-4 flex items-center gap-1">
                        📉 Arus kas keluar
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Form Tambah/Edit Transaksi */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 h-fit">
                    <h2 className="text-lg font-bold text-purple-900 mb-4 pb-2 border-b border-slate-100 flex justify-between items-center">
                        {editId ? '✏️ Edit Transaksi' : '➕ Tambah Transaksi'}
                        {editId && <button type="button" onClick={batalEdit} className="text-xs text-rose-500 hover:underline">Batal Edit</button>}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Tanggal</label>
                            <input type="date" value={form.tanggal} onChange={(e) => setForm({...form, tanggal: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm" required/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Jenis Transaksi</label>
                            <select value={form.jenis_transaksi} onChange={(e) => setForm({...form, jenis_transaksi: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm bg-white">
                                <option value="Pemasukan">Pemasukan (Masuk)</option>
                                <option value="Pengeluaran">Pengeluaran (Keluar)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Kategori</label>
                            <select value={form.kategori} onChange={(e) => setForm({...form, kategori: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm bg-white">
                                <option value="Penjualan">Penjualan</option>
                                <option value="Modal Awal">Modal Awal</option>
                                <option value="Operasional">Operasional</option>
                                <option value="Bahan Baku">Bahan Baku</option>
                                <option value="Gaji">Gaji Karyawan</option>
                                <option value="Lain-lain">Lain-lain</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Keterangan</label>
                            <input type="text" value={form.keterangan} onChange={(e) => setForm({...form, keterangan: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm" required/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nominal (Rp)</label>
                            <input type="text" value={form.nominal} onChange={handleNominalChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm font-semibold text-purple-900" required/>
                        </div>

                        <button type="submit" disabled={loading} className={`w-full py-3 text-white font-bold rounded-xl shadow-lg transition-all text-sm mt-2 disabled:opacity-50 ${editId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-purple-600 hover:bg-purple-700'}`}>
                            {loading ? 'Menyimpan...' : (editId ? 'Update Transaksi' : 'Simpan Transaksi')}
                        </button>
                    </form>
                </div>

                {/* Tabel Riwayat Transaksi */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                    <h2 className="text-lg font-bold text-purple-900 mb-4 pb-2 border-b border-slate-100">📜 Riwayat Buku Kas</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wider">
                                    <th className="py-3 px-4">Tanggal</th>
                                    <th className="py-3 px-4">Keterangan</th>
                                    <th className="py-3 px-4">Jenis</th>
                                    <th className="py-3 px-4 text-right">Nominal</th>
                                    <th className="py-3 px-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {transaksi.length > 0 ? (
                                    transaksi.map((t) => (
                                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-3.5 px-4 text-slate-600 font-medium">{t.tanggal}</td>
                                            <td className="py-3.5 px-4 text-slate-800">
                                                {t.keterangan}<br/>
                                                <span className="text-[10px] text-slate-400 uppercase">{t.kategori}</span>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${t.jenis_transaksi === 'Pemasukan' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                    {t.jenis_transaksi}
                                                </span>
                                            </td>
                                            <td className={`py-3.5 px-4 text-right font-bold ${t.jenis_transaksi === 'Pemasukan' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {t.jenis_transaksi === 'Pemasukan' ? '+ ' : '- '}{formatRupiah(t.nominal)}
                                            </td>
                                            <td className="py-3.5 px-4 text-center flex justify-center gap-2">
                                                <button onClick={() => handleEdit(t)} className="bg-amber-100 text-amber-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-200 transition-colors">Edit</button>
                                                <button onClick={() => handleHapus(t.id)} className="bg-rose-100 text-rose-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-rose-200 transition-colors">Hapus</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5" className="text-center py-8 text-slate-400">Belum ada transaksi.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}