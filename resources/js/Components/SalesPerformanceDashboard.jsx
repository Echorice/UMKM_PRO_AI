import React from 'react';

const SalesPerformanceDashboard = ({ data }) => {
    // Formatters
    const fmt = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
    const num = (val) => new Intl.NumberFormat('id-ID').format(val || 0);

    const kpi = data?.kpi || { total_revenue: 0, total_orders: 0, quantity_sold: 0, avg_order_value: 0 };
    const health = data?.health_metrics || {};

    return (
        <section className="mb-10 animate-fade-in" aria-labelledby="sales-dashboard-title">
            <div className="flex items-center justify-between mb-6">
                <h2 id="sales-dashboard-title" className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
                    <svg className="w-7 h-7 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                    Sales Performance Dashboard
                </h2>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg font-bold text-[10px] uppercase">Real-time Data Active</span>
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" role="list" aria-label="Key Performance Indicators">
                <article className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform"><svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/></svg></div>
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</p>
                        <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{fmt(kpi.total_revenue)}</h3>
                    </div>
                </article>
                <article className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform"><svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a2 2 0 00-2-2H6a2 2 0 00-2 2v16a2 2 0 002 2h8"/></svg></div>
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Orders</p>
                        <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{num(kpi.total_orders)}</h3>
                    </div>
                </article>
                <article className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform"><svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg></div>
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quantity Sold</p>
                        <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{num(kpi.quantity_sold)}</h3>
                    </div>
                </article>
                <article className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform"><svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1"/></svg></div>
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Order Value</p>
                        <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{fmt(kpi.avg_order_value)}</h3>
                    </div>
                </article>
            </div>

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
                {/* Sales by Category (Donut) */}
                <div className="lg:col-span-5 bg-white rounded-2xl p-5 shadow-card border border-slate-100">
                    <h3 className="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/></svg>
                        Sales by Category
                    </h3>
                    <div className="flex flex-col items-center">
                        <div className="relative w-52 h-52 flex items-center justify-center my-2">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <path className="text-slate-100" strokeWidth="4.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path strokeWidth="4.5" strokeDasharray="100 0" strokeDashoffset="0" stroke="#581c87" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                                <span className="text-lg font-extrabold text-slate-900 leading-tight">{fmt(kpi.total_revenue)}</span>
                                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-1">Total Rev</span>
                            </div>
                        </div>
                        <div className="w-full mt-2 pt-3 border-t border-slate-100">
                            {data?.by_category?.map((c, i) => (
                                <div key={i} className="flex items-center gap-2 text-[10px] mb-1.5 last:mb-0">
                                    <span className="w-2 h-2 rounded-full bg-purple-700"></span>
                                    <span className="text-slate-600 truncate">{c.kategori}</span>
                                    <span className="ml-auto font-bold text-slate-900">{fmt(c.total)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top Products - Placeholder/Static for now as API returns minimal */}
                <div className="lg:col-span-4 bg-white rounded-2xl p-5 shadow-card border border-slate-100">
                    <h3 className="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                        Performance Overview
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Avg Transaction</p>
                            <h4 className="text-lg font-extrabold text-slate-900">{fmt(kpi.avg_order_value)}</h4>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Total Items Sold</p>
                            <h4 className="text-lg font-extrabold text-slate-900">{num(kpi.quantity_sold)} units</h4>
                        </div>
                    </div>
                </div>

                {/* Performance Metrics List */}
                <div className="lg:col-span-3 bg-white rounded-2xl p-5 shadow-card border border-slate-100">
                    <h3 className="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3" stroke-width="2"/></svg>
                        Financial Health
                    </h3>
                    <div className="space-y-3 text-xs">
                        <div className="flex justify-between items-center"><span className="text-slate-500">Current Ratio</span><span className="font-bold text-emerald-600">{health.current_ratio}x</span></div>
                        <div className="flex justify-between items-center"><span className="text-slate-500">Debt/Equity</span><span className="font-bold text-amber-600">{health.debt_equity_ratio}x</span></div>
                        <div className="flex justify-between items-center"><span className="text-slate-500">ROA</span><span className="font-bold text-blue-600">{health.return_on_assets}%</span></div>
                        <div className="flex justify-between items-center"><span className="text-slate-500">Net Profit</span><span className="font-bold text-purple-600">{health.net_profit_margin}%</span></div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-50"><span className="text-slate-400 text-[10px]">Growth</span><span className="font-bold text-rose-500">+{health.growth_rate}%</span></div>
                    </div>
                </div>
            </div>

            {/* Health Metrics Detail Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                {/* Capital Structure */}
                <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100">
                    <h3 className="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M17 9h-3m0 0v3m0-3h3m-3 0H8"/></svg>
                        Capital Structure
                    </h3>
                    <div className="flex flex-col items-center">
                        <div className="relative w-40 h-40 flex items-center justify-center my-2">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <path className="text-slate-100" strokeWidth="6" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path strokeWidth="6" strokeDasharray="68 32" strokeDashoffset="0" stroke="#10b981" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path strokeWidth="6" strokeDasharray="32 68" strokeDashoffset="-68" stroke="#ef4444" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <span className="text-lg font-extrabold text-slate-900">DER {health.debt_equity_ratio}x</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 w-full mt-2 text-[10px]">
                            <div className="flex items-center gap-1.5 p-1.5 bg-emerald-50 rounded-lg"><span className="w-2 h-2 rounded-full bg-emerald-500"></span><span className="text-emerald-700 font-bold">Equity 68%</span></div>
                            <div className="flex items-center gap-1.5 p-1.5 bg-rose-50 rounded-lg"><span className="w-2 h-2 rounded-full bg-rose-500"></span><span className="text-rose-700 font-bold">Debt 32%</span></div>
                        </div>
                    </div>
                </div>

                {/* Performance Metrics Histogram */}
                <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100">
                    <h3 className="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                        Performance Metrics
                    </h3>
                    <div className="space-y-2.5">
                        {[
                            { l: 'CR', v: `${health.current_ratio}x`, p: 93, c: 'bg-emerald-500' },
                            { l: 'ROA', v: `${health.return_on_assets}%`, p: 78, c: 'bg-blue-500' },
                            { l: 'DER', v: `${health.debt_equity_ratio}x`, p: 65, c: 'bg-amber-500' },
                            { l: 'NPM', v: `${health.net_profit_margin}%`, p: 85, c: 'bg-purple-500' },
                            { l: 'TAT', v: `${health.total_asset_turnover}x`, p: 70, c: 'bg-cyan-500' },
                            { l: 'Growth', v: `${health.growth_rate}%`, p: 90, c: 'bg-rose-500' },
                        ].map((m, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-[10px] mb-1"><span className="font-semibold text-slate-500">{m.l}</span><span className="font-bold text-slate-900">{m.v}</span></div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className={`h-full rounded-full ${m.c}`} style={{width: `${m.p}%`}}></div></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Customer Health Footer */}
            <div className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden">
                <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <div className="text-center">
                        <p className="text-[10px] text-purple-200 uppercase font-bold mb-1">Customers</p>
                        <h5 className="text-xl font-extrabold">{num(health.total_customers)}</h5>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] text-purple-200 uppercase font-bold mb-1">Returning</p>
                        <h5 className="text-xl font-extrabold">{health.returning_rate}%</h5>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] text-purple-200 uppercase font-bold mb-1">Return Rate</p>
                        <h5 className="text-xl font-extrabold text-amber-300">{health.return_rate}%</h5>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] text-purple-200 uppercase font-bold mb-1">Margin</p>
                        <h5 className="text-xl font-extrabold text-emerald-300">{health.margin}%</h5>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SalesPerformanceDashboard;