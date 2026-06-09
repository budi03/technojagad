'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

const PLACEHOLDER_TAGS = [
    { tag: '[ID_PART]', desc: 'Nomor/ID Part laptop' },
    { tag: '[LIST_DIAGNOSA]', desc: 'Daftar diagnosa teknisi' },
    { tag: '[NAMA_JASA]', desc: 'Nama jasa yang dipilih' },
    { tag: '[BIAYA_JASA]', desc: 'Total biaya jasa' },
];

const DEFAULT_TEMPLATE = `Halo Kak, terima kasih sudah mempercayakan laptop Kakak ke TechnoJagad Service 🙏

📋 *LAPORAN DIAGNOSA TEKNISI*
🔧 No. Part: [ID_PART]

📌 *Hasil Diagnosa:*
[LIST_DIAGNOSA]

🛠️ *Rekomendasi Solusi:*
[NAMA_JASA]

💰 *Estimasi Biaya:*
[BIAYA_JASA]

Apakah Kakak menyetujui penawaran di atas? Kami siap mengerjakan segera setelah konfirmasi. 😊

Terima kasih,
_TechnoJagad Service Center_`;

export default function PengaturanPage() {
    const [template, setTemplate] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }

    useEffect(() => {
        fetchTemplate();
    }, []);

    async function fetchTemplate() {
        setLoading(true);
        try {
            const res = await fetch('/api/settings/template');
            const data = await res.json();
            setTemplate(data.template || DEFAULT_TEMPLATE);
        } catch {
            setToast({ type: 'error', msg: 'Gagal memuat template dari server.' });
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        setSaving(true);
        setToast(null);
        try {
            const res = await fetch('/api/settings/template', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ template }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setToast({ type: 'success', msg: 'Template berhasil disimpan!' });
        } catch (err) {
            setToast({ type: 'error', msg: err.message || 'Gagal menyimpan template.' });
        } finally {
            setSaving(false);
            setTimeout(() => setToast(null), 4000);
        }
    }

    function insertTag(tag) {
        const textarea = document.getElementById('template-textarea');
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newVal = template.substring(0, start) + tag + template.substring(end);
        setTemplate(newVal);
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + tag.length, start + tag.length);
        }, 0);
    }

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="mb-7">
                    <h1 className="text-xl font-bold text-white">Pengaturan Template Chat</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Atur template pesan yang akan dikirim ke pelanggan. Gunakan placeholder di bawah untuk data dinamis.
                    </p>
                </div>

                {/* Toast */}
                {toast && (
                    <div
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-5 border text-sm ${toast.type === 'success'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}
                    >
                        {toast.type === 'success' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                        )}
                        {toast.msg}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Placeholder Tags */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                            <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                                </svg>
                                Placeholder Tersedia
                            </h2>
                            <p className="text-slate-500 text-xs mb-4">Klik untuk sisipkan ke posisi kursor di textarea.</p>
                            <div className="space-y-2">
                                {PLACEHOLDER_TAGS.map((item) => (
                                    <button
                                        key={item.tag}
                                        onClick={() => insertTag(item.tag)}
                                        className="w-full text-left group"
                                    >
                                        <div className="bg-slate-800 hover:bg-sky-500/10 hover:border-sky-500/30 border border-slate-700 rounded-xl px-3 py-2.5 transition-all">
                                            <code className="text-sky-400 text-xs font-mono font-semibold block">{item.tag}</code>
                                            <span className="text-slate-500 text-xs">{item.desc}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Reset */}
                            <button
                                onClick={() => setTemplate(DEFAULT_TEMPLATE)}
                                className="mt-4 w-full text-center text-xs text-slate-500 hover:text-slate-300 transition-colors py-2"
                            >
                                Reset ke template default
                            </button>
                        </div>
                    </div>

                    {/* Textarea */}
                    <div className="lg:col-span-2">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-sm font-semibold text-slate-300">Isi Template</h2>
                                <span className="text-xs text-slate-600">{template.length} karakter</span>
                            </div>

                            {loading ? (
                                <div className="flex-1 flex items-center justify-center h-64">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                        Memuat template…
                                    </div>
                                </div>
                            ) : (
                                <textarea
                                    id="template-textarea"
                                    value={template}
                                    onChange={(e) => setTemplate(e.target.value)}
                                    className="flex-1 w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm font-mono leading-relaxed placeholder-slate-600 resize-none focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition min-h-[380px]"
                                    placeholder="Tulis template chat di sini..."
                                    spellCheck={false}
                                />
                            )}

                            <button
                                onClick={handleSave}
                                disabled={saving || loading}
                                className="mt-4 flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 disabled:bg-sky-500/40 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-6 rounded-xl transition-all text-sm self-end"
                            >
                                {saving ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                        Menyimpan…
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Simpan Template
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}