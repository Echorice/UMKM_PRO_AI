import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function showToast(message, type = 'error') {
    const container = document.getElementById('toast-container') || (() => {
        const div = document.createElement('div');
        div.id = 'toast-container';
        div.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2';
        document.body.appendChild(div);
        return div;
    })();

    const toast = document.createElement('div');
    toast.className = `px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium animate-slide-in ${
        type === 'error' ? 'bg-rose-500' : type === 'success' ? 'bg-emerald-500' : 'bg-amber-500'
    }`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

export default function BukuKasView() {
    const [activeTab, setActiveTab] = useState('transaksi');
    const [transaksi, setTransaksi] = useState([]);
    const [bonList, setBonList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);

    const [editId, setEditId] = useState(null);
    const [bonEditId, setBonEditId] = useState(null);
    const [showBonModal, setShowBonModal] = useState(false);

    const [form, setForm] = useState({
        tanggal: new Date().toISOString().split('T')[0],
        jenis_transaksi: 'Pemasukan',
        kategori: 'Penjualan',
        sumber_kas: 'KAS_TUNAI',
        keterangan: '',
        nominal: ''
    });

    const [bonForm, setBonForm] = useState({
        nama_pihak: '',
        jenis_bon: 'PIUTANG',
        nominal: '',
        tanggal_jatuh_tempo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        keterangan: '',
        status: 'BELUM_LUNAS'
    });

    const CASH_SOURCES = [
        { value: 'KAS_TUNAI', label: 'Kas Tunai Toko' },
        { value: 'BANK_BCA', label: 'Bank BCA' },
        { value: 'BANK_MANDIRI', label: 'Bank Mandiri' },
        { value: 'QRIS', label: 'QRIS / E-Wallet' }
    ];

    const KATEGORI_PEMASUKAN = ['Penjualan', 'Modal Awal', 'Piutang Dibayar', 'Lain-lain'];
    const KATEGORI_PENGELUARAN = ['Operasional', 'Bahan Baku', 'Gaji Karyawan', 'Hutang Dibayar', 'Lain-lain'];

    const fetchTransaksi = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE}/transaksi`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            setTransaksi(data);
        } catch (err) {
            const msg = 'Gagal memuat data transaksi';
            console.error(msg, err);
            setError(msg);
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchBon = async () => {
        try {
            const response = await fetch(`${API_BASE}/bon`);
            if (response.ok) {
                const data = await response.json();
                setBonList(data);
            }
        } catch (err) {
            console.error('Gagal memuat bon:', err);
        }
    };

    const fetchDashboard = async () => {
        try {
            const response = await fetch(`${API_BASE}/dashboard-performance`);
            if (response.ok) {
                const data = await response.json();
                setDashboardData(data);
            }
        } catch (error) {
            console.error('Gagal fetch dashboard data:', error);
        }
    };

    useEffect(() => {
        fetchTransaksi();
        fetchBon();
        fetchDashboard();
    }, []);

    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
    };

    const formatRupiahShort = (angka) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0, notation: 'compact' }).format(angka);
    };

    const handleNominalChange = (e, formType = 'transaksi') => {
        const rawValue = e.target.value.replace(/\D/g, '');
        if (rawValue === '') {
            if (formType === 'transaksi') setForm({ ...form, nominal: '' });
            else setBonForm({ ...bonForm, nominal: '' });
            return;
        }
        const formatted = new Intl.NumberFormat('id-ID').format(rawValue);
        if (formType === 'transaksi') setForm({ ...form, nominal: formatted });
        else setBonForm({ ...bonForm, nominal: formatted });
    };

    const getBalancePerSource = () => {
        const balances = {};
        CASH_SOURCES.forEach(s => balances[s.value] = 0);

        transaksi.forEach(t => {
            const nominal = Number(t.nominal) || 0;
            const source = t.sumber_kas || 'KAS_TUNAI';
            if (t.jenis_transaksi === 'Pemasukan') {
                balances[source] = (balances[source] || 0) + nominal;
            } else {
                balances[source] = (balances[source] || 0) - nominal;
            }
        });
        return balances;
    };

    const balances = getBalancePerSource();
    const totalSaldo = Object.values(balances).reduce((a, b) => a + b, 0);

    const totalPemasukan = transaksi
        .filter(t => t.jenis_transaksi === 'Pemasukan')
        .reduce((acc, curr) => acc + Number(curr.nominal), 0);

    const totalPengeluaran = transaksi
        .filter(t => t.jenis_transaksi === 'Pengeluaran')
        .reduce((acc, curr) => acc + Number(curr.nominal), 0);

    const totalPiutang = bonList
        .filter(b => b.jenis_bon === 'PIUTANG' && b.status === 'BELUM_LUNAS')
        .reduce((acc, curr) => acc + Number(curr.nominal), 0);

    const totalHutang = bonList
        .filter(b => b.jenis_bon === 'HUTANG' && b.status === 'BELUM_LUNAS')
        .reduce((acc, curr) => acc + Number(curr.nominal), 0);

    const getReminders = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return bonList.filter(b => {
            if (b.status === 'LUNAS') return false;
            const due = new Date(b.tanggal_jatuh_tempo);
            due.setHours(0, 0, 0, 0);
            const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
            return diffDays <= 3;
        });
    };

    const reminders = getReminders();

    const handleEdit = (item) => {
        setEditId(item.id);
        setForm({
            tanggal: item.tanggal,
            jenis_transaksi: item.jenis_transaksi,
            kategori: item.kategori,
            sumber_kas: item.sumber_kas || 'KAS_TUNAI',
            keterangan: item.keterangan,
            nominal: new Intl.NumberFormat('id-ID').format(item.nominal)
        });
    };

    const handleHapus = async (id) => {
        if (!window.confirm('Yakin ingin menghapus transaksi ini?')) return;
        try {
            const response = await fetch(`${API_BASE}/transaksi/${id}`, { method: 'DELETE' });
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
            sumber_kas: 'KAS_TUNAI',
            keterangan: '',
            nominal: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.keterangan || !form.nominal) return;

        setLoading(true);
        const cleanNominal = Number(form.nominal.toString().replace(/\./g, ''));

        const url = editId ? `${API_BASE}/transaksi/${editId}` : `${API_BASE}/transaksi`;
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
                    sumber_kas: form.sumber_kas,
                    keterangan: form.keterangan,
                    nominal: cleanNominal
                })
            });

            if (response.ok) {
                showToast(editId ? 'Transaksi diperbarui' : 'Transaksi disimpan', 'success');
                fetchTransaksi();
                batalEdit();
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (err) {
            const msg = editId ? 'Gagal memperbarui transaksi' : 'Gagal menyimpan transaksi';
            console.error(msg, err);
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleBonEdit = (item) => {
        setBonEditId(item.id);
        setBonForm({
            nama_pihak: item.nama_pihak,
            jenis_bon: item.jenis_bon,
            nominal: new Intl.NumberFormat('id-ID').format(item.nominal),
            tanggal_jatuh_tempo: item.tanggal_jatuh_tempo,
            keterangan: item.keterangan,
            status: item.status
        });
        setShowBonModal(true);
    };

    const handleBonHapus = async (id) => {
        if (!window.confirm('Yakin ingin menghapus catatan bon ini?')) return;
        try {
            const response = await fetch(`${API_BASE}/bon/${id}`, { method: 'DELETE' });
            if (response.ok) fetchBon();
        } catch (error) {
            console.error('Gagal menghapus bon:', error);
        }
    };

    const batalBonEdit = () => {
        setBonEditId(null);
        setShowBonModal(false);
        setBonForm({
            nama_pihak: '',
            jenis_bon: 'PIUTANG',
            nominal: '',
            tanggal_jatuh_tempo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            keterangan: '',
            status: 'BELUM_LUNAS'
        });
    };

    const handleBonSubmit = async (e) => {
        e.preventDefault();
        if (!bonForm.nama_pihak || !bonForm.nominal) return;

        setLoading(true);
        const cleanNominal = Number(bonForm.nominal.toString().replace(/\./g, ''));

        const url = bonEditId ? `${API_BASE}/bon/${bonEditId}` : `${API_BASE}/bon`;
        const method = bonEditId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    nama_pihak: bonForm.nama_pihak,
                    jenis_bon: bonForm.jenis_bon,
                    nominal: cleanNominal,
                    tanggal_jatuh_tempo: bonForm.tanggal_jatuh_tempo,
                    keterangan: bonForm.keterangan,
                    status: bonForm.status
                })
            });

            if (response.ok) {
                showToast(bonEditId ? 'Catatan bon diperbarui' : 'Catatan bon disimpan', 'success');
                fetchBon();
                batalBonEdit();
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (err) {
            const msg = bonEditId ? 'Gagal memperbarui bon' : 'Gagal menyimpan bon';
            console.error(msg, err);
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const toggleBonStatus = async (bon) => {
        try {
            const response = await fetch(`${API_BASE}/bon/${bon.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...bon, status: bon.status === 'LUNAS' ? 'BELUM_LUNAS' : 'LUNAS' })
            });
            if (response.ok) fetchBon();
        } catch (err) {
            console.error('Gagal ubah status:', err);
        }
    };

    const getKategoriOptions = () => form.jenis_transaksi === 'Pemasukan' ? KATEGORI_PEMASUKAN : KATEGORI_PENGELUARAN;

    const getStatusBadge = (status) => status === 'LUNAS'
        ? <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1.5 w-fit"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>Lunas</span>
        : <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 flex items-center gap-1.5 w-fit"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>Belum Lunas</span>;

    const getJenisBonBadge = (jenis) => jenis === 'PIUTANG'
        ? <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 flex items-center gap-1.5 justify-center"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>Piutang</span>
        : <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 flex items-center gap-1.5 justify-center"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>Hutang</span>;

    const getDueDateStatus = (tanggalJatuhTempo) => {
        const today = new Date(); today.setHours(0,0,0,0);
        const due = new Date(tanggalJatuhTempo); due.setHours(0,0,0,0);
        const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        if (diff < 0) return { text: `${Math.abs(diff)} hari lewat`, class: 'text-rose-600 bg-rose-50', urgent: true };
        if (diff === 0) return { text: 'Jatuh tempo hari ini', class: 'text-rose-600 bg-rose-50', urgent: true };
        if (diff <= 3) return { text: `${diff} hari lagi`, class: 'text-amber-600 bg-amber-50', urgent: true };
        return { text: `${diff} hari lagi`, class: 'text-slate-600 bg-slate-50', urgent: false };
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

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="mb-8 bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider mb-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        AI ML Engine Active • UMKM Pro Intelligence
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Toko Berkah Jaya</h1>
                    <p className="text-purple-200 text-sm mt-1">Buku Kas Harian & Manajemen Keuangan Operasional</p>
                </div>
            </div>
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

            {reminders.length > 0 && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-amber-800 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                                Pengingat Jatuh Tempo Bon
                            </p>
                            <p className="text-xs text-amber-700 mt-1">Ada {reminders.length} bon yang mendekati jatuh tempo atau sudah lewat:</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {reminders.map((b, i) => {
                                    const due = getDueDateStatus(b.tanggal_jatuh_tempo);
                                    return (
                                        <span key={i} className={`px-3 py-1 rounded-full text-xs font-medium ${due.class} ${due.urgent ? 'animate-pulse' : ''} flex items-center gap-1.5`}>
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                {b.jenis_bon === 'PIUTANG' ? (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                                                ) : (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                                                )}
                                            </svg>
                                            {b.nama_pihak}: {formatRupiahShort(b.nominal)} ({due.text})
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-6 border-b border-slate-200">
                <nav className="flex gap-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('transaksi')}
                        className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'transaksi' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        Transaksi Harian
                    </button>
                    <button
                        onClick={() => setActiveTab('bon')}
                        className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'bon' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
                        Catatan Bon (Hutang & Piutang)
                    </button>
                </nav>
            </div>

            {activeTab === 'transaksi' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Sumber Kas / Metode Pembayaran</label>
                                <select value={form.sumber_kas} onChange={(e) => setForm({...form, sumber_kas: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm bg-white">
                                    {CASH_SOURCES.map(s => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Kategori</label>
                                <select value={form.kategori} onChange={(e) => setForm({...form, kategori: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm bg-white">
                                    {getKategoriOptions().map((kat, i) => (
                                        <option key={i} value={kat}>{kat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Keterangan</label>
                                <input type="text" value={form.keterangan} onChange={(e) => setForm({...form, keterangan: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm" required/>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nominal (Rp)</label>
                                <input type="text" value={form.nominal} onChange={(e) => handleNominalChange(e, 'transaksi')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm font-semibold text-purple-900" required/>
                            </div>

                            <button type="submit" disabled={loading} className={`w-full py-3 text-white font-bold rounded-xl shadow-lg transition-all text-sm disabled:opacity-50 ${editId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-purple-600 hover:bg-purple-700'}`}>
                                {loading ? 'Menyimpan...' : (editId ? 'Update Transaksi' : 'Simpan Transaksi')}
                            </button>
                        </form>
                    </div>

                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                        <h2 className="text-lg font-bold text-purple-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                            Riwayat Buku Kas
                            <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2.5 py-1 rounded-full">{transaksi.length} transaksi</span>
                        </h2>
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
                                    {transaksi.length > 0 ? (
                                        transaksi.map((t) => (
                                            <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="py-3.5 px-4 text-slate-600 font-medium">{t.tanggal}</td>
                                                <td className="py-3.5 px-4">
                                                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-700">
                                                        {SourceIcon({ value: t.sumber_kas || 'KAS_TUNAI' })} {CASH_SOURCES.find(s => s.value === (t.sumber_kas || 'KAS_TUNAI'))?.label || 'Kas Tunai'}
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
                                                    <button onClick={() => handleEdit(t)} className="bg-amber-100 text-amber-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-200 transition-colors">Edit</button>
                                                    <button onClick={() => handleHapus(t.id)} className="bg-rose-100 text-rose-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-rose-200 transition-colors">Hapus</button>
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
                </div>
            )}

            {activeTab === 'bon' && (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-purple-900">Catatan Bon (Hutang & Piutang)</h2>
                            <p className="text-slate-500 text-sm mt-1">Kelola piutang pelanggan & hutang supplier dengan jatuh tempo & status pelunasan</p>
                        </div>
                        <button
                            onClick={() => { batalBonEdit(); setShowBonModal(true); }}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            Catat Bon Baru
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Total Piutang Aktif</p>
                                <h3 className="text-xl font-bold text-blue-700">{formatRupiah(totalPiutang)}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Total Hutang Aktif</p>
                                <h3 className="text-xl font-bold text-amber-700">{formatRupiah(totalHutang)}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Bon Lunas (Bulan Ini)</p>
                                <h3 className="text-xl font-bold text-emerald-700">
                                    {bonList.filter(b => b.status === 'LUNAS').length} bon
                                </h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wider">
                                        <th className="py-3 px-4">Nama Pihak</th>
                                        <th className="py-3 px-4 text-center">Jenis</th>
                                        <th className="py-3 px-4 text-right">Nominal</th>
                                        <th className="py-3 px-4">Jatuh Tempo</th>
                                        <th className="py-3 px-4 text-center">Status</th>
                                        <th className="py-3 px-4">Keterangan</th>
                                        <th className="py-3 px-4 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {bonList.length > 0 ? (
                                        bonList.map((b) => {
                                            const due = getDueDateStatus(b.tanggal_jatuh_tempo);
                                            return (
                                                <tr key={b.id} className={`hover:bg-slate-50 transition-colors ${b.status === 'LUNAS' ? 'opacity-60' : ''}`}>
                                                    <td className="py-3.5 px-4 font-bold text-slate-800">{b.nama_pihak}</td>
                                                    <td className="py-3.5 px-4 text-center">{getJenisBonBadge(b.jenis_bon)}</td>
                                                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">{formatRupiah(b.nominal)}</td>
                                                    <td className="py-3.5 px-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${due.class} ${due.urgent && b.status === 'BELUM_LUNAS' ? 'animate-pulse' : ''}`}>
                                                            {b.tanggal_jatuh_tempo} ({due.text})
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center">
                                                        {getStatusBadge(b.status)}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{b.keterangan || '-'}</td>
                                                    <td className="py-3.5 px-4 text-center flex justify-center gap-2">
                                                        <button
                                                            onClick={() => toggleBonStatus(b)}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${b.status === 'LUNAS' ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'}`}
                                                        >
                                                            {b.status === 'LUNAS' ? 'Batalkan' : 'Lunas'}
                                                        </button>
                                                        <button onClick={() => handleBonEdit(b)} className="bg-purple-100 text-purple-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-200 transition-colors">Edit</button>
                                                        <button onClick={() => handleBonHapus(b.id)} className="bg-rose-100 text-rose-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-rose-200 transition-colors">Hapus</button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr><td colSpan="7" className="text-center py-8 text-slate-400">Belum ada catatan bon.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {showBonModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in" onClick={batalBonEdit}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center justify-between">
                            {bonEditId ? '✏️ Edit Catatan Bon' : '📝 Catat Bon Baru'}
                            <button onClick={batalBonEdit} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </h3>
                        <form onSubmit={handleBonSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nama Debitur / Kreditur</label>
                                <input type="text" value={bonForm.nama_pihak} onChange={(e) => setBonForm({...bonForm, nama_pihak: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm" required placeholder="Contoh: Toko Sinar Jaya / CV Maju Jaya"/>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Jenis Bon</label>
                                <select value={bonForm.jenis_bon} onChange={(e) => setBonForm({...bonForm, jenis_bon: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm bg-white">
                                    <option value="PIUTANG">📥 Piutang (Pelanggan bayar ke kami)</option>
                                    <option value="HUTANG">📤 Hutang (Kami bayar ke supplier)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nominal (Rp)</label>
                                <input type="text" value={bonForm.nominal} onChange={(e) => handleNominalChange(e, 'bon')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm font-semibold text-purple-900" required/>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Tanggal Jatuh Tempo</label>
                                <input type="date" value={bonForm.tanggal_jatuh_tempo} onChange={(e) => setBonForm({...bonForm, tanggal_jatuh_tempo: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm" required/>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Keterangan</label>
                                <textarea value={bonForm.keterangan} onChange={(e) => setBonForm({...bonForm, keterangan: e.target.value})} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm" placeholder="Catatan tambahan..."/>
                            </div>
                            {bonEditId && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Status Pelunasan</label>
                                    <select value={bonForm.status} onChange={(e) => setBonForm({...bonForm, status: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm bg-white">
                                        <option value="BELUM_LUNAS">Belum Lunas</option>
                                        <option value="LUNAS">Lunas</option>
                                    </select>
                                </div>
                            )}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={batalBonEdit} className="flex-1 py-2.5 text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">Batal</button>
                                <button type="submit" disabled={loading} className="flex-1 py-2.5 text-white font-bold rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition-colors">
                                    {loading ? 'Menyimpan...' : (bonEditId ? 'Update' : 'Simpan')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}