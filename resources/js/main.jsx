import React from 'react';
import { createRoot } from 'react-dom/client';
import Home from './Pages/Home';
import BukuKas from './Pages/BukuKas';
import DashboardLayout from './Layouts/DashboardLayout';

function AppRouter() {
    const path = window.location.pathname;

    let CurrentPage = Home;
    if (path.includes('/buku-kas')) {
        CurrentPage = BukuKas;
    }

    const el = document.getElementById('app');
    const pageData = el && el.dataset.page ? JSON.parse(el.dataset.page) : {};
    const props = pageData.props || {};

    return (
        <DashboardLayout>
            <CurrentPage {...props} />
        </DashboardLayout>
    );
}

const container = document.getElementById('app');
if (container) {
    // Menyimpan root di dalam properti DOM agar tidak terpanggil ganda
    if (!container._reactRoot) {
        container._reactRoot = createRoot(container);
    }
    container._reactRoot.render(<AppRouter />);
}