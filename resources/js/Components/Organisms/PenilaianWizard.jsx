import React, { useState, useEffect } from 'react';

const steps = [
    { id: 1, title: 'Profil Perusahaan', subtitle: 'Identitas & Legalitas UMKM' },
    { id: 2, title: 'Laporan Keuangan', subtitle: 'Neraca & Laba Rugi Tahun Berjalan' },
    { id: 3, title: 'Indikator Operasional', subtitle: 'Legal, Digital, Akses Pembiayaan' }
];

const sectorOptions = [
    'Kuliner', 'Fashion', 'Kecantikan', 'Elektronik', 'Rumah Tangga',
    'Pertanian', 'Perikanan', 'Peternakan', 'Kerajinan', 'Pariwisata',
    'Jasa Lainnya', 'Manufaktur', 'Perdagangan', 'Konstruksi', 'Transportasi'
];

const provinceOptions = [
    'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'DI Yogyakarta', 'Jawa Timur',
    'Banten', 'Bali', 'Sumatera Utara', 'Sumatera Barat', 'Riau',
    'Kalimantan Barat', 'Kalimantan Timur', 'Sulawesi Selatan', 'Papua', 'Lainnya'
];

const employeeRangeOptions = [
    { value: '1-4', label: 'Mikro (1-4 Karyawan)' },
    { value: '5-19', label: 'Kecil (5-19 Karyawan)' },
    { value: '20-99', label: 'Menengah (20-99 Karyawan)' },
    { value: '100+', label: 'Besar (100+ Karyawan)' }
];

const legalStatusOptions = [
    { value: 'Tidak Terdaftar', label: 'Tidak Terdaftar' },
    { value: 'Terdaftar (NPWP)', label: 'Terdaftar (NPWP)' },
    { value: 'SKDP/IZIN USAHA', label: 'SKDP / Izin Usaha' },
    { value: 'PT / CV', label: 'PT / CV' },
    { value: 'Koperasi', label: 'Koperasi' }
];

const certificationOptions = [
    { value: 'Tidak Ada', label: 'Tidak Ada Sertifikasi' },
    { value: 'Halal MUI', label: 'Halal MUI' },
    { value: 'BPOM', label: 'BPOM' },
    { value: 'SN', label: 'Standar Nasional (SN)' },
    { value: 'ISO', label: 'ISO' },
    { value: 'Lainnya', label: 'Sertifikasi Lainnya' }
];

const fundingAccessOptions = [
    { value: 'Tidak Pernah', label: 'Tidak Pernah Mengajukan' },
    { value: 'KUR', label: 'Kredit Usaha Rakyat (KUR)' },
    { value: 'Bank Komersial', label: 'Pinjaman Bank Komersial' },
    { value: 'Pemerintah', label: 'Bantuan / Hibah Pemerintah' },
    { value: 'Modal Venture', label: 'Modal Venture / Angel Investor' },
    { value: 'Pinjaman P2P', label: 'Pinjaman P2P Lending' }
];

