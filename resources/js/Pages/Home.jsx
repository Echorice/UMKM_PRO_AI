import React from 'react';
import { usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import DashboardView from '@/Components/Organisms/Dashboard';
import AnalisisAI from '@/Components/Organisms/AnalisisAI';
import BukuKas from '@/Components/Organisms/BukuKas';
import ManajemenStok from '@/Components/Organisms/ManajemenStok';

export default function Home() {
    const { props } = usePage();
    const activeTab = props.activeTab || 'dashboard';

    return (
        <DashboardLayout>
            <div className="p-8 max-w-7xl mx-auto">
                <div className="animate-fade-in">
                    {activeTab === 'dashboard' && <DashboardView />}
                    {activeTab === 'analisisAI' && <AnalisisAI />}
                    {activeTab === 'bukuKas' && <BukuKas />}
                    {activeTab === 'manajemenStok' && <ManajemenStok />}
                </div>
            </div>
        </DashboardLayout>
    );
}