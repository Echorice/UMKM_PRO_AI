import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import DashboardView from '@/Components/Organisms/Dashboard';
import AnalisisAI from '@/Components/Organisms/AnalisisAI';
import BukuKas from '@/Components/Organisms/BukuKas';
import ManajemenStok from '@/Components/Organisms/ManajemenStok';
import PenilaianWizard from '@/Components/Organisms/PenilaianWizard';
import HasilPenilaian from '@/Components/Organisms/HasilPenilaian';

export default function Home() {
    const { props } = usePage();
    const activeTab = props.activeTab || 'dashboard';

    // Local state to handle wizard completion and switching to result view seamlessly if needed
    const [assessmentResult, setAssessmentResult] = useState(null);
    const [assessmentData, setAssessmentData] = useState(null);

    const handleWizardComplete = (result, formData) => {
        setAssessmentResult(result);
        setAssessmentData(formData);
    };

    const currentPath = window.location.pathname;

    return (
        <DashboardLayout>
            <div className="min-h-screen">
                <div className="animate-fade-in">
                    {currentPath === '/penilaian-baru' ? (
                        assessmentResult ? (
                            <HasilPenilaian 
                                result={assessmentResult} 
                                formData={assessmentData} 
                                onReset={() => { setAssessmentResult(null); setAssessmentData(null); }} 
                            />
                        ) : (
                            <PenilaianWizard onComplete={handleWizardComplete} />
                        )
                    ) : currentPath === '/hasil-penilaian' ? (
                        assessmentResult ? (
                            <HasilPenilaian 
                                result={assessmentResult} 
                                formData={assessmentData} 
                                onReset={() => { setAssessmentResult(null); setAssessmentData(null); }} 
                            />
                        ) : (
                            <div className="p-12 text-center text-[#C9C2E3]">
                                <h2 className="text-2xl font-bold text-white mb-2">Belum Ada Data Penilaian</h2>
                                <p className="text-sm mb-6">Silakan lakukan penilaian kesehatan UMKM terlebih dahulu melalui menu Penilaian Baru.</p>
                                <a href="/penilaian-baru" className="px-6 py-3 bg-gradient-to-r from-[#5A3B8C] to-[#8B7CC7] text-white font-bold rounded-xl shadow-lg">
                                    Mulai Penilaian Baru →
                                </a>
                            </div>
                        )
                    ) : (
                        <>
                            {activeTab === 'dashboard' && <DashboardView />}
                            {activeTab === 'analisisAI' && <AnalisisAI />}
                            {activeTab === 'bukuKas' && <BukuKas />}
                            {activeTab === 'manajemenStok' && <ManajemenStok />}
                        </>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}