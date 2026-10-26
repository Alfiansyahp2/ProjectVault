'use client';

import React from 'react';
import { 
  FolderGit2, 
  Layers, 
  TrendingUp, 
  RefreshCw, 
  Sparkles, 
  BrainCircuit, 
  Plus,
  Cpu,
  ArrowRight
} from 'lucide-react';

interface ProjectStatsProps {
  totalProjects: number;
  totalTech: number;
  totalAchievements: number;
  isLoading: boolean;
  isSyncing: boolean;
  onRefresh: () => void;
  onSync: () => void;
  onOpenAiPrompt: () => void;
  onAddProject: () => void;
  onOpenTechModal?: () => void;
}

export const ProjectStats: React.FC<ProjectStatsProps> = ({
  totalProjects,
  totalTech,
  totalAchievements,
  isLoading,
  isSyncing,
  onRefresh,
  onSync,
  onOpenAiPrompt,
  onAddProject,
  onOpenTechModal,
}) => {
  return (
    <div className="space-y-5 border-b border-white/[0.08] pb-6">
      {/* Top Banner Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/10 shrink-0">
            <FolderGit2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                Bank Proyek &amp; Portofolio
              </h1>
              <span className="text-[10px] sm:text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                Single Source of Truth
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5 leading-relaxed">
              Katalog rekam jejak arsitektur sistem, peran kepemimpinan, tech stack, dan capaian terukur siap pakai.
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-auto shrink-0">
          <button
            onClick={onRefresh}
            className="p-2.5 rounded-xl text-xs font-semibold border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 transition cursor-pointer"
            title="Muat ulang data dari Cloud / Database"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          <button
            onClick={onSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 shadow-sm shadow-emerald-500/10 transition disabled:opacity-50 cursor-pointer"
            title="Scan data/project/project.md dan sinkronkan proyek baru ke database"
          >
            <Sparkles className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sinkronisasi...' : 'Sync project.md'}</span>
          </button>

          <button
            onClick={onOpenAiPrompt}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-white/[0.1] bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 transition cursor-pointer"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
            <span>Konteks AI</span>
          </button>

          <button
            onClick={onAddProject}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-500 via-indigo-600 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Proyek</span>
          </button>
        </div>
      </div>

      {/* Metrics Row (3-Column Clean Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Metric 1 */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold text-white tracking-tight">{totalProjects}</span>
              <p className="text-[11px] text-slate-400 font-medium">Proyek Unggulan</p>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 font-semibold uppercase">Portofolio</span>
        </div>

        {/* Metric 2: Clickable Tech Stack Modal Card */}
        <button
          type="button"
          onClick={onOpenTechModal}
          className="p-3 sm:p-3.5 rounded-2xl bg-indigo-500/[0.07] hover:bg-indigo-500/[0.12] border border-indigo-500/25 hover:border-indigo-500/40 flex items-center justify-between gap-3 text-left transition group cursor-pointer"
          title="Klik untuk membuka modal eksplorasi seluruh tech stack dan ikon"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 group-hover:scale-105 transition-transform">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold text-white tracking-tight">{totalTech}+</span>
              <p className="text-[11px] text-indigo-300 font-medium">Tech Stacks &amp; Ikon</p>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-semibold group-hover:bg-indigo-500/30 transition flex items-center gap-0.5">
            <span>Buka Modal</span>
            <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </button>

        {/* Metric 3 */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold text-white tracking-tight">{totalAchievements}</span>
              <p className="text-[11px] text-slate-400 font-medium">Capaian Terukur</p>
            </div>
          </div>
          <span className="text-[10px] text-emerald-400/80 font-semibold uppercase">Hasil Kuantitatif</span>
        </div>
      </div>
    </div>
  );
};
