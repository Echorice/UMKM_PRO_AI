import React, { useState, useEffect, useMemo } from 'react';

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

    // Toolbar state (tabel riwayat bon) — client-side filter/sort/pagination
    const [bonSearch, setBonSearch] = useState('');
    const [bonJenisFilter, setBonJenisFilter] = useState('SEMUA');
    const [bonStatusFilter, setBonStatusFilter] = useState('SEMUA');
    const [bonDueSort, setBonDueSort] = useState('desc');
    const [bonPerPage, setBonPerPage] = useState(25);
    const [bonPage, setBonPage] = useState(1);

    // Toolbar state (tabel riwayat Buku Kas) — hanya tampilan tabel
    const [transaksiSearch, setTransaksiSearch] = useState('');
    const [transaksiJenisFilter, setTransaksiJenisFilter] = useState('SEMUA');
    const [transaksiSumberFilter, setTransaksiSumberFilter] = useState('SEMUA');
    const [transaksiPerPage, setTransaksiPerPage] = useState(25);
    const [transaksiPage, setTransaksiPage] = useState(1);

    // Filter & Reporting State
    const [periodeFilter, setPeriodeFilter] = useState('semua');
    const [customStart, setCustomStart] = useState(new Date().toISOString().split('T')[0]);
    const [customEnd, setCustomEnd] = useState(new Date().toISOString().split('T')[0]);
    const [showReportModal, setShowReportModal] = useState(null); // 'pl' | 'cashflow' | 'print'

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

    // Filter & Report state
    const [reportData, setReportData] = useState(null);

    const getFilteredTransaksi = React.useMemo(() => {
        if (!transaksi || transaksi.length === 0) return [];
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

        return transaksi.filter((t) => {
            const tgl = new Date(t.tanggal);
            if (isNaN(tgl.getTime())) return false;
            if (periodeFilter === 'hari_ini') return tgl >= todayStart && tgl <= todayEnd;
            if (periodeFilter === 'minggu_ini') return tgl >= weekStart && tgl <= weekEnd;
            if (periodeFilter === 'bulan_ini') return tgl >= monthStart && tgl <= monthEnd;
            if (periodeFilter === 'custom') {
                const start = new Date(customStart);
                const end = new Date(customEnd);
                end.setHours(23, 59, 59, 999);
                return tgl >= start && tgl <= end;
            }
            return true;
        });
    }, [transaksi, periodeFilter, customStart, customEnd]);

    // View-only pipeline for the table (badge, export & report tetap pakai getFilteredTransaksi)
    const transaksiView = useMemo(() => {
        let rows = [...getFilteredTransaksi];

        if (transaksiSearch) {
            const term = transaksiSearch.toLowerCase();
            rows = rows.filter(t =>
                (t.keterangan && t.keterangan.toLowerCase().includes(term)) ||
                (t.kategori && t.kategori.toLowerCase().includes(term)) ||
                (t.sumber_kas && t.sumber_kas.toLowerCase().includes(term)) ||
                String(t.nominal).includes(term) ||
                (t.tanggal && t.tanggal.toLowerCase().includes(term))
            );
        }

        if (transaksiJenisFilter !== 'SEMUA') {
            rows = rows.filter(t => t.jenis_transaksi === transaksiJenisFilter);
        }

        if (transaksiSumberFilter !== 'SEMUA') {
            rows = rows.filter(t => (t.sumber_kas || 'KAS_TUNAI') === transaksiSumberFilter);
        }

        return rows;
    }, [getFilteredTransaksi, transaksiSearch, transaksiJenisFilter, transaksiSumberFilter]);

    useEffect(() => {
        setTransaksiPage(1);
    }, [transaksiSearch, transaksiJenisFilter, transaksiSumberFilter, transaksiPerPage]);

    const totalTransaksiPages = transaksiPerPage === 'SEMUA' ? 1 : Math.ceil(transaksiView.length / Number(transaksiPerPage));
    const transaksiPageSlice = transaksiPerPage === 'SEMUA'
        ? transaksiView
        : transaksiView.slice((transaksiPage - 1) * Number(transaksiPerPage), transaksiPage * Number(transaksiPerPage));

    const handleExportExcel = () => {
        try {
            let csvContent = "data:text/csv;charset=utf-8,Tanggal,Sumber,Keterangan,Jenis,Nominal,Kategori\r\n";
            getFilteredTransaksi.forEach((t) => {
                const row = [t.tanggal, t.sumber_kas || 'KAS_TUNAI', `"${t.keterangan || ''}"`, t.jenis_transaksi, t.nominal, t.kategori].join(",");
                csvContent += row + "\r\n";
            });
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `laporan-buku-kas-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            showToast('Export data ke CSV/Excel berhasil', 'success');
        } catch (err) {
            console.error('Export error:', err);
            showToast('Gagal export data', 'error');
        }
    };

    const handleOpenReport = (type) => {
        const filtered = getFilteredTransaksi;
        const totalPemasukan = filtered.filter(t => t.jenis_transaksi === 'Pemasukan').reduce((sum, t) => sum + parseFloat(String(t.nominal).replace(/\\D/g, '') || 0), 0);
        const totalPengeluaran = filtered.filter(t => t.jenis_transaksi === 'Pengeluaran').reduce((sum, t) => sum + parseFloat(String(t.nominal).replace(/\\D/g, '') || 0), 0);
        const totalSaldo = totalPemasukan - totalPengeluaran;
        setReportData({ type, totalPemasukan, totalPengeluaran, totalSaldo, filtered });
        setShowReportModal('print');
    };

    const handleExportMarkdown = () => {
        try {
            const typeLabel = reportData.type === 'pl' ? 'LABA RUGI' : reportData.type === 'cashflow' ? 'ARUS KAS' : 'ARUS KAS BANK';
            const periodeLabel = periodeFilter === 'custom' ? `${customStart} s/d ${customEnd}` : periodeFilter === 'hari_ini' ? 'Hari Ini' : periodeFilter === 'minggu_ini' ? 'Minggu Ini' : periodeFilter === 'bulan_ini' ? 'Bulan Ini' : 'Semua Waktu';
            const rupiah = (n) => `Rp ${Number(n).toLocaleString('id-ID')}`;
            const lines = [];
            lines.push(`# LAPORAN KEUANGAN: ${typeLabel}`);
            lines.push('');
            lines.push('## Informasi Toko');
            lines.push(`- Nama Toko : Toko Berkah Jaya`);
            lines.push(`- Periode   : ${periodeLabel}`);
            lines.push(`- Waktu Cetak : ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`);
            lines.push('');
            lines.push('## 1. Ringkasan Pendapatan');
            lines.push(`- Total Pemasukan  : ${rupiah(reportData.totalPemasukan)}`);
            lines.push(`- Total Pengeluaran: ${rupiah(reportData.totalPengeluaran)}`);
            lines.push(`- Saldo Bersih     : ${rupiah(reportData.totalSaldo)}`);
            lines.push('');
            lines.push('## 2. Kategori Transaksi');
            lines.push(`| Kategori | Pemasukan | Pengeluaran |`);
            lines.push(`| -------- | --------- | ----------- |`);
            const kategoriMap = {};
            reportData.filtered.forEach(t => {
                if (!kategoriMap[t.kategori]) kategoriMap[t.kategori] = { pemasukan: 0, pengeluaran: 0 };
                if (t.jenis_transaksi === 'Pemasukan') kategoriMap[t.kategori].pemasukan += parseFloat(String(t.nominal).replace(/\\D/g, '') || 0);
                else kategoriMap[t.kategori].pengeluaran += parseFloat(String(t.nominal).replace(/\\D/g, '') || 0);
            });
            Object.entries(kategoriMap).forEach(([kat, val]) => {
                lines.push(`| ${kat} | ${val.pemasukan ? rupiah(val.pemasukan) : '-'} | ${val.pengeluaran ? rupiah(val.pengeluaran) : '-'} |`);
            });
            lines.push('');
            lines.push('## 3. Detail Transaksi');
            lines.push(`| Tanggal | Sumber Kas | Keterangan | Jenis | Nominal |`);
            lines.push(`| -------- | --------- | ----------- | :--- | :--- |`);
            reportData.filtered.forEach(t => {
                const sgn = t.jenis_transaksi === 'Pemasukan' ? '+' : '-';
                lines.push(`| ${t.tanggal} | ${t.sumber_kas || 'KAS_TUNAI'} | ${t.keterangan || '-'} | ${t.jenis_transaksi} | ${sgn} ${rupiah(Math.abs(parseFloat(t.nominal)))} |`);
            });
            lines.push('');
            lines.push('---');
            lines.push(`*© UMKM Pro AI • Laporan ${typeLabel} • Format BW OCR*`);

            // Trigger download
            const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `laporan-${reportData.type}-${new Date().toISOString().split('T')[0]}.md`;
            document.body.appendChild(link);
            link.click();
            link.remove();

            showToast('Export Markdown berhasil', 'success');
        } catch (err) {
            console.error('Export Markdown error:', err);
            showToast('Gagal export Markdown', 'error');
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

    // Derived & filtered list for the riwayat bon table
    const bonListFiltered = useMemo(() => {
        let result = [...bonList];

        if (bonSearch) {
            const term = bonSearch.toLowerCase();
            result = result.filter(b =>
                b.nama_pihak.toLowerCase().includes(term) ||
                (b.keterangan && b.keterangan.toLowerCase().includes(term)) ||
                String(b.nominal).includes(term) ||
                b.tanggal_jatuh_tempo.toLowerCase().includes(term)
            );
        }

        if (bonJenisFilter !== 'SEMUA') {
            result = result.filter(b => b.jenis_bon === bonJenisFilter);
        }

        if (bonStatusFilter !== 'SEMUA') {
            result = result.filter(b => b.status === bonStatusFilter);
        }

        result.sort((a, b) => {
            const da = new Date(a.tanggal_jatuh_tempo);
            const db = new Date(b.tanggal_jatuh_tempo);
            if (bonDueSort === 'asc') return da.getTime() - db.getTime();
            else return db.getTime() - da.getTime();
        });

        return result;
    }, [bonList, bonSearch, bonJenisFilter, bonStatusFilter, bonDueSort]);

    useEffect(() => {
        setBonPage(1);
    }, [bonSearch, bonJenisFilter, bonStatusFilter, bonPerPage]);

    const totalBonPages = bonPerPage === 'SEMUA' ? 1 : Math.ceil(bonListFiltered.length / Number(bonPerPage));
    const bonPageSlice = bonPerPage === 'SEMUA' 
        ? bonListFiltered 
        : bonListFiltered.slice((bonPage - 1) * Number(bonPerPage), bonPage * Number(bonPerPage));

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

    const formatTanggalISO = (isoString) => {
        if (!isoString) return '-';
        const d = new Date(isoString);
        return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
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
                <div className="flex flex-wrap items-center gap-3">
                    <button onClick={handleExportExcel} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 border border-white/20 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        Export Excel
                    </button>
                    <button onClick={() => handleOpenReport('pl')} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-lg transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                        Laporan Laba Rugi
                    </button>
                    <button onClick={() => handleOpenReport('cashflow')} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-lg transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                        Arus Kas & Bank
                    </button>
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
                        <h3 className="text-2xl font-bold mt-1">{formatRupiah(totalPiutang)}</h3>
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
                                            {b.nama_pihak}: {formatRupiahShort(b.nominal)} | {formatTanggalISO(b.tanggal_jatuh_tempo)} ({due.text})
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
                        className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'bon' ? 'border-purple-600 text-purple-700' : 'border-transparent text-purple-300 hover:text-slate-700'}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
                        Catatan Bon (Hutang & Piutang)
                    </button>
                </nav>
            </div>

            {activeTab === 'transaksi' && (
                <div className="flex flex-col gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 h-fit">
                        <h2 className="text-lg font-bold text-purple-900 mb-4 pb-2 border-b border-slate-100 flex justify-between items-center">
                            <span className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                {editId ? 'Edit Transaksi' : 'Tambah Transaksi'}
                            </span>
                            {editId && <button type="button" onClick={batalEdit} className="text-xs text-rose-500 hover:underline">Batal Edit</button>}
                        </h2>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Tanggal</label>
                                <input type="date" value={form.tanggal} onChange={(e) => setForm({...form, tanggal: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm text-slate-900" required/>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Jenis Transaksi</label>
                                <select value={form.jenis_transaksi} onChange={(e) => setForm({...form, jenis_transaksi: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm bg-white text-slate-900">
                                    <option value="Pemasukan">Pemasukan (Masuk)</option>
                                    <option value="Pengeluaran">Pengeluaran (Keluar)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Sumber Kas / Metode Pembayaran</label>
                                <select value={form.sumber_kas} onChange={(e) => setForm({...form, sumber_kas: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm bg-white text-slate-900">
                                    {CASH_SOURCES.map(s => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Kategori</label>
                                <select value={form.kategori} onChange={(e) => setForm({...form, kategori: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm bg-white text-slate-900">
                                    {getKategoriOptions().map((kat, i) => (
                                        <option key={i} value={kat}>{kat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Keterangan</label>
                                <input type="text" value={form.keterangan} onChange={(e) => setForm({...form, keterangan: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm text-slate-900" required/>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nominal (Rp)</label>
                                <input type="text" value={form.nominal} onChange={(e) => handleNominalChange(e, 'transaksi')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm font-semibold text-purple-900" required/>
                            </div>

                            <button type="submit" disabled={loading} className={`md:col-span-2 w-full py-3 text-white font-bold rounded-xl shadow-lg transition-all text-sm disabled:opacity-50 ${editId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-purple-600 hover:bg-purple-700'}`}>
                                {loading ? 'Menyimpan...' : (editId ? 'Update Transaksi' : 'Simpan Transaksi')}
                            </button>
                        </form>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                        <h2 className="text-lg font-bold text-purple-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                            Riwayat Buku Kas
                            <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2.5 py-1 rounded-full">{getFilteredTransaksi.length} transaksi</span>
                        </h2>
                        <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
                            {/* Baris filter: periode · jenis · sumber · jumlah baris */}
                            <div className="flex flex-wrap items-center gap-2">
                                <label htmlFor="filter-periode" className="text-xs font-semibold uppercase text-slate-500">Periode</label>
                                <select id="filter-periode" value={periodeFilter} onChange={(e) => setPeriodeFilter(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-xs font-semibold bg-white text-slate-800 min-w-[150px]">
                                    <option value="semua">Semua Waktu</option>
                                    <option value="hari_ini">Hari Ini</option>
                                    <option value="minggu_ini">Minggu Ini</option>
                                    <option value="bulan_ini">Bulan Ini</option>
                                    <option value="custom">Custom Range</option>
                                </select>
                                {periodeFilter === 'custom' && (
                                    <div className="flex items-center gap-2">
                                        <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-xs font-semibold bg-white text-slate-800" />
                                        <span className="text-slate-400 text-xs">s/d</span>
                                        <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-xs font-semibold bg-white text-slate-800" />
                                    </div>
                                )}
                                <div className="hidden h-6 w-px bg-slate-200 sm:block" />
                                <div className="inline-flex overflow-hidden rounded-xl border border-slate-200 bg-white">
                                    {[['SEMUA', 'Semua'], ['Pemasukan', 'Pemasukan'], ['Pengeluaran', 'Pengeluaran']].map(([val, label]) => (
                                        <button
                                            key={val}
                                            type="button"
                                            onClick={() => setTransaksiJenisFilter(val)}
                                            className={`px-3 py-2 text-xs font-bold transition-colors ${transaksiJenisFilter === val ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-purple-50'}`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                                <select value={transaksiSumberFilter} onChange={(e) => setTransaksiSumberFilter(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-xs font-semibold bg-white text-slate-800 min-w-[150px]">
                                    <option value="SEMUA">Semua Sumber</option>
                                    {CASH_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                </select>
                                <div className="ml-auto flex items-center gap-2">
                                    <label htmlFor="filter-baris" className="text-xs font-semibold uppercase text-slate-500">Baris</label>
                                    <select id="filter-baris" value={transaksiPerPage} onChange={(e) => setTransaksiPerPage(e.target.value === 'SEMUA' ? 'SEMUA' : Number(e.target.value))} className="px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none text-xs font-semibold bg-white text-slate-800">
                                        {[5, 25, 30, 50, 75, 100].map(n => <option key={n} value={n}>{n}</option>)}
                                        <option value="SEMUA">Semua</option>
                                    </select>
                                </div>
                            </div>
                            {/* Pencarian */}
                            <div className="relative mt-3">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"/></svg>
                                <input
                                    type="text"
                                    value={transaksiSearch}
                                    onChange={(e) => setTransaksiSearch(e.target.value)}
                                    placeholder="Cari keterangan, kategori, nominal…"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm bg-white text-slate-900 placeholder:text-slate-400"
                                />
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
                                    {transaksiView.length > 0 ? (
                                        transaksiPageSlice.map((t) => (
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
                                        <tr><td colSpan="6" className="text-center py-8 text-slate-400">
                                            {getFilteredTransaksi.length === 0 ? 'Belum ada transaksi.' : 'Tidak ada transaksi yang cocok.'}
                                        </td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer pagination (sembunyi bila 1 halaman / mode Semua) */}
                        {transaksiPerPage !== 'SEMUA' && totalTransaksiPages > 1 && (
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 mt-4 border-t border-slate-100">
                                <p className="text-xs text-slate-500">
                                    Menampilkan {((transaksiPage - 1) * Number(transaksiPerPage)) + 1}–{Math.min(transaksiPage * Number(transaksiPerPage), transaksiView.length)} dari {transaksiView.length} transaksi
                                </p>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setTransaksiPage(p => Math.max(1, p - 1))}
                                        disabled={transaksiPage === 1}
                                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        ‹ Prev
                                    </button>
                                    {Array.from({ length: totalTransaksiPages }, (_, i) => i + 1).map(p => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setTransaksiPage(p)}
                                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${transaksiPage === p ? 'bg-purple-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-purple-50'}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setTransaksiPage(p => Math.min(totalTransaksiPages, p + 1))}
                                        disabled={transaksiPage >= totalTransaksiPages}
                                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next ›
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'bon' && (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-purple-300">Catatan Bon (Hutang & Piutang)</h2>
                            <p className="text-purple-200 text-sm mt-1">Kelola piutang pelanggan & hutang supplier dengan jatuh tempo & status pelunasan</p>
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
                        {/* Toolbar: search / filter jenis / sort jatuh tempo / filter status / per-page */}
                        <div className="flex flex-col gap-3 mb-5 pb-5 border-b border-slate-100">
                            <div className="relative w-full">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"/></svg>
                                <input
                                    type="text"
                                    value={bonSearch}
                                    onChange={(e) => setBonSearch(e.target.value)}
                                    placeholder="Cari nama, keterangan, nominal…"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:outline-none text-sm text-slate-800 placeholder:text-slate-400"
                                />
                            </div>
                            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                                {/* Filter Jenis — segmented */}
                                <div className="inline-flex rounded-xl border border-slate-200 overflow-hidden w-fit">
                                    {[['SEMUA', 'Semua'], ['PIUTANG', 'Piutang'], ['HUTANG', 'Hutang']].map(([val, label]) => (
                                        <button
                                            key={val}
                                            type="button"
                                            onClick={() => setBonJenisFilter(val)}
                                            className={`px-3.5 py-2 text-xs font-bold transition-colors ${bonJenisFilter === val ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 hover:bg-purple-50'}`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                                {/* Filter Status — segmented */}
                                <div className="inline-flex rounded-xl border border-slate-200 overflow-hidden w-fit">
                                    {[['SEMUA', 'Semua'], ['BELUM_LUNAS', 'Belum Lunas'], ['LUNAS', 'Lunas']].map(([val, label]) => (
                                        <button
                                            key={val}
                                            type="button"
                                            onClick={() => setBonStatusFilter(val)}
                                            className={`px-3.5 py-2 text-xs font-bold transition-colors ${bonStatusFilter === val ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 hover:bg-purple-50'}`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                                {/* Sort Jatuh Tempo — toggle arah */}
                                <button
                                    type="button"
                                    onClick={() => setBonDueSort(bonDueSort === 'asc' ? 'desc' : 'asc')}
                                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-purple-50 transition-colors w-fit"
                                    title="Ubah arah urutan jatuh tempo"
                                >
                                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/></svg>
                                    Jatuh Tempo: {bonDueSort === 'asc' ? 'Terdekat' : 'Terjauh'}
                                </button>
                                {/* Per-page selector */}
                                <div className="inline-flex items-center gap-2 w-fit lg:ml-auto">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Baris</label>
                                    <select
                                        value={bonPerPage}
                                        onChange={(e) => setBonPerPage(e.target.value === 'SEMUA' ? 'SEMUA' : Number(e.target.value))}
                                        className="px-3 py-2 rounded-xl border border-slate-300 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:outline-none text-xs font-semibold bg-white text-slate-800"
                                    >
                                        {[5, 25, 30, 50, 75, 100].map(n => <option key={n} value={n}>{n}</option>)}
                                        <option value="SEMUA">Semua</option>
                                    </select>
                                </div>
                            </div>
                        </div>

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
                                        bonPageSlice.map((b) => {
                                            const due = getDueDateStatus(b.tanggal_jatuh_tempo);
                                            return (
                                                <tr key={b.id} className={`hover:bg-slate-50 transition-colors ${b.status === 'LUNAS' ? 'opacity-60' : ''}`}>
                                                    <td className="py-3.5 px-4 font-bold text-slate-800">{b.nama_pihak}</td>
                                                    <td className="py-3.5 px-4 text-center">{getJenisBonBadge(b.jenis_bon)}</td>
                                                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">{formatRupiah(b.nominal)}</td>
                                                    <td className="py-3.5 px-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${due.class} ${due.urgent && b.status === 'BELUM_LUNAS' ? 'animate-pulse' : ''}`}>
                                                            {formatTanggalISO(b.tanggal_jatuh_tempo)} ({due.text})
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
                                        <tr><td colSpan="7" className="text-center py-8 text-slate-400">
                                            {bonList.length === 0 ? 'Belum ada catatan bon.' : 'Tidak ada bon yang cocok dengan pencarian.'}
                                        </td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer: info rentang + navigasi halaman (disembunyikan bila 1 halaman / mode Semua) */}
                        {bonPerPage !== 'SEMUA' && totalBonPages > 1 && (
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 mt-4 border-t border-slate-100">
                                <p className="text-xs text-slate-500">
                                    Menampilkan {((bonPage - 1) * Number(bonPerPage)) + 1}–{Math.min(bonPage * Number(bonPerPage), bonListFiltered.length)} dari {bonListFiltered.length} bon
                                </p>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setBonPage(p => Math.max(1, p - 1))}
                                        disabled={bonPage === 1}
                                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        ‹ Prev
                                    </button>
                                    {Array.from({ length: totalBonPages }, (_, i) => i + 1).map(p => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setBonPage(p)}
                                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${bonPage === p ? 'bg-purple-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-purple-50'}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setBonPage(p => Math.min(totalBonPages, p + 1))}
                                        disabled={bonPage >= totalBonPages}
                                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next ›
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showBonModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in" onClick={batalBonEdit}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center justify-between">
                            <span className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                </div>
                                {bonEditId ? 'Edit Catatan Bon' : 'Catat Bon Baru'}
                            </span>
                            <button onClick={batalBonEdit} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </h3>
                        <form onSubmit={handleBonSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nama Debitur / Kreditur</label>
                                <input type="text" value={bonForm.nama_pihak} onChange={(e) => setBonForm({...bonForm, nama_pihak: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:outline-none text-sm text-slate-800 placeholder:text-slate-400" required placeholder="Contoh: Toko Sinar Jaya / CV Maju Jaya"/>
                            </div>
                            <div>
                                                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Jenis Bon</label>
                                                            <select value={bonForm.jenis_bon} onChange={(e) => setBonForm({...bonForm, jenis_bon: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:outline-none text-sm bg-white text-slate-800">
                                                                <option value="PIUTANG">Piutang (Pelanggan bayar ke kami)</option>
                                                                <option value="HUTANG">Hutang (Kami bayar ke supplier)</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nominal (Rp)</label>
                                                            <input type="text" value={bonForm.nominal} onChange={(e) => handleNominalChange(e, 'bon')} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:outline-none text-sm font-semibold text-purple-900 placeholder:text-slate-400" required/>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tanggal Jatuh Tempo</label>
                                                            <input type="date" value={bonForm.tanggal_jatuh_tempo} onChange={(e) => setBonForm({...bonForm, tanggal_jatuh_tempo: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:outline-none text-sm text-slate-800" required/>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Keterangan</label>
                                                            <textarea value={bonForm.keterangan} onChange={(e) => setBonForm({...bonForm, keterangan: e.target.value})} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:outline-none text-sm text-slate-800 placeholder:text-slate-400" placeholder="Catatan tambahan..."/>
                                                        </div>
                                                        {bonEditId && (
                                                            <div>
                                                                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Status Pelunasan</label>
                                                                <select value={bonForm.status} onChange={(e) => setBonForm({...bonForm, status: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:outline-none text-sm bg-white text-slate-800">
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

            {showReportModal === 'print' && reportData && (
                <>
                    <style>{`
                        @media print {
                            body * { visibility: hidden !important; }
                            .fixed inset-0 z-50, .fixed.z-50, .modal-report-overlay,
                            #print-report, #print-report * { display: none !important; }
                            #print-report, #print-report * { position: absolute !important; left: 0 !important; top: 0 !important; visibility: visible !important; width: 100% !important; }
                            .print-report-panel { box-shadow: none !important; border: none !important; max-height: none !important; max-width: none !important; }
                            .print-report-inner { padding: 0 !important; overflow: visible !important; background: #fff !important; color: #000 !important; }
                            .print-report-header-gradient { background: #fff !important; }
                            .print-report-header-row { border-bottom: 2px solid #000 !important; }
                            .print-report-table th { background: #f0f0f0 !important; border-bottom: 1px solid #ccc !important; font-weight: bold !important; color: #000 !important; }
                            .print-report-table td { border-bottom: 1px solid #ddd !important; color: #000 !important; }
                            .print-report-table tr:hover { background: transparent !important; }
                            .print-report-footer { display: none !important; }
                            .print-report-icon { display: none !important; }
                        }
                    `}</style>
                    <div id="print-report" className="print-report-panel fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowReportModal(null)}>
                        <div className="print-report-inner bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-purple-900 flex items-center gap-2">
                                    {reportData.type === 'pl' && (
                                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                                    )}
                                    {reportData.type === 'cashflow' && (
                                        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                                    )}
                                    {reportData.type === 'pl' ? 'Laporan Laba Rugi Bulanan' : reportData.type === 'cashflow' ? 'Laporan Arus Kas Bulanan' : 'Laporan Keuangan Bank'}
                                </h3>
                                <div className="flex gap-2">
                                    <button onClick={() => window.print()} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2h6zM12 12v6m0 0l3-3m-3 3l-3-3"/></svg>
                                        Cetak / PDF
                                    </button>
                                    <button onClick={handleExportMarkdown} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                                        Markdown
                                    </button>
                                    <button onClick={() => setShowReportModal(null)} className="px-4 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors">Tutup</button>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 print:p-0 print:max-w-none print:h-screen print:overflow-visible">
                            <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white p-8 rounded-2xl print:rounded-none print:shadow-none print:text-black print:bg-white print:border print:border-slate-200">
                                <div className="flex justify-between items-start mb-8 print:flex-print">
                                    <div>
                                        <h2 className="text-2xl font-bold mb-2">Laporan Keuangan: {reportData.type === 'pl' ? 'Laba Rugi' : reportData.type === 'cashflow' ? 'Arus Kas' : 'Bank'}</h2>
                                        <p className="text-purple-200 print:text-slate-600">Periode: {periodeFilter === 'custom' ? `${customStart} s/d ${customEnd}` : periodeFilter === 'hari_ini' ? 'Hari Ini' : periodeFilter === 'minggu_ini' ? 'Minggu Ini' : periodeFilter === 'bulan_ini' ? 'Bulan Ini' : 'Semua Waktu'}</p>
                                        <p className="text-purple-300 text-sm mt-1 print:text-slate-500">Dicetak pada: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                    <div className="text-right print:text-left">
                                        <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center print:w-16 print:h-16 print:bg-slate-100">
                                            <svg className="w-12 h-12 text-white print:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547L6.380 10.6A2 2 0 004 10v10a2 2 0 002 2h10a2 2 0 002-2v-4.586a2 2 0 00-.471-1.022M12 2.586a2 2 0 112.828 2.828L6.364 7.64a2 2 0 01-1.02 1.02L2.586 12 12 2.586z"/></svg>
                                        </div>
                                        <h3 className="text-lg font-bold mt-2">Toko Berkah Jaya</h3>
                                    </div>
                                </div>

                                {reportData.type === 'pl' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
                                        <div className="bg-white/10 p-6 rounded-2xl print:bg-slate-50 print:border print:border-slate-200">
                                            <h4 className="text-lg font-semibold mb-4 text-purple-200 print:text-slate-700">Ringkasan Pendapatan</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between py-2 border-b border-white/10 print:border-slate-200">
                                                    <span className="text-purple-300 print:text-slate-600">Total Pemasukan</span>
                                                    <span className="font-bold text-emerald-400 print:text-emerald-600">{formatRupiah(reportData.totalPemasukan)}</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-white/10 print:border-slate-200">
                                                    <span className="text-purple-300 print:text-slate-600">Total Pengeluaran</span>
                                                    <span className="font-bold text-rose-400 print:text-rose-600">{formatRupiah(reportData.totalPengeluaran)}</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-white/10 print:border-slate-200">
                                                    <span className="text-purple-300 print:text-slate-600">Laba Kotor</span>
                                                    <span className="font-bold text-white print:text-slate-900">{formatRupiah(reportData.totalPemasukan - reportData.totalPengeluaran)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white/10 p-6 rounded-2xl print:bg-slate-50 print:border print:border-slate-200">
                                            <h4 className="text-lg font-semibold mb-4 text-purple-200 print:text-slate-700">Kategori Transaksi</h4>
                                            <div className="space-y-2 max-h-64 overflow-auto print:max-h-none">
                                                {(() => {
                                                    const pemasukan = reportData.filtered.filter(t => t.jenis_transaksi === 'Pemasukan');
                                                    const pengeluaran = reportData.filtered.filter(t => t.jenis_transaksi === 'Pengeluaran');
                                                    const kategoriMap = {};
                                                    pemasukan.concat(pengeluaran).forEach(t => {
                                                        if (!kategoriMap[t.kategori]) kategoriMap[t.kategori] = { pemasukan: 0, pengeluaran: 0 };
                                                        if (t.jenis_transaksi === 'Pemasukan') kategoriMap[t.kategori].pemasukan += parseFloat(String(t.nominal).replace(/\\D/g, '') || 0);
                                                        else kategoriMap[t.kategori].pengeluaran += parseFloat(String(t.nominal).replace(/\\D/g, '') || 0);
                                                    });
                                                    return Object.entries(kategoriMap).map(([kat, val]) => (
                                                        <div key={kat} className="flex justify-between py-1 print:flex-print">
                                                            <span className="text-purple-300 text-sm print:text-slate-600 truncate pr-2">{kat}</span>
                                                            <span className="text-xs print:text-xs">Pemasukan: {formatRupiah(val.pemasukan)} | Pengeluaran: {formatRupiah(val.pengeluaran)}</span>
                                                        </div>
                                                    ));
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {reportData.type === 'cashflow' && (
                                    <div className="space-y-6 print:grid-cols-1">
                                        <div className="bg-white/10 p-6 rounded-2xl print:bg-slate-50 print:border print:border-slate-200">
                                            <h4 className="text-lg font-semibold mb-4 text-purple-200 print:text-slate-700">Ringkasan Arus Kas</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="text-center print:text-left">
                                                    <p className="text-purple-300 text-sm print:text-slate-600">Total Kas Masuk</p>
                                                    <p className="text-2xl font-bold text-emerald-400 print:text-emerald-600">{formatRupiah(reportData.totalPemasukan)}</p>
                                                </div>
                                                <div className="text-center print:text-left">
                                                    <p className="text-purple-300 text-sm print:text-slate-600">Total Kas Keluar</p>
                                                    <p className="text-2xl font-bold text-rose-400 print:text-rose-600">{formatRupiah(reportData.totalPengeluaran)}</p>
                                                </div>
                                                <div className="text-center print:text-left">
                                                    <p className="text-purple-300 text-sm print:text-slate-600">Saldo Akhir</p>
                                                    <p className="text-2xl font-bold text-white print:text-slate-900">{formatRupiah(reportData.totalPemasukan - reportData.totalPengeluaran)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-8 print:mt-4">
                                    <h4 className="text-lg font-semibold mb-4 text-purple-200 print:text-slate-700">Detail Transaksi</h4>
                                    <div className="overflow-x-auto print:overflow-visible">
                                        <table className="w-full text-sm print:text-xs">
                                            <thead className="print:table-header-group">
                                                <tr className="border-b border-white/20 print:border-slate-300">
                                                    <th className="py-2 text-left text-purple-300 print:text-slate-700">Tanggal</th>
                                                    <th className="py-2 text-left text-purple-300 print:text-slate-700">Sumber</th>
                                                    <th className="py-2 text-left text-purple-300 print:text-slate-700">Keterangan</th>
                                                    <th className="py-2 text-left text-purple-300 print:text-slate-700">Jenis</th>
                                                    <th className="py-2 text-right text-purple-300 print:text-slate-700">Nominal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="print:table-row-group">
                                                {reportData.filtered.map((t) => (
                                                    <tr key={t.id} className="border-b border-white/5 print:border-slate-200">
                                                        <td className="py-2 text-white print:text-slate-900">{t.tanggal}</td>
                                                        <td className="py-2 text-purple-200 print:text-slate-700">{t.sumber_kas}</td>
                                                        <td className="py-2 text-purple-200 print:text-slate-700">{t.keterangan}</td>
                                                        <td className="py-2 text-purple-200 print:text-slate-700">{t.jenis_transaksi}</td>
                                                        <td className="py-2 text-right font-bold text-white print:text-slate-900">{t.jenis_transaksi === 'Pemasukan' ? '+' : '-'} {formatRupiah(t.nominal)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="mt-8 p-6 bg-gradient-to-r from-purple-800 to-indigo-900 rounded-2xl text-white print:hidden">
                                    <p className="text-center text-purple-200">Laporan Keuangan ini dihasilkan oleh UMKM Pro AI • Untuk keperluan pengajuan pinjaman bank, kontak admin untuk format PDF resmi</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>
                </>
            )}
        </div>
    );
}