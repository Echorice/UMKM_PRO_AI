import React from 'react';

export default function DashboardLayout({ children }) {
    // Membaca URL aktif secara mandiri tanpa memicu error Inertia
    const currentPath = window.location.pathname;

    const icons = {
        dashboard: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m-16.5 0a2.25 2.25 0 00-2.25 2.25v11.25m16.5 0a2.25 2.25 0 012.25-2.25V5.25m-18.75 0v-1.5h1.5m0 0h16.5m0 0h1.5m-1.5 0v1.5M6 16.5h12m-12 0l3-3m0 0l-3-3m3 3l9-9" />
            </svg>
        ),
        analysis: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m-16.5 0a2.25 2.25 0 00-2.25 2.25v11.25m16.5 0a2.25 2.25 0 012.25-2.25V5.25m-18.75 0v-1.5h1.5m0 0h16.5m0 0h1.5m-1.5 0v1.5M9 10.5h.008v.008H9V10.5zm.75 0h.008v.008h-.75V10.5zm.75 0h.008v.008h-.75V10.5zm-.75 1.5h.008v.008H9V12zm.75 0h.008v.008h-.75V12zm.75 0h.008v.008h-.75V12zm-.75 1.5h.008v.008H9V13.5zm.75 0h.008v.008h-.75V13.5zm.75 0h.008v.008h-.75V13.5zM12 3v1.5M12 19.5V21M4.5 12H3M21 12h-1.5M4.93 4.93l1.06 1.06M18.04 18.04l1.06 1.06M3 18.06l1.06-1.06M19.94 4.93l1.06-1.06" />
            </svg>
        ),
        cashbook: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12M3 10h18M3 14h18M12 3a9 9 0 100 18 9 9 0 000-18z" />
            </svg>
        )
    };

    return (
        <div className="flex min-h-screen bg-[#0E0B1D] text-slate-100">
            {/* SIDEBAR */}
            <aside className="w-64 bg-[#2A1E4D] text-white flex flex-col justify-between p-6 shadow-2xl border-r border-[#3A3A52]">
                <div>
                    <div className="mb-10">
                        <h1 className="text-2xl font-black tracking-wider text-[#C9C2E3]">UMKMPro</h1>
                        <p className="text-xs text-[#8B7CC7] mt-1 font-medium">Smart Financial AI</p>
                    </div>

                    <nav className="space-y-2">
                        <a
                            href="/"
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                                currentPath === '/'
                                    ? 'bg-gradient-to-r from-[#5A3B8C] to-[#8B7CC7] text-white shadow-lg'
                                    : 'text-[#C9C2E3] hover:bg-[#5A3B8C]/40 hover:text-white'
                            }`}
                        >
                            {icons.dashboard} Dashboard Utama
                        </a>

                        <a
                            href="/analisis-ai"
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                                currentPath === '/analisis-ai'
                                    ? 'bg-gradient-to-r from-[#5A3B8C] to-[#8B7CC7] text-white shadow-lg'
                                    : 'text-[#C9C2E3] hover:bg-[#5A3B8C]/40 hover:text-white'
                            }`}
                        >
                            {icons.analysis} Analisis AI
                        </a>

                        <a
                            href="/buku-kas"
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                                currentPath === '/buku-kas'
                                    ? 'bg-gradient-to-r from-[#5A3B8C] to-[#8B7CC7] text-white shadow-lg'
                                    : 'text-[#C9C2E3] hover:bg-[#5A3B8C]/40 hover:text-white'
                            }`}
                        >
                            {icons.cashbook} Buku Kas Harian
                        </a>

                        <a
                            href="/manajemen-stok"
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                                currentPath === '/manajemen-stok'
                                    ? 'bg-gradient-to-r from-[#5A3B8C] to-[#8B7CC7] text-white shadow-lg'
                                    : 'text-[#C9C2E3] hover:bg-[#5A3B8C]/40 hover:text-white'
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            Manajemen Stok
                        </a>
                    </nav>
                </div>

                <div className="text-xs text-[#8B7CC7] text-center border-t border-[#3A3A52] pt-4">
                    © 2026 UMKM Pro
                </div>
            </aside>

            {/* KONTEN UTAMA */}
            <main className="flex-1 overflow-y-auto bg-[#0E0B1D]">
                {children}
            </main>
        </div>
    );
}