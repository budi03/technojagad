'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';

// Import react-select secara dinamis (hindari SSR error)
const Select = dynamic(() => import('react-select'), { ssr: false });

// ─── Dark theme styles untuk react-select (inline beats CSS global) ──────────
const darkSelectStyles = {
    control: (base, state) => ({
        ...base,
        backgroundColor: '#1e293b',
        borderColor: state.isFocused ? '#0ea5e9' : '#334155',
        boxShadow: state.isFocused ? '0 0 0 1px #0ea5e9' : 'none',
        minHeight: '42px',
        '&:hover': { borderColor: '#0ea5e9' },
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        zIndex: 9999,
    }),
    menuList: (base) => ({
        ...base,
        backgroundColor: '#1e293b',
        padding: '4px',
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
            ? '#0284c7'
            : state.isFocused
                ? '#0ea5e9'
                : 'transparent',
        color: state.isSelected || state.isFocused ? '#ffffff' : '#f1f5f9',
        borderRadius: '6px',
        margin: '1px 0',
        cursor: 'pointer',
        '&:active': { backgroundColor: '#0369a1' },
    }),
    singleValue: (base) => ({ ...base, color: '#f1f5f9' }),
    multiValue: (base) => ({ ...base, backgroundColor: '#0284c7' }),
    multiValueLabel: (base) => ({ ...base, color: '#ffffff' }),
    multiValueRemove: (base) => ({
        ...base,
        color: '#bfdbfe',
        '&:hover': { backgroundColor: '#0ea5e9', color: '#fff' },
    }),
    input: (base) => ({ ...base, color: '#f1f5f9' }),
    placeholder: (base) => ({ ...base, color: '#64748b' }),
    indicatorSeparator: (base) => ({ ...base, backgroundColor: '#334155' }),
    dropdownIndicator: (base) => ({ ...base, color: '#64748b', '&:hover': { color: '#94a3b8' } }),
    clearIndicator: (base) => ({ ...base, color: '#64748b', '&:hover': { color: '#f43f5e' } }),
    noOptionsMessage: (base) => ({ ...base, color: '#64748b' }),
    loadingMessage: (base) => ({ ...base, color: '#64748b' }),
    loadingIndicator: (base) => ({ ...base, color: '#0ea5e9' }),
};

// ─── Format Rupiah ──────────────────────────────────────────────────────────
function formatRupiah(angka) {
    if (!angka && angka !== 0) return '-';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(angka);
}

// ─── Generate teks dari template ────────────────────────────────────────────
function generateText(template, { idPart, diagnosaList, selectedJasa }) {
    if (!template) return '';

    const listDiagnosa = diagnosaList
        .filter((d) => d.trim() !== '')
        .map((d) => `- ${d.trim()}`)
        .join('\n');

    const namaJasaList = selectedJasa.map((j) => `- ${j.nama_jasa}`).join('\n');

    const totalBiaya = selectedJasa.reduce((sum, j) => sum + Number(j.tarif || 0), 0);
    const biayaJasaDetail = selectedJasa
        .map((j) => `- ${j.nama_jasa}: ${formatRupiah(j.tarif)}`)
        .join('\n');

    const biayaBlock =
        selectedJasa.length > 1
            ? `${biayaJasaDetail}\nTotal: ${formatRupiah(totalBiaya)}`
            : selectedJasa.length === 1
                ? formatRupiah(totalBiaya)
                : '-';

    return template
        .replace(/\[ID_PART\]/g, idPart || '-')
        .replace(/\[LIST_DIAGNOSA\]/g, listDiagnosa || '-')
        .replace(/\[NAMA_JASA\]/g, namaJasaList || '-')
        .replace(/\[BIAYA_JASA\]/g, biayaBlock);
}

// ─── Komponen Diagnosa Input ─────────────────────────────────────────────────
function DiagnosaInputs({ list, onChange }) {
    function updateItem(idx, val) {
        const next = [...list];
        next[idx] = val;
        onChange(next);
    }
    function addItem() {
        onChange([...list, '']);
    }
    function removeItem(idx) {
        if (list.length <= 1) return;
        onChange(list.filter((_, i) => i !== idx));
    }

    return (
        <div className="space-y-2">
            {list.map((val, idx) => (
                <div key={idx} className="flex items-center gap-2">
                    <span className="text-slate-500 text-xs w-5 text-right shrink-0">{idx + 1}.</span>
                    <input
                        type="text"
                        value={val}
                        onChange={(e) => updateItem(idx, e.target.value)}
                        placeholder={`Diagnosa ${idx + 1}`}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition"
                    />
                    {list.length > 1 && (
                        <button
                            onClick={() => removeItem(idx)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Hapus"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            ))}

            <button
                onClick={addItem}
                className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 text-xs font-medium mt-1 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Tambah Diagnosa
            </button>
        </div>
    );
}

// ─── Komponen Tabel Jasa Terpilih ────────────────────────────────────────────
function JasaTerpilihTable({ items, onRemove }) {
    if (items.length === 0) return null;

    const total = items.reduce((s, i) => s + Number(i.tarif || 0), 0);

    return (
        <div className="mt-3 bg-slate-800/60 rounded-xl border border-slate-700 overflow-hidden">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-slate-700">
                        <th className="text-left px-3 py-2 text-slate-400 font-medium text-xs">Nama Jasa</th>
                        <th className="text-right px-3 py-2 text-slate-400 font-medium text-xs">Tarif</th>
                        <th className="w-8" />
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <tr key={item.id} className="border-b border-slate-700/50 last:border-0">
                            <td className="px-3 py-2 text-slate-200">{item.nama_jasa}</td>
                            <td className="px-3 py-2 text-right text-emerald-400 font-mono text-xs">
                                {formatRupiah(item.tarif)}
                            </td>
                            <td className="px-2 py-2 text-right">
                                <button
                                    onClick={() => onRemove(item.id)}
                                    className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="bg-slate-700/30">
                        <td className="px-3 py-2 text-slate-300 font-semibold text-xs">Total</td>
                        <td className="px-3 py-2 text-right text-emerald-300 font-bold font-mono text-xs" colSpan={2}>
                            {formatRupiah(total)}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}

// ─── HALAMAN UTAMA ────────────────────────────────────────────────────────────
export default function KalkulatorPage() {
    // Form 1 - Informasi Laptop
    const [idPart, setIdPart] = useState('');
    const [diagnosaList, setDiagnosaList] = useState(['']);

    // Form 2 - Solusi
    const [kategoriOptions, setKategoriOptions] = useState([]);
    const [selectedKategori, setSelectedKategori] = useState(null);
    const [jasaOptions, setJasaOptions] = useState([]);
    const [selectedJasaOption, setSelectedJasaOption] = useState(null);
    const [jasaCart, setJasaCart] = useState([]); // jasa yang sudah ditambahkan

    // Template & result
    const [template, setTemplate] = useState('');
    const [generatedText, setGeneratedText] = useState('');
    const [copied, setCopied] = useState(false);

    // Loading states
    const [loadingKategori, setLoadingKategori] = useState(true);
    const [loadingJasa, setLoadingJasa] = useState(false);

    // ── Fetch template & kategori saat mount ──
    useEffect(() => {
        async function init() {
            try {
                const [tplRes, katRes] = await Promise.all([
                    fetch('/api/settings/template'),
                    fetch('/api/jasa/kategori'),
                ]);
                const tplData = await tplRes.json();
                const katData = await katRes.json();

                setTemplate(tplData.template || '');
                setKategoriOptions(
                    (katData.data || []).map((k) => ({ value: k.id, label: k.nama_kategori }))
                );
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingKategori(false);
            }
        }
        init();
    }, []);

    // ── Fetch items jasa ketika kategori berubah ──
    useEffect(() => {
        if (!selectedKategori) {
            setJasaOptions([]);
            setSelectedJasaOption(null);
            return;
        }

        async function fetchItems() {
            setLoadingJasa(true);
            setSelectedJasaOption(null);
            try {
                const res = await fetch(`/api/jasa/items?kategori_id=${selectedKategori.value}`);
                const data = await res.json();
                setJasaOptions(
                    (data.data || []).map((j) => ({
                        value: j.id,
                        label: `${j.nama_jasa} — ${formatRupiah(j.tarif)}`,
                        ...j,
                    }))
                );
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingJasa(false);
            }
        }
        fetchItems();
    }, [selectedKategori]);

    // ── Auto-generate teks setiap kali data form berubah ──
    const autoGenerate = useCallback(() => {
        if (!template) return;
        const text = generateText(template, {
            idPart,
            diagnosaList,
            selectedJasa: jasaCart,
        });
        setGeneratedText(text);
    }, [template, idPart, diagnosaList, jasaCart]);

    useEffect(() => {
        autoGenerate();
    }, [autoGenerate]);

    // ── Tambah jasa ke cart ──
    function handleAddJasa() {
        if (!selectedJasaOption) return;
        const already = jasaCart.find((j) => j.id === selectedJasaOption.id);
        if (already) return;
        setJasaCart((prev) => [...prev, selectedJasaOption]);
        setSelectedJasaOption(null);
    }

    function handleRemoveJasa(id) {
        setJasaCart((prev) => prev.filter((j) => j.id !== id));
    }

    // ── Copy to clipboard ──
    async function handleCopy() {
        if (!generatedText) return;
        try {
            await navigator.clipboard.writeText(generatedText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            // Fallback
            const el = document.createElement('textarea');
            el.value = generatedText;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    }

    // ── Print ──
    function handlePrint() {
        window.print();
    }

    // ── Reset form ──
    function handleReset() {
        setIdPart('');
        setDiagnosaList(['']);
        setSelectedKategori(null);
        setSelectedJasaOption(null);
        setJasaCart([]);
        setGeneratedText('');
    }

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-7">
                    <div>
                        <h1 className="text-xl font-bold text-white">Generator Chat Penawaran</h1>
                        <p className="text-slate-400 text-sm mt-1">Isi form di bawah, teks penawaran akan otomatis ter-generate.</p>
                    </div>
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-xl text-sm transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        Reset
                    </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
                    {/* ── Kolom Kiri: Form ── */}
                    <div className="xl:col-span-2 space-y-4">
                        {/* Form 1 - Informasi Laptop */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-6 h-6 rounded-lg bg-sky-500/15 flex items-center justify-center">
                                    <span className="text-sky-400 text-xs font-bold">1</span>
                                </div>
                                <h2 className="text-sm font-semibold text-slate-200">Informasi Laptop</h2>
                            </div>

                            <div className="space-y-4">
                                {/* ID Part */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                        ID Part / Nomor Seri
                                    </label>
                                    <input
                                        type="text"
                                        value={idPart}
                                        onChange={(e) => setIdPart(e.target.value)}
                                        placeholder="Contoh: LP-2024-001"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition"
                                    />
                                </div>

                                {/* Diagnosa */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                        Diagnosa Teknisi
                                    </label>
                                    <DiagnosaInputs list={diagnosaList} onChange={setDiagnosaList} />
                                </div>
                            </div>
                        </div>

                        {/* Form 2 - Solusi / Jasa */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-6 h-6 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                                    <span className="text-emerald-400 text-xs font-bold">2</span>
                                </div>
                                <h2 className="text-sm font-semibold text-slate-200">Solusi & Jasa</h2>
                            </div>

                            <div className="space-y-3">
                                {/* Kategori */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                        Kategori Jasa
                                    </label>
                                    {loadingKategori ? (
                                        <div className="h-[42px] bg-slate-800 rounded-xl border border-slate-700 flex items-center px-3">
                                            <span className="text-slate-500 text-xs">Memuat kategori…</span>
                                        </div>
                                    ) : (
                                        <Select
                                            instanceId="kategori-select"
                                            styles={darkSelectStyles}
                                            options={kategoriOptions}
                                            value={selectedKategori}
                                            onChange={setSelectedKategori}
                                            placeholder="Cari kategori jasa…"
                                            isClearable
                                            noOptionsMessage={() => 'Kategori tidak ditemukan'}
                                        />
                                    )}
                                </div>

                                {/* Nama Jasa */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                        Nama Jasa
                                    </label>
                                    <Select
                                        instanceId="jasa-select"
                                        styles={darkSelectStyles}
                                        options={jasaOptions}
                                        value={selectedJasaOption}
                                        onChange={setSelectedJasaOption}
                                        placeholder={
                                            !selectedKategori
                                                ? 'Pilih kategori dulu…'
                                                : loadingJasa
                                                    ? 'Memuat jasa…'
                                                    : 'Cari nama jasa…'
                                        }
                                        isDisabled={!selectedKategori || loadingJasa}
                                        isLoading={loadingJasa}
                                        isClearable
                                        noOptionsMessage={() => 'Jasa tidak ditemukan'}
                                    />
                                </div>

                                {/* Tombol Tambah */}
                                <button
                                    onClick={handleAddJasa}
                                    disabled={!selectedJasaOption}
                                    className="flex items-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 disabled:opacity-40 disabled:cursor-not-allowed text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                    Tambahkan ke Penawaran
                                </button>

                                {/* Tabel Jasa Terpilih */}
                                <JasaTerpilihTable items={jasaCart} onRemove={handleRemoveJasa} />
                            </div>
                        </div>
                    </div>

                    {/* ── Kolom Kanan: Hasil Generate ── */}
                    <div className="xl:col-span-3">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sticky top-20">
                            {/* Header hasil */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <h2 className="text-sm font-semibold text-slate-200">Hasil Teks Penawaran</h2>
                                </div>

                                {/* Action buttons */}
                                <div className="flex items-center gap-2">
                                    {/* Copy */}
                                    <button
                                        onClick={handleCopy}
                                        disabled={!generatedText}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${copied
                                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                                                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed'
                                            }`}
                                    >
                                        {copied ? (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                </svg>
                                                Tersalin!
                                            </>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                                                </svg>
                                                Copy
                                            </>
                                        )}
                                    </button>

                                    {/* Print */}
                                    <button
                                        onClick={handlePrint}
                                        disabled={!generatedText}
                                        className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 hover:text-white border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                                        </svg>
                                        Print Invoice
                                    </button>
                                </div>
                            </div>

                            {/* Teks hasil */}
                            {generatedText ? (
                                <div
                                    id="print-area"
                                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 min-h-[420px] text-slate-200 text-sm font-mono leading-relaxed whitespace-pre-wrap break-words select-text"
                                >
                                    {generatedText}
                                </div>
                            ) : (
                                <div className="bg-slate-800/30 border border-dashed border-slate-700 rounded-xl min-h-[420px] flex flex-col items-center justify-center text-center p-8">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-slate-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                    </svg>
                                    <p className="text-slate-500 text-sm">Teks penawaran akan muncul di sini.</p>
                                    <p className="text-slate-600 text-xs mt-1">Isi form di sebelah kiri untuk mulai generate.</p>
                                </div>
                            )}

                            {/* Info placeholder yang belum terisi */}
                            {generatedText && generatedText.includes('[') && (
                                <div className="mt-3 flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                    </svg>
                                    Ada placeholder yang belum ter-replace. Lengkapi form terlebih dahulu.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}