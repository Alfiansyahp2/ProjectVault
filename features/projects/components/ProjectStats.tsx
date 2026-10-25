import React from 'react';
import { 
  FolderGit2, 
  Layers, 
  TrendingUp, 
  RefreshCw, 
  Sparkles, 
  BrainCircuit, 
  Plus 
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
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/[0.08] pb-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/10 shrink-0">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Bank Proyek &amp; Portofolio
              </h1>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                Single Source of Truth
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Katalog rekam jejak arsitektur sistem, peran kepemimpinan, tech stack, dan capaian terukur siap pakai untuk interview.
            </p>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap mt-4 text-xs font-medium text-slate-300">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
            <span><strong>{totalProjects}</strong> Proyek Unggulan</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span><strong>{totalTech}+</strong> Tech Stacks</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span><strong>{totalAchievements}</strong> Capaian Terukur</span>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex items-center gap-3 shrink-0 flex-wrap">
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
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 shadow-sm shadow-emerald-500/10 transition disabled:opacity-50 cursor-pointer"
          title="Scan data/project/project.md, generate proyek baru dari link/folder, dan sinkronkan ke database"
        >
          <Sparkles className={`w-4 h-4 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Menyinkronkan...' : 'Generate dari project.md'}</span>
        </button>

        <button
          onClick={onOpenAiPrompt}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-white/[0.1] bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 transition cursor-pointer"
        >
          <BrainCircuit className="w-4 h-4 text-indigo-400" />
          <span>Salin Konteks AI</span>
        </button>
        
        <button
          onClick={onAddProject}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Proyek</span>
        </button>
      </div>
    </div>
  );
};
