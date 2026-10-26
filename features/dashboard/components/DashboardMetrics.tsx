import React from 'react';
import Link from 'next/link';
import { FolderGit2, Briefcase, Clock, Trophy, ArrowRight, Cpu } from 'lucide-react';

interface DashboardMetricsProps {
  totalProjects: number;
  totalApplications: number;
  interviewCount: number;
  offerCount: number;
  totalTech?: number;
  onOpenTechStackModal?: () => void;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  totalProjects,
  totalApplications,
  interviewCount,
  offerCount,
  totalTech,
  onOpenTechStackModal,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* Metric 1: Bank Proyek */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Bank Proyek
          </span>
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
            <FolderGit2 className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-4 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {totalProjects}
            </span>
            <span className="text-xs font-medium text-slate-400">portofolio</span>
          </div>

          {totalTech !== undefined && (
            <button
              onClick={onOpenTechStackModal}
              className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/25 transition cursor-pointer"
              title="Buka Modal Tech Stack & Ikon"
            >
              {totalTech}+ Tech
            </button>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
          <Link 
            href="/projects" 
            className="group/link inline-flex items-center gap-1 font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
          >
            <span>Kelola Proyek</span>
            <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
          </Link>

          {onOpenTechStackModal && (
            <button
              onClick={onOpenTechStackModal}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-indigo-300 transition cursor-pointer"
              title="Lihat semua ikon dan teknologi dalam modal"
            >
              <Cpu className="w-3 h-3 text-indigo-400" />
              <span>Modal Ikon</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric 2: Total Lamaran */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Lamaran
          </span>
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:scale-110 transition-transform">
            <Briefcase className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {totalApplications}
          </span>
          <span className="text-xs font-medium text-slate-400">perusahaan</span>
        </div>

        <div className="mt-4 pt-3 border-t border-white/[0.06]">
          <Link 
            href="/applications" 
            className="group/link inline-flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300 cursor-pointer"
          >
            <span>Buka Kanban</span>
            <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Metric 3: Wawancara Aktif */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-400/90 uppercase tracking-wider">
            Wawancara Aktif
          </span>
          <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 group-hover:scale-110 transition-transform">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-amber-300 tracking-tight">
            {interviewCount}
          </span>
          <span className="text-xs font-medium text-slate-400">tahap proses</span>
        </div>

        <div className="mt-4 pt-3 border-t border-white/[0.06] text-xs text-slate-400">
          Fokus simulasi wawancara teknis
        </div>
      </div>

      {/* Metric 4: Penawaran Diterima */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-400/90 uppercase tracking-wider">
            Tawaran Diterima
          </span>
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition-transform">
            <Trophy className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-emerald-300 tracking-tight">
            {offerCount}
          </span>
          <span className="text-xs font-medium text-slate-400">penawaran kerja</span>
        </div>

        <div className="mt-4 pt-3 border-t border-white/[0.06] text-xs text-slate-400">
          Target keberhasilan karir Anda
        </div>
      </div>
    </div>
  );
};