const formatAngka = (value) => {
    if (!value) return '';
    const numberString = value.replace(/[^,\d]/g, '').toString();
    return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const bersih = (stringAngka) => {
    if (!stringAngka) return 0;
    return parseFloat(stringAngka.replace(/\./g, '').replace(',', '.')) || 0;
};

export default function PenilaianWizard({ onComplete }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Step 1: Profil Perusahaan
        namaUsaha: '',
        npwp: '',
        sektor: '',
        provinsi: '',
        kota: '',
        tahunBerdiri: '',
        alamat: '',
        employeeRange: '',
        // Step 2: Laporan Keuangan
        // Neraca
        kas: '',
        piutang: '',
        persediaan: '',
        asetTetap: '',
        hutangUsaha: '',
        hutangJangkaPendek: '',
        hutangJangkaPanjang: '',
        ekuitas: '',
        // Laba Rugi
        pendapatan: '',
        hpp: '',
        bebanOperasional: '',
        bebanBunga: '',
        pajak: '',
        // Step 3: Indikator Operasional
        legalStatus: '',
        sertifikasiProduk: '',
        digitalMarketing: false,
        tahunOperasi: '',
        omsetTahunLalu: '',
        aksesPembiayaan: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Auto-calculate laba bersih from Laba Rugu fields
    const labaBersih = (() => {
        const p = bersih(formData.pendapatan);
        const h = bersih(formData.hpp);
        const b = bersih(formData.bebanOperasional);
        const bu = bersih(formData.bebanBunga);
        const pjk = bersih(formData.pajak);
        return p - h - b - bu - pjk;
    })();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        
        if (['kas', 'piutang', 'persediaan', 'asetTetap', 'hutangUsaha', 'hutangJangkaPendek', 'hutangJangkaPanjang', 'ekuitas', 'pendapatan', 'hpp', 'bebanOperasional', 'bebanBunga', 'pajak', 'omsetTahunLalu'].includes(name)) {
            setFormData(prev => ({ ...prev, [name]: formatAngka(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: newValue }));
        }
    };

    const validateStep = () => {
        if (currentStep === 1) {
            if (!formData.namaUsaha) return 'Nama usaha wajib diisi';
            if (!formData.sektor) return 'Sektor usaha wajib dipilih';
            if (!formData.provinsi) return 'Provinsi wajib dipilih';
            if (!formData.kota) return 'Kota/Kabupaten wajib diisi';
            if (!formData.employeeRange) return 'Rentang karyawan wajib dipilih';
        }
        if (currentStep === 2) {
            // At least some financial data should be filled
            const hasData = ['kas', 'piutang', 'persediaan', 'asetTetap', 'hutangUsaha', 'hutangJangkaPendek', 'hutangJangkaPanjang', 'ekuitas', 'pendapatan', 'hpp', 'bebanOperasional'].some(f => bersih(formData[f]) > 0);
            if (!hasData) return 'Minimal satu data keuangan harus diisi';
        }
        if (currentStep === 3) {
            if (!formData.legalStatus) return 'Status legalitas wajib dipilih';
            if (!formData.tahunOperasi) return 'Tahun operasi wajib diisi';
            if (!formData.aksesPembiayaan) return 'Akses pembiayaan wajib dipilih';
        }
        return null;
    };

    const nextStep = () => {
        const validationError = validateStep();
        if (validationError) {
            setError(validationError);
            return;
        }
        setError(null);
        if (currentStep < 3) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        setError(null);
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const submitForm = async (e) => {
        e.preventDefault();
        const validationError = validateStep();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError(null);

        // Prepare payload for backend API
        const currentAssets = bersih(formData.kas) + bersih(formData.piutang) + bersih(formData.persediaan);
        const totalAssets = currentAssets + bersih(formData.asetTetap);
        const currentLiabilities = bersih(formData.hutangUsaha) + bersih(formData.hutangJangkaPendek);
        const totalDebt = currentLiabilities + bersih(formData.hutangJangkaPanjang);
        const totalEquity = bersih(formData.ekuitas);
        const netProfit = labaBersih;
        const sales = bersih(formData.pendapatan);
        const cashInflow = currentAssets; // approximation
        const cashOutflow = currentLiabilities; // approximation
        const previousRevenue = bersih(formData.omsetTahunLalu);

        const payload = {
            nama_usaha: formData.namaUsaha,
            current_assets: currentAssets,
            current_liabilities: currentLiabilities,
            total_debt: totalDebt,
            total_equity: totalEquity,
            net_profit: netProfit,
            total_assets: totalAssets,
            sales: sales,
            cash_inflow: cashInflow,
            cash_outflow: cashOutflow,
            previous_revenue: previousRevenue
        };

        try {
            const response = await fetch('/hitung-kesehatan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            onComplete(data, formData);
        } catch (err) {
            console.error("Error:", err);
            setError("Terjadi kesalahan saat mengirim penilaian. Pastikan server berjalan.");
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <div className="space-y-6">
            <div className="bg-[#0E0B1D]/50 rounded-xl p-5 border border-[#3A3A52]">
                <h4 className="text-sm font-bold text-[#C9C2E3] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#8B7CC7]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    Identitas Usaha
                </h4>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Nama Usaha <span className="text-rose-400">*</span></label>
                        <input type="text" name="namaUsaha" value={formData.namaUsaha} onChange={handleChange} placeholder="Contoh: Warung Bu Siti" className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm" required />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">NPWP (Opsional)</label>
                        <input type="text" name="npwp" value={formData.npwp} onChange={handleChange} placeholder="Contoh: 12.345.678.9-012.000" className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Sektor Usaha <span className="text-rose-400">*</span></label>
                            <select name="sektor" value={formData.sektor} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm" required>
                                <option value="">Pilih Sektor</option>
                                {sectorOptions.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Provinsi <span className="text-rose-400">*</span></label>
                            <select name="provinsi" value={formData.provinsi} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm" required>
                                <option value="">Pilih Provinsi</option>
                                {provinceOptions.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Kota / Kabupaten <span className="text-rose-400">*</span></label>
                        <input type="text" name="kota" value={formData.kota} onChange={handleChange} placeholder="Contoh: Jakarta Selatan" className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Tahun Berdiri</label>
                            <input type="number" name="tahunBerdiri" value={formData.tahunBerdiri} onChange={handleChange} placeholder="2020" min="1900" max={new Date().getFullYear()} className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Rentang Karyawan <span className="text-rose-400">*</span></label>
                            <select name="employeeRange" value={formData.employeeRange} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm" required>
                                <option value="">Pilih Rentang</option>
                                {employeeRangeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Alamat Lengkap</label>
                        <textarea name="alamat" value={formData.alamat} onChange={handleChange} rows={3} placeholder="Alamat lengkap usaha" className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm resize-none" />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            {/* Neraca Section */}
            <div className="bg-[#0E0B1D]/50 rounded-xl p-5 border border-[#3A3A52]">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#3A3A52]">
                    <svg className="w-5 h-5 text-[#16A34A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                    <h4 className="text-sm font-bold text-[#16A34A] uppercase tracking-wider">Neraca (Laporan Posisi Keuangan)</h4>
                </div>
                <p className="text-xs text-[#C9C2E3]/60 mb-4">Isi dalam Rupiah. Aset Lancar = Kas + Piutang + Persediaan. Total Aset = Aset Lancar + Aset Tetap.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Kas & Setara Kas</label>
                        <input type="text" name="kas" value={formData.kas} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-emerald-400 focus:outline-none text-sm font-semibold" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Piutang Usaha</label>
                        <input type="text" name="piutang" value={formData.piutang} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-emerald-400 focus:outline-none text-sm font-semibold" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Persediaan (Inventory)</label>
                        <input type="text" name="persediaan" value={formData.persediaan} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-emerald-400 focus:outline-none text-sm font-semibold" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Aset Tetap (Netto)</label>
                        <input type="text" name="asetTetap" value={formData.asetTetap} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-emerald-400 focus:outline-none text-sm font-semibold" />
                    </div>
                </div>

                <div className="bg-[#1A1530] rounded-lg p-3 mb-4 border border-[#3A3A52]/50">
                    <div className="flex justify-between text-xs text-[#C9C2E3] mb-1">
                        <span>Aset Lancar (Otomatis)</span>
                        <span className="font-bold text-emerald-400">Rp {formatAngka((bersih(formData.kas) + bersih(formData.piutang) + bersih(formData.persediaan)).toString())}</span>
                    </div>
                    <div className="flex justify-between text-xs text-[#C9C2E3]">
                        <span>Total Aset (Otomatis)</span>
                        <span className="font-bold text-white">Rp {formatAngka((bersih(formData.kas) + bersih(formData.piutang) + bersih(formData.persediaan) + bersih(formData.asetTetap)).toString())}</span>
                    </div>
                </div>

                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                    Kewajiban & Ekuitas
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Hutang Usaha</label>
                        <input type="text" name="hutangUsaha" value={formData.hutangUsaha} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-rose-400 focus:outline-none text-sm font-semibold" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Hutang Jangka Pendek</label>
                        <input type="text" name="hutangJangkaPendek" value={formData.hutangJangkaPendek} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-rose-400 focus:outline-none text-sm font-semibold" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Hutang Jangka Panjang</label>
                        <input type="text" name="hutangJangkaPanjang" value={formData.hutangJangkaPanjang} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-rose-400 focus:outline-none text-sm font-semibold" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Ekuitas / Modal</label>
                        <input type="text" name="ekuitas" value={formData.ekuitas} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-[#8B7CC7] focus:outline-none text-sm font-semibold" />
                    </div>
                </div>
            </div>

            {/* Laba Rugi Section */}
            <div className="bg-[#0E0B1D]/50 rounded-xl p-5 border border-[#3A3A52]">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#3A3A52]">
                    <svg className="w-5 h-5 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <h4 className="text-sm font-bold text-[#F59E0B] uppercase tracking-wider">Laporan Laba Rugi</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Pendapatan / Penjualan Bersih</label>
                        <input type="text" name="pendapatan" value={formData.pendapatan} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-emerald-400 focus:outline-none text-sm font-semibold" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Harga Pokok Penjualan (HPP)</label>
                        <input type="text" name="hpp" value={formData.hpp} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-rose-400 focus:outline-none text-sm font-semibold" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Beban Operasional</label>
                        <input type="text" name="bebanOperasional" value={formData.bebanOperasional} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-rose-400 focus:outline-none text-sm font-semibold" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Beban Bunga</label>
                        <input type="text" name="bebanBunga" value={formData.bebanBunga} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-rose-400 focus:outline-none text-sm font-semibold" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Pajak Penghasilan</label>
                        <input type="text" name="pajak" value={formData.pajak} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-rose-400 focus:outline-none text-sm font-semibold" />
                    </div>
                </div>

                <div className="mt-4 p-4 bg-[#1A1530] rounded-lg border border-[#3A3A52]/50">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-[#C9C2E3] uppercase">Laba Bersih (Otomatis)</span>
                        <span className={`text-xl font-black ${labaBersih >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            Rp {formatAngka(Math.abs(labaBersih).toString())}
                        </span>
                    </div>
                    <p className="text-[10px] text-[#C9C2E3]/60 mt-1">Pendapatan - HPP - Beban Operasional - Beban Bunga - Pajak</p>
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6">
            <div className="bg-[#0E0B1D]/50 rounded-xl p-5 border border-[#3A3A52]">
                <h4 className="text-sm font-bold text-[#C9C2E3] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#8B7CC7]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                    Indikator Legal & Operasional
                </h4>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Status Legalitas <span className="text-rose-400">*</span></label>
                        <select name="legalStatus" value={formData.legalStatus} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm" required>
                            <option value="">Pilih Status Legalitas</option>
                            {legalStatusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Sertifikasi Produk</label>
                        <select name="sertifikasiProduk" value={formData.sertifikasiProduk} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm">
                            <option value="">Pilih Sertifikasi</option>
                            {certificationOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-3">
                        <input type="checkbox" name="digitalMarketing" checked={formData.digitalMarketing} onChange={handleChange} id="digitalMarketing" className="w-5 h-5 text-[#8B7CC7] border-[#3A3A52] bg-[#0E0B1D] rounded focus:ring-[#8B7CC7]" />
                        <label htmlFor="digitalMarketing" className="text-sm text-[#C9C2E3] cursor-pointer">Menggunakan Digital Marketing / Media Sosial untuk Promosi</label>
                    </div>
                </div>
            </div>

            <div className="bg-[#0E0B1D]/50 rounded-xl p-5 border border-[#3A3A52]">
                <h4 className="text-sm font-bold text-[#C9C2E3] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Performa & Akses Pembiayaan
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Tahun Operasi <span className="text-rose-400">*</span></label>
                        <input type="number" name="tahunOperasi" value={formData.tahunOperasi} onChange={handleChange} placeholder="3" min="0" max="100" className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm" required />
                        <p className="text-[10px] text-[#C9C2E3]/60 mt-1">Lama usaha beroperasi (tahun)</p>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Omset Tahun Lalu</label>
                        <input type="text" name="omsetTahunLalu" value={formData.omsetTahunLalu} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm" />
                        <p className="text-[10px] text-[#C9C2E3]/60 mt-1">Untuk perhitungan pertumbuhan</p>
                    </div>
                </div>
                <div className="mt-4">
                    <label className="block text-xs font-semibold text-[#C9C2E3] uppercase mb-1">Akses Pembiayaan <span className="text-rose-400">*</span></label>
                    <select name="aksesPembiayaan" value={formData.aksesPembiayaan} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-[#0E0B1D] border border-[#3A3A52] text-white focus:ring-2 focus:ring-[#8B7CC7] focus:outline-none text-sm" required>
                        <option value="">Pilih Akses Pembiayaan</option>
                        {fundingAccessOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-[#0E0B1D] min-h-screen p-6 md:p-8 text-slate-100">
            <div className="max-w-4xl mx-auto">
                {/* Progress Indicator */}
                <div className="mb-8">
                    <div className="relative">
                        <div className="absolute top-3 left-0 right-0 h-1.5 bg-[#3A3A52] rounded-full">
                            <div className="h-full bg-gradient-to-r from-[#5A3B8C] to-[#8B7CC7] rounded-full transition-all duration-300" style={{ width: `${((currentStep - 1) / 2) * 100}%` }}></div>
                        </div>
                        <div className="relative flex justify-between">
                            {steps.map((step, index) => (
                                <div key={step.id} className="relative z-10 flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                                        index + 1 < currentStep 
                                            ? 'bg-[#16A34A] text-white shadow-lg' 
                                            : index + 1 === currentStep 
                                                ? 'bg-gradient-to-br from-[#5A3B8C] to-[#8B7CC7] text-white shadow-lg ring-4 ring-[#5A3B8C]/30' 
                                                : 'bg-[#3A3A52] text-[#C9C2E3]/50'
                                    }`}>
                                        {index + 1 < currentStep ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                                        ) : (index + 1)}
                                    </div>
                                    <p className={`text-xs font-semibold mt-2 text-center w-28 ${index + 1 <= currentStep ? 'text-white' : 'text-[#C9C2E3]/50'}`}>
                                        {step.title}
                                    </p>
                                    <p className={`text-[10px] text-center w-28 ${index + 1 <= currentStep ? 'text-[#8B7CC7]' : 'text-[#C9C2E3]/40'}`}>
                                        {step.subtitle}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-[#2A1E4D] rounded-2xl shadow-xl border border-[#3A3A52] overflow-hidden">
                    <div className="p-6 md:p-8">
                        <form onSubmit={submitForm}>
                            {currentStep === 1 && renderStep1()}
                            {currentStep === 2 && renderStep2()}
                            {currentStep === 3 && renderStep3()}

                            {error && (
                                <div className="mb-4 p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-300 text-sm flex items-center gap-2">
                                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                    {error}
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between pt-6 border-t border-[#3A3A52] mt-6">
                                <button 
                                    type="button" 
                                    onClick={prevStep} 
                                    disabled={currentStep === 1}
                                    className="px-6 py-2.5 text-white font-semibold rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-[#3A3A52] hover:bg-[#4A4A62]"
                                >
                                    ← Sebelumnya
                                </button>
                                <div className="flex gap-3">
                                    {currentStep < 3 ? (
                                        <button 
                                            type="button" 
                                            onClick={nextStep}
                                            className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-lg transition-all bg-gradient-to-r from-[#5A3B8C] to-[#8B7CC7] hover:opacity-90"
                                        >
                                            Selanjutnya →
                                        </button>
                                    ) : (
                                        <button 
                                            type="submit" 
                                            disabled={loading}
                                            className="px-8 py-2.5 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 bg-gradient-to-r from-[#16A34A] to-[#22C55E] hover:opacity-90"
                                        >
                                            {loading ? 'Memproses Penilaian...' : 'Kirim & Dapatkan Hasil'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Info Footer */}
                <div className="mt-6 p-4 bg-[#1A1530] rounded-xl border border-[#3A3A52]/50 text-center">
                    <p className="text-xs text-[#C9C2E3]/70">
                        Data yang dimasukkan akan diproses oleh model Machine Learning untuk menghitung skor kesehatan keuangan UMKM.
                        Hasil analisis meliputi 4 pilar: Profitabilitas, Likuiditas, Leverage, dan Efisiensi.
                    </p>
                </div>
            </div>
        </div>
    );
}