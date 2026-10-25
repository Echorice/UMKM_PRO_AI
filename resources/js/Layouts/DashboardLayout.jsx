import React from 'react';

export default function DashboardLayout({ children }) {
    // Membaca URL aktif secara mandiri tanpa memicu error Inertia
    const currentPath = window.location.pathname;

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* SIDEBAR */}
            <aside className="w-64 bg-purple-900 text-white flex flex-col justify-between p-6 shadow-xl">
                <div>
                    <div className="mb-10">
                        <h1 className="text-2xl font-black tracking-wider text-purple-100">UMKMPro</h1>
                        <p className="text-xs text-purple-300 mt-1">Smart Financial AI</p>
                    </div>

                    <nav className="space-y-2">
                        <a
                            href="/"
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                                currentPath === '/'
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'text-purple-200 hover:bg-purple-800'
                            }`}
                        >
                            <span>📊</span> Analisis AI
                        </a>

                        <a
                            href="/buku-kas"
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                                currentPath === '/buku-kas'
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'text-purple-200 hover:bg-purple-800'
                            }`}
                        >
                            <span>💰</span> Buku Kas Harian
                        </a>
                    </nav>
                </div>

                <div className="text-xs text-purple-400 text-center border-t border-purple-800 pt-4">
                    © 2026 UMKM Pro
                </div>
            </aside>

            {/* KONTEN UTAMA */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}