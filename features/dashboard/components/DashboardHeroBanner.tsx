import React from 'react';
import Link from 'next/link';
import { Sparkles, BrainCircuit, Cpu } from 'lucide-react';
import { UserProfile } from '@/lib/types';

interface DashboardHeroBannerProps {
  profile: UserProfile;
  onOpenAiModal: () => void;
  onOpenTechModal?: () => void;
}

export const DashboardHeroBanner: React.FC<DashboardHeroBannerProps> = ({
  profile,
  onOpenAiModal,
  onOpenTechModal,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.1] bg-gradient-to-br from-indigo-950/70 via-slate-900/90 to-[#090d16] p-7 sm:p-10 shadow-2xl backdrop-blur-2xl">
      {/* Ambient atmospheric aura */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>Solusi Anti-Lupa Konteks AI &amp; Vault Portofolio</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Halo, <span className="bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">{profile.name || 'Kandidat Profesional'}</span>! 👋
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Semua riwayat proyek dan surat lamaran tersimpan aman di sini. AI eksternal tidak akan berhalusinasi lagi karena Anda dapat merakit konteks lengkap dalam 1 klik.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenAiModal}
            className="flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <BrainCircuit className="w-4 h-4 text-white" />
            <span>Salin Konteks AI</span>
          </button>

          <Link
            href="/analyzer"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-slate-100 text-xs sm:text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] backdrop-blur-md cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Analisis Lowongan</span>
          </Link>

          {onOpenTechModal && (
            <button
              onClick={onOpenTechModal}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/25 text-indigo-300 text-xs sm:text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              title="Lihat seluruh tech stack dan ikon portofolio dalam modal"
            >
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>Tech Stack</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
