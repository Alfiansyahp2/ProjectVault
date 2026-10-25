'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Project, UserProfile } from '@/lib/types';
import { X, Copy, Check, Sparkles, BrainCircuit } from 'lucide-react';

interface AiPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  profile: UserProfile;
}

export default function AiPromptModal({ isOpen, onClose, projects, profile }: AiPromptModalProps) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [includeAchieve, setIncludeAchieve] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const generateMasterText = () => {
    const lines: string[] = [];
    lines.push(`### KONTEKS RESMI PORTOFOLIO & PROYEK SAYA`);
    lines.push(`Nama: ${profile.name || 'Kandidat Profesional'}`);
    lines.push(`Headline / Posisi: ${profile.headline || 'Software Engineer'}`);
    if (profile.bio) lines.push(`Ringkasan: ${profile.bio}`);
    lines.push(`\n--- DAFTAR RIWAYAT PROYEK NYATA (JANGAN PERNAH LUPAKAN DATA INI) ---`);

    projects.forEach((p, idx) => {
      const techs = p.technologies?.length ? p.technologies.join(', ') : 'N/A';
      lines.push(`\n${idx + 1}. [${p.title}]`);
      lines.push(`   - Peran: ${p.role}`);
      lines.push(`   - Kategori: ${p.category}`);
      lines.push(`   - Teknologi & Tools: ${techs}`);
      lines.push(`   - Deskripsi: ${p.description}`);
      if (includeAchieve && p.achievements) {
        lines.push(`   - Hasil/Pencapaian Nyata: ${p.achievements}`);
      }
      if (p.repo_url) lines.push(`   - Repo: ${p.repo_url}`);
      if (p.demo_url) lines.push(`   - Demo: ${p.demo_url}`);
    });

    lines.push(`\n--- INSTRUKSI UNTUK AI ---`);
    lines.push(`Dalam seluruh percakapan kita mulai saat ini, Anda adalah asisten karir pribadi saya.`);
    lines.push(`Setiap kali saya meminta Anda menulis surat lamaran, menyusun poin CV, atau menyiapkan jawaban wawancara teknis:`);
    lines.push(`1. SELALU ambil bukti pengalaman dari daftar proyek nyata saya di atas.`);
    lines.push(`2. JANGAN PERNAH mengarang atau menambahkan proyek fiktif baru yang tidak ada dalam daftar ini.`);
    lines.push(`3. Sebutkan nama proyek dan teknologi yang sesuai dengan kebutuhan lowongan.`);

    return lines.join('\n');
  };

  const textToCopy = generateMasterText();

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#0b1220] border border-white/[0.12] rounded-3xl shadow-2xl shadow-indigo-500/10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header - ALWAYS FIXED AT TOP */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4.5 border-b border-white/[0.08] bg-slate-900/70 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-inner shrink-0">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-white tracking-tight truncate">
                Konteks Memori AI (Anti-Lupa)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                Salin sekali dan tempel di ChatGPT, Claude, atau Gemini di awal obrolan baru.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition shrink-0 ml-2"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 overscroll-contain">
          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2.5 text-xs font-medium text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeAchieve}
                onChange={e => setIncludeAchieve(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-indigo-500/40 h-4 w-4"
              />
              <span>Sertakan metrik capaian terukur (*achievements*)</span>
            </label>
          </div>

          <div className="relative">
            <textarea
              readOnly
              rows={11}
              value={textToCopy}
              className="w-full p-4 font-mono text-xs rounded-2xl border border-white/[0.08] bg-[#070b14] text-slate-300 focus:outline-none focus:border-indigo-500/50 select-all leading-relaxed"
            />
          </div>

          <div className="bg-indigo-500/[0.08] border border-indigo-500/20 rounded-2xl p-4 text-xs text-indigo-200 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-white">Tips Master Context:</strong> Kapan pun Anda memulai obrolan baru di asisten AI eksternal, tempelkan teks prompt di atas sebagai instruksi sistem awal. AI akan selalu mengutip riwayat proyek nyata Anda dan dilarang berhalusinasi mengarang proyek fiktif saat merakit surat lamaran.
            </div>
          </div>
        </div>

        {/* Footer - ALWAYS FIXED AT BOTTOM */}
        <div className="shrink-0 px-6 py-4 border-t border-white/[0.08] bg-slate-900/70 backdrop-blur-md flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition"
          >
            Tutup
          </button>
          <button
            onClick={handleCopy}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
              copied
                ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                : 'bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white shadow-indigo-500/25'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Konteks Berhasil Disalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Salin Seluruh Konteks (1-Klik)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
