import React, { useState, useEffect } from 'react';

export default function DashboardView() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_BASE = import.meta.env.VITE_API_URL || '/api';

    const fetchDashboard = async () => {
        try {
            const response = await fetch(`${API_BASE}/dashboard-performance`);
            if (response.ok) {
                const data = await response.json();
                setDashboardData(data);
            }
        } catch (error) {
            console.error('Gagal fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fmt = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
    const fmtShort = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0, notation: 'compact' }).format(val || 0);
    const num = (val) => new Intl.NumberFormat('id-ID').format(val || 0);

    const kpi = dashboardData?.kpi || { total_revenue: 36200000, total_orders: 2000, quantity_sold: 7552, avg_order_value: 18100 };
    const health = dashboardData?.health_metrics || {
        total_cash: 84500000,
        total_revenue: 127800000,
        total_expenses: 43300000,
        current_ratio: 2.8,
        debt_equity_ratio: 0.47,
        return_on_assets: 12.4,
        net_profit_margin: 18.7,
        growth_rate: 23.5,
        total_customers: 1450,
        returning_rate: 65,
        return_rate: 4.8
    };
    const apiByCategory = dashboardData?.by_category;
    const isProductCategoryData = apiByCategory && apiByCategory.length > 0 && 
        apiByCategory.some(c => ['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty', 'Others'].includes(c.kategori));
    
    const byCategory = isProductCategoryData ? apiByCategory : [
        { kategori: 'Electronics', total: 12724400, pct: 35.2, color: '#581c87' },
        { kategori: 'Fashion', total: 9066200, pct: 25.1, color: '#7e22ce' },
        { kategori: 'Home & Kitchen', total: 7348600, pct: 20.3, color: '#9333ea' },
        { kategori: 'Beauty', total: 4488800, pct: 12.4, color: '#c084fc' },
        { kategori: 'Others', total: 2534000, pct: 7.0, color: '#e9d5ff' }
    ];
    const topProducts = [
        { name: 'Wireless Earbuds Pro', category: 'Electronics', sku: 'WEP-001', units: '1,850' },
        { name: 'Premium Denim Jacket', category: 'Fashion', sku: 'PDJ-002', units: '1,450' },
        { name: 'Smart Home Hub', category: 'Electronics', sku: 'SHH-003', units: '1,200' },
        { name: 'Organic Skincare Set', category: 'Beauty', sku: 'OSS-004', units: '1,100' },
        { name: 'Ergonomic Office Chair', category: 'Home & Kitchen', sku: 'EOC-005', units: '950' }
    ];
    const regionalRevenue = [
        { region: 'West', revenue: 'Rp 68.700.000', growth: '+14.2%' },
        { region: 'East', revenue: 'Rp 61.200.000', growth: '+11.8%' },
        { region: 'North', revenue: 'Rp 58.400.000', growth: '+9.5%' },
        { region: 'South', revenue: 'Rp 47.800.000', growth: '+7.3%' },
        { region: 'Central', revenue: 'Rp 34.200.000', growth: '+5.1%' }
    ];
    const transactions = dashboardData?.transactions || [
        { id: 1, tanggal: '2026-11-03', jenis: 'Pemasukan', kategori: 'Modal Awal', keterangan: 'Modal Awal Usaha', jumlah: 27000000 },
        { id: 2, tanggal: '2026-11-03', jenis: 'Pengeluaran', kategori: 'Bahan Baku', keterangan: 'Beli daging', jumlah: 3500000 },
        { id: 3, tanggal: '2026-11-03', jenis: 'Pengeluaran', kategori: 'Bahan Baku', keterangan: 'Beli kulit lumpia', jumlah: 2100000 },
        { id: 4, tanggal: '2026-11-03', jenis: 'Pengeluaran', kategori: 'Bahan Baku', keterangan: 'Beli telur', jumlah: 1994000 },
        { id: 5, tanggal: '2026-11-03', jenis: 'Pemasukan', kategori: 'Penjualan', keterangan: 'Penjualan harian', jumlah: 9200000 }
    ];

    const categoryColors = ['#581c87', '#7e22ce', '#9333ea', '#a855f7', '#c084fc'];
    const totalCategoryRevenue = byCategory.reduce((sum, c) => sum + (c.total || 0), 0) || 1;
    let cumulativeOffset = 0;
    const pieSegments = byCategory.map((c, i) => {
        const pct = c.pct || ((c.total || 0) / totalCategoryRevenue * 100);
        const dashArray = `${Number(pct).toFixed(1)} ${(100 - Number(pct)).toFixed(1)}`;
        const dashOffset = `-${cumulativeOffset.toFixed(1)}`;
        cumulativeOffset += Number(pct);
        return { ...c, pct: Number(pct).toFixed(1), dashArray, dashOffset, color: c.color || categoryColors[i % categoryColors.length] };
    });

    return (
        <div className="bg-slate-50 min-h-screen p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* ===== 1. HEADER: UMKM NAME + ML ANALYSIS ===== */}
                <div className="animate-slideUp bg-white rounded-3xl shadow-card border border-slate-100 p-6 md:p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl"></div>
                    <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-700 to-purple-900 flex items-center justify-center shadow-lg text-white">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                                    {dashboardData?.umkm?.nama_umkm || 'Toko Berkah Jaya'}
                                </h1>
                                <p className="text-slate-500 mt-1">
                                    UMKM Kuliner • Terdaftar: 12 Mar 2023 • ID: {dashboardData?.umkm?.id_umkm || 'UMKM-7842'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="px-4 py-2.5 bg-purple-100 text-purple-700 rounded-xl font-bold text-sm flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                AI Analysis: Optimal
                            </div>
                        </div>
                    </div>

                    {/* ML Analysis Insights Row */}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Profitability Score</p>
                                    <p className="text-xl font-black text-emerald-700">87/100</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">NPM {health.net_profit_margin}% • ROA {health.return_on_assets}% • Above industry avg</p>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg></div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Liquidity Score</p>
                                    <p className="text-xl font-black text-blue-700">92/100</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Current Ratio {health.current_ratio}x • Healthy cash position</p>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Leverage Score</p>
                                    <p className="text-xl font-black text-amber-700">68/100</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">DER {health.debt_equity_ratio}x • Moderate debt level</p>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg></div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Efficiency Score</p>
                                    <p className="text-xl font-black text-purple-700">79/100</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">TAT 1.3x • Rev Growth {health.growth_rate}% YoY</p>
                        </div>
                    </div>
                </div>

                {/* ===== 2. FINANCIAL SUMMARY CARDS ===== */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5" role="region" aria-label="Ringkasan Kas Buku Kas">
                    <div className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden text-white">
                        <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                        <div className="relative flex items-start justify-between">
                            <div>
                                <p className="text-purple-200 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                    Total Saldo Kas
                                </p>
                                <h2 className="text-3xl md:text-4xl font-black tracking-tight">{fmt(health.total_cash)}</h2>
                                <p className="text-purple-200 text-xs mt-2 font-medium">+12.3% vs bulan lalu</p>
                            </div>
                            <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/></svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-card border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-4 right-4 w-24 h-24 bg-emerald-100 rounded-full blur-xl"></div>
                        <div className="relative flex items-start justify-between">
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                                    Total Pemasukan
                                </p>
                                <h2 className="text-3xl md:text-4xl font-black text-emerald-700">{fmt(health.total_revenue)}</h2>
                                <p className="text-emerald-600 text-xs mt-2 font-bold">+18.7% vs bulan lalu</p>
                            </div>
                            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
                                <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-card border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-4 right-4 w-24 h-24 bg-rose-100 rounded-full blur-xl"></div>
                        <div className="relative flex items-start justify-between">
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                    Total Pengeluaran
                                </p>
                                <h2 className="text-3xl md:text-4xl font-black text-rose-700">{fmt(health.total_expenses)}</h2>
                                <p className="text-rose-600 text-xs mt-2 font-bold">-5.2% vs bulan lalu</p>
                            </div>
                            <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center">
                                <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== 3. SALES PERFORMANCE DASHBOARD ===== */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                            <svg className="w-7 h-7 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                            Sales Performance Dashboard
                        </h2>
                    </div>

                    {/* KPI Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <article className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 group-hover:scale-110 transition-transform"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/></svg></div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
                                <h3 className="text-xl font-black text-slate-900 mt-0.5">{fmtShort(kpi.total_revenue)}</h3>
                            </div>
                        </article>
                        <article className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a2 2 0 00-2-2H6a2 2 0 00-2 2v16a2 2 0 002 2h8"/></svg></div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</p>
                                <h3 className="text-xl font-black text-slate-900 mt-0.5">{num(kpi.total_orders)}</h3>
                            </div>
                        </article>
                        <article className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg></div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quantity Sold</p>
                                <h3 className="text-xl font-black text-slate-900 mt-0.5">{num(kpi.quantity_sold)}</h3>
                            </div>
                        </article>
                        <article className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1"/></svg></div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Order Value</p>
                                <h3 className="text-xl font-black text-slate-900 mt-0.5">{fmtShort(kpi.avg_order_value)}</h3>
                            </div>
                        </article>
                    </div>

                    {/* Charts Grid: Sales by Category (Pie, span-3), Top 5 Products (span-4), Regional Revenue (span-5) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        {/* Sales by Category (CSS conic-gradient donut chart, perfectly rounded) */}
                        <div className="lg:col-span-3 bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/></svg>
                                    Sales by Category
                                </h3>
                            </div>
                            <div className="flex flex-col items-center my-auto">
                                <div className="relative w-36 h-36 flex items-center justify-center my-2">
                                    <div 
                                        className="w-32 h-32 rounded-full shadow-inner"
                                        style={{
                                            background: `conic-gradient(
                                                #581c87 0deg ${byCategory[0].pct * 3.6}deg,
                                                #7e22ce ${byCategory[0].pct * 3.6}deg ${(byCategory[0].pct + byCategory[1].pct) * 3.6}deg,
                                                #9333ea ${(byCategory[0].pct + byCategory[1].pct) * 3.6}deg ${(byCategory[0].pct + byCategory[1].pct + byCategory[2].pct) * 3.6}deg,
                                                #c084fc ${(byCategory[0].pct + byCategory[1].pct + byCategory[2].pct) * 3.6}deg ${(byCategory[0].pct + byCategory[1].pct + byCategory[2].pct + byCategory[3].pct) * 3.6}deg,
                                                #e9d5ff ${(byCategory[0].pct + byCategory[1].pct + byCategory[2].pct + byCategory[3].pct) * 3.6}deg 360deg
                                            )`
                                        }}
                                    ></div>
                                    <div className="absolute inset-8 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                                        <span className="text-xs font-black text-slate-800">Category</span>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Share</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-1.5 w-full mt-3 pt-3 border-t border-slate-100 text-xs">
                                    {byCategory.map((seg, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full shrink-0" style={{ background: seg.color }}></span>
                                            <span className="text-slate-600 font-medium truncate">{seg.kategori}</span>
                                            <span className="ml-auto font-bold text-slate-900">{seg.pct}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Top 5 Products (Expanded to span-4) */}
                        <div className="lg:col-span-4 bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                                    Top 5 Produk
                                </h3>
                            </div>
                            <div className="space-y-4 my-auto">
                                {topProducts.map((p, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 font-black text-xs shrink-0">{i + 1}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-900 text-xs truncate">{p.name}</p>
                                            <p className="text-[11px] text-slate-400">{p.category} • SKU: {p.sku}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="font-black text-slate-900 text-xs">{p.units}</p>
                                            <p className="text-[10px] text-emerald-600 font-semibold">porsi</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Regional Revenue (Expanded to span-5) */}
                        <div className="lg:col-span-5 bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3" strokeWidth="2"/></svg>
                                    Revenue per Wilayah
                                </h3>
                            </div>
                            <div className="overflow-x-auto my-auto">
                                <table className="w-full text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider">
                                            <th className="py-3 px-3 text-left font-bold">Wilayah</th>
                                            <th className="py-3 px-3 text-right font-bold">Revenue</th>
                                            <th className="py-3 px-3 text-right font-bold">Growth</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {regionalRevenue.map((r, i) => (
                                            <tr key={i} className="hover:bg-slate-50">
                                                <td className="py-3 px-3 font-bold text-slate-800 flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>{r.region}</td>
                                                <td className="py-3 px-3 text-right font-black text-slate-900">{r.revenue}</td>
                                                <td className="py-3 px-3 text-right text-emerald-600 font-bold">{r.growth}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ===== 4. CAPITAL STRUCTURE + HEALTH METRICS RADAR ===== */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Capital Structure (Perfect Circle Chart with overflow-visible to prevent clipping) */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                        <h3 className="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M17 9h-3m0 0v3m0-3h3m-3 0H8"/></svg>
                            Capital Structure
                        </h3>
                        <div className="flex flex-col items-center">
                            <div className="relative w-48 h-48 flex items-center justify-center my-2 p-2">
                                <svg className="w-full h-full -rotate-90 overflow-visible" viewBox="0 0 36 36">
                                    <path className="text-slate-100" strokeWidth="6" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    <path strokeWidth="6" strokeDasharray="68 32" strokeDashoffset="0" stroke="#10b981" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    <path strokeWidth="6" strokeDasharray="32 68" strokeDashoffset="-68" stroke="#ef4444" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <span className="text-xl font-black text-slate-900">DER {health.debt_equity_ratio}x</span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Debt-to-Equity</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 w-full mt-2 pt-3 border-t border-slate-100 text-xs">
                                <div className="flex items-center gap-2 p-2.5 bg-emerald-50 rounded-xl"><span className="w-3 h-3 rounded-full bg-emerald-500"></span><div><p className="font-bold text-emerald-700">Equity</p><p className="text-[11px] text-emerald-600">68% • Rp 2.14M</p></div></div>
                                <div className="flex items-center gap-2 p-2.5 bg-rose-50 rounded-xl"><span className="w-3 h-3 rounded-full bg-rose-500"></span><div><p className="font-bold text-rose-700">Debt</p><p className="text-[11px] text-rose-600">32% • Rp 1.01M</p></div></div>
                                <div className="flex items-center gap-2 p-2.5 bg-blue-50 rounded-xl col-span-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span><div><p className="font-bold text-blue-700">Total Assets</p><p className="text-[11px] text-blue-600">Rp 3.15M</p></div></div>
                            </div>
                        </div>
                    </div>

                    {/* Health Metrics Radar */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                        <h3 className="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                            Health Metrics Radar
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs mb-1"><span className="font-semibold text-slate-700">Current Ratio (CR)</span><span className="font-bold text-emerald-600">2.8x</span></div>
                                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden"><div className="h-full rounded-full bg-emerald-500" style={{ width: '93%' }}></div></div>
                                <p className="text-[10px] text-slate-400 mt-0.5">Target: &gt;2.0x • Excellent liquidity</p>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-1"><span className="font-semibold text-slate-700">Return on Assets (ROA)</span><span className="font-bold text-blue-600">12.4%</span></div>
                                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden"><div className="h-full rounded-full bg-blue-500" style={{ width: '78%' }}></div></div>
                                <p className="text-[10px] text-slate-400 mt-0.5">Target: &gt;10% • Above industry avg</p>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-1"><span className="font-semibold text-slate-700">Debt to Equity (DER)</span><span className="font-bold text-amber-600">0.47x</span></div>
                                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden"><div className="h-full rounded-full bg-amber-500" style={{ width: '65%' }}></div></div>
                                <p className="text-[10px] text-slate-400 mt-0.5">Target: &lt;0.5x • Moderate leverage</p>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-1"><span className="font-semibold text-slate-700">Net Profit Margin (NPM)</span><span className="font-bold text-purple-600">18.7%</span></div>
                                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden"><div className="h-full rounded-full bg-purple-500" style={{ width: '85%' }}></div></div>
                                <p className="text-[10px] text-slate-400 mt-0.5">Target: &gt;15% • Strong profitability</p>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-1"><span className="font-semibold text-slate-700">Total Asset Turnover (TAT)</span><span className="font-bold text-cyan-600">1.3x</span></div>
                                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden"><div className="h-full rounded-full bg-cyan-500" style={{ width: '70%' }}></div></div>
                                <p className="text-[10px] text-slate-400 mt-0.5">Target: &gt;1.0x • Good efficiency</p>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-1"><span className="font-semibold text-slate-700">Revenue Growth (YoY)</span><span className="font-bold text-rose-600">23.5%</span></div>
                                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden"><div className="h-full rounded-full bg-rose-500" style={{ width: '90%' }}></div></div>
                                <p className="text-[10px] text-slate-400 mt-0.5">Target: &gt;15% • High growth</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== 5. CUSTOMER HEALTH METRICS ===== */}
                <div className="bg-gradient-to-br from-purple-700 via-purple-800 to-purple-950 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden text-white">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-200 mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
                        Customer Health Metrics
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
                        <div className="bg-white/10 p-4 rounded-2xl border border-white/20 backdrop-blur-sm text-center relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg></div>
                            <p className="text-[11px] text-purple-200 uppercase font-medium mb-1 mt-1">Total Customers</p>
                            <h5 className="text-xl font-black">1,450</h5>
                            <p className="text-[10px] text-emerald-300 mt-1">+12.4% vs last quarter</p>
                        </div>
                        <div className="bg-white/10 p-4 rounded-2xl border border-white/20 backdrop-blur-sm text-center relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg></div>
                            <p className="text-[11px] text-purple-200 uppercase font-medium mb-1 mt-1">Return Rate</p>
                            <h5 className="text-xl font-black">65%</h5>
                            <p className="text-[10px] text-emerald-300 mt-1">Industry avg: 42%</p>
                        </div>
                        <div className="bg-white/10 p-4 rounded-2xl border border-white/20 backdrop-blur-sm text-center relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg></div>
                            <p className="text-[11px] text-purple-200 uppercase font-medium mb-1 mt-1">Retention Rate</p>
                            <h5 className="text-xl font-black">4.8%</h5>
                            <p className="text-[10px] text-rose-300 mt-1">Below 5% threshold</p>
                        </div>
                        <div className="bg-white/10 p-4 rounded-2xl border border-white/20 backdrop-blur-sm text-center relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-xl bg-rose-500 flex items-center justify-center text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1"/></svg></div>
                            <p className="text-[11px] text-purple-200 uppercase font-medium mb-1 mt-1">Profit Margin</p>
                            <h5 className="text-xl font-black">18.7%</h5>
                            <p className="text-[10px] text-emerald-300 mt-1">Target: &gt;15%</p>
                        </div>
                    </div>
                </div>

                {/* ===== 6. RIWAYAT TRANSAKSI (PALING BAWAH) ===== */}
                <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
                                Riwayat Transaksi Terbaru
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">Daftar transaksi kas masuk dan kas keluar dari Buku Kas Harian</p>
                        </div>
                        <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">
                            {transactions.length} Transaksi
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 uppercase text-xs tracking-wider">
                                    <th className="py-3 px-4 font-bold">Tanggal</th>
                                    <th className="py-3 px-4 font-bold">Jenis</th>
                                    <th className="py-3 px-4 font-bold">Kategori</th>
                                    <th className="py-3 px-4 font-bold">Keterangan</th>
                                    <th className="py-3 px-4 font-bold text-right">Jumlah</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {transactions.map((tx) => (
                                    <tr key={tx.id || Math.random()} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-3.5 px-4 text-slate-600 font-medium">{tx.tanggal}</td>
                                        <td className="py-3.5 px-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${tx.jenis === 'Pemasukan' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                {tx.jenis}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-700 font-bold">{tx.kategori}</td>
                                        <td className="py-3.5 px-4 text-slate-600">{tx.keterangan}</td>
                                        <td className={`py-3.5 px-4 text-right font-black ${tx.jenis === 'Pemasukan' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {tx.jenis === 'Pemasukan' ? '+' : '-'}{fmt(tx.jumlah)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

            </div>
        </div>
    );
}
