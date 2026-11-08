import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Plus, AlertTriangle, RefreshCw, Trash2, Layers } from 'lucide-react';

export default function ManajemenStok() {
    const [stocks, setStocks] = useState([]);
    const [lowStocks, setLowStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [restockModal, setRestockModal] = useState(null);
    const [restockQty, setRestockQty] = useState('');

    const [form, setForm] = useState({
        nama_barang: '',
        kategori: 'Bahan Baku',
        stok: '',
        satuan: 'Kg',
        reorder_point: '5'
    });

    const fetchStocks = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/stock');
            setStocks(res.data);
            const lowRes = await axios.get('/api/stock/low-stock');
            setLowStocks(lowRes.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStocks();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/stock', form);
            setShowModal(false);
            setForm({ nama_barang: '', kategori: 'Bahan Baku', stok: '', satuan: 'Kg', reorder_point: '5' });
            fetchStocks();
        } catch (e) {
            alert('Gagal menambah barang');
        }
    };

    const handleRestock = async (e) => {
        e.preventDefault();
        if (!restockModal) return;
        try {
            await axios.post('/api/stock/tambah', {
                stock_id: restockModal.id,
                jumlah: parseFloat(restockQty)
            });
            setRestockModal(null);
            setRestockQty('');
            fetchStocks();
        } catch (e) {
            alert('Gagal restock');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus item stok ini?')) return;
        try {
            await axios.delete(`/api/stock/${id}`);
            fetchStocks();
        } catch (e) {
            alert('Gagal menghapus');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1E1939] p-6 rounded-2xl border border-[#3A3A52] shadow-xl">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Package className="text-purple-400 w-8 h-8" />
                        Manajemen Stok & Bahan Baku
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Pantau persediaan bahan baku utama dan dapatkan alert otomatis saat stok menipis.
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg transition duration-200"
                >
                    <Plus className="w-5 h-5" />
                    Tambah Barang Baru
                </button>
            </div>

            {/* Low Stock Warning Banner */}
            {lowStocks.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-center gap-3 text-red-300">
                    <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 animate-bounce" />
                    <div>
                        <span className="font-semibold">Perhatian!</span> {lowStocks.length} bahan baku berada di bawah atau sama dengan Reorder Point (Stok Menipis): {lowStocks.map(s => s.nama_barang).join(', ')}. Segera lakukan restock.
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-[#1E1939] rounded-2xl border border-[#3A3A52] overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-slate-300">
                        <thead className="bg-[#2A1E4D] text-slate-400 uppercase text-xs tracking-wider border-b border-[#3A3A52]">
                            <tr>
                                <th className="p-4">Nama Barang</th>
                                <th className="p-4">Kategori</th>
                                <th className="p-4">Stok Tersedia</th>
                                <th className="p-4">Reorder Point</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#3A3A52]">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-slate-400">Memuat data stok...</td>
                                </tr>
                            ) : stocks.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-slate-400">Belum ada data stok bahan baku.</td>
                                </tr>
                            ) : (
                                stocks.map((item) => {
                                    const isLow = parseFloat(item.stok) <= parseFloat(item.reorder_point);
                                    return (
                                        <tr key={item.id} className="hover:bg-[#2A1E4D]/50 transition">
                                            <td className="p-4 font-semibold text-white flex items-center gap-2">
                                                <Layers className="w-4 h-4 text-purple-400" />
                                                {item.nama_barang}
                                            </td>
                                            <td className="p-4">
                                                <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-medium border border-purple-500/30">
                                                    {item.kategori}
                                                </span>
                                            </td>
                                            <td className="p-4 font-bold text-white">
                                                {item.stok} <span className="text-xs font-normal text-slate-400">{item.satuan}</span>
                                            </td>
                                            <td className="p-4 text-slate-400">
                                                {item.reorder_point} {item.satuan}
                                            </td>
                                            <td className="p-4">
                                                {isLow ? (
                                                    <span className="inline-flex items-center gap-1.5 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-500/30 animate-pulse">
                                                        <AlertTriangle className="w-3.5 h-3.5" /> Stok Menipis
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">
                                                        Aman
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => setRestockModal(item)}
                                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                                                    title="Restock (+)"
                                                >
                                                    <RefreshCw className="w-3.5 h-3.5" /> Restock (+)
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="bg-red-500/20 hover:bg-red-500/40 text-red-400 p-1.5 rounded-lg transition"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Tambah Barang */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1E1939] border border-[#3A3A52] rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">Tambah Bahan Baku Baru</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-300 mb-1">Nama Barang / Bahan</label>
                                <input
                                    type="text"
                                    required
                                    value={form.nama_barang}
                                    onChange={e => setForm({...form, nama_barang: e.target.value})}
                                    placeholder="Contoh: Daging Sapi / Telur Ayam"
                                    className="w-full bg-[#0E0B1D] border border-[#3A3A52] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-1">Kategori</label>
                                <input
                                    type="text"
                                    required
                                    value={form.kategori}
                                    onChange={e => setForm({...form, kategori: e.target.value})}
                                    className="w-full bg-[#0E0B1D] border border-[#3A3A52] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-300 mb-1">Stok Awal</label>
                                    <input
                                        type="number"
                                        step="any"
                                        required
                                        value={form.stok}
                                        onChange={e => setForm({...form, stok: e.target.value})}
                                        placeholder="10"
                                        className="w-full bg-[#0E0B1D] border border-[#3A3A52] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-300 mb-1">Satuan</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.satuan}
                                        onChange={e => setForm({...form, satuan: e.target.value})}
                                        placeholder="Kg / Pcs / Liter"
                                        className="w-full bg-[#0E0B1D] border border-[#3A3A52] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-1">Batas Reorder Point (Minimum Stok)</label>
                                <input
                                    type="number"
                                    step="any"
                                    required
                                    value={form.reorder_point}
                                    onChange={e => setForm({...form, reorder_point: e.target.value})}
                                    placeholder="5"
                                    className="w-full bg-[#0E0B1D] border border-[#3A3A52] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-xl text-sm font-semibold transition"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Restock */}
            {restockModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1E1939] border border-[#3A3A52] rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-2">Restock Barang</h3>
                        <p className="text-slate-400 text-sm mb-4">
                            Tambah jumlah stok untuk <span className="text-white font-semibold">{restockModal.nama_barang}</span> ({restockModal.satuan}).
                        </p>
                        <form onSubmit={handleRestock} className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-300 mb-1">Jumlah Tambahan</label>
                                <input
                                    type="number"
                                    step="any"
                                    required
                                    autoFocus
                                    value={restockQty}
                                    onChange={e => setRestockQty(e.target.value)}
                                    placeholder="Contoh: 20"
                                    className="w-full bg-[#0E0B1D] border border-[#3A3A52] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setRestockModal(null)}
                                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-sm font-semibold transition"
                                >
                                    Tambah Stok
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
