import React from 'react';
import { usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import DashboardView from '@/Components/Views/Dashboard';
import AnalisisAI from '@/Components/Views/AnalisisAI';
import BukuKas from '@/Components/Views/BukuKas';

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
                </div>
            </div>
        </DashboardLayout>
    );
}