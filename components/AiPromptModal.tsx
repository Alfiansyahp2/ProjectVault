'use client';

import React, { useState } from 'react';
import { Project, UserProfile } from '@/lib/types';
import { X, Copy, Check, Sparkles, BrainCircuit } from 'lucide-react';

interface AiPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  profile: UserProfile;
}

export default function AiPromptModal({ isOpen, onClose, projects, profile }: AiPromptModalProps) {
  const [copied, setCopied] = useState(false);
  const [includeAchieve, setIncludeAchieve] = useState(true);

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                Konteks Memori AI (Anti-Lupa)
              </h2>
              <p className="text-xs text-zinc-500">
                Salin sekali dan tempel di ChatGPT, Claude, atau Gemini di awal obrolan baru.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeAchieve}
                onChange={e => setIncludeAchieve(e.target.checked)}
                className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
              />
              Sertakan metrik / hasil pencapaian proyek
            </label>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> Berhasil Disalin!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Salin Seluruh Konteks
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <textarea
              readOnly
              rows={14}
              value={textToCopy}
              className="w-full p-4 font-mono text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:outline-none select-all"
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-xl p-3 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>Tips Penggunaan:</strong> Kapan pun Anda membuka sesi chat baru dengan AI apa pun, langsung <em>paste</em> teks di atas sebagai pesan pertama Anda. AI tidak akan pernah lupa riwayat proyek Anda dan akan selalu menggunakan proyek asli Anda saat menyusun surat lamaran.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
