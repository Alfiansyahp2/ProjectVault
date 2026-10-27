import React from 'react';
import Link from 'next/link';
import { FolderGit2, Plus, ArrowRight, Copy, Check, Cpu } from 'lucide-react';
import { Project } from '@/lib/types';
import { TechIcon } from '@/components/tech-stack/TechIcon';

interface RecentProjectsCardProps {
  projects: Project[];
  copiedId: string | null;
  onCopySummary: (p: Project) => void;
  onAddProject: () => void;
  onOpenTechStackModal?: (project?: Project) => void;
}

export const RecentProjectsCard: React.FC<RecentProjectsCardProps> = ({
  projects,
  copiedId,
  onCopySummary,
  onAddProject,
  onOpenTechStackModal,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <FolderGit2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Bank Proyek Pilihan
            </h2>
            <p className="text-xs text-slate-400">Bukti karya nyata &amp; capaian terukur</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenTechStackModal && (
            <button
              onClick={() => onOpenTechStackModal()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-indigo-300 border border-white/[0.08] hover:border-indigo-500/30 transition cursor-pointer"
              title="Lihat semua tech stack dan ikon di ekosistem proyek"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Eksplor Tech Stack</span>
              <span className="sm:hidden">Tech Stack</span>
            </button>
          )}

          <button
            onClick={onAddProject}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>
        </div>
      </div>

      <div className="space-y-3.5">
        {projects.slice(0, 3).map((proj) => {
          const bullets = (proj.achievements || '')
            .split(/\n|•|\*/)
            .map((s) => s.trim())
            .filter(Boolean);
          const firstBullet = bullets[0] || proj.achievements;
          const visibleTech = proj.technologies.slice(0, 4);
          const remainingTech = proj.technologies.length - visibleTech.length;

          return (
            <div
              key={proj.id}
              className="glass-card rounded-2xl p-5 border border-white/[0.08] hover:border-indigo-500/40 transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                    {proj.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className="font-semibold text-indigo-400">{proj.role}</span>
                    <span className="text-slate-600">&bull;</span>
                    <span className="text-slate-400">{proj.category}</span>
                  </div>
                </div>

                <button
                  onClick={() => onCopySummary(proj)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/60 border border-white/[0.08] text-xs flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                  title="Salin ringkasan proyek untuk AI eksternal"
                >
                  {copiedId === proj.id ? (
                    <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-semibold">
                      <Check className="w-3.5 h-3.5" /> Tersalin
                    </span>
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-300/90 mt-2 line-clamp-2 leading-relaxed">
                {proj.description}
              </p>

              {firstBullet && (
                <div className="mt-2.5 flex items-center justify-between gap-2 bg-emerald-500/[0.07] border border-emerald-500/20 text-emerald-300 text-xs px-3 py-1.5 rounded-xl">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-emerald-400 text-xs shrink-0">★</span>
                    <span className="leading-snug text-[11px] font-medium truncate">{firstBullet}</span>
                  </div>
                  {bullets.length > 1 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 shrink-0 font-semibold">
                      +{bullets.length - 1} capaian
                    </span>
                  )}
                </div>
              )}

              {/* Tech Stack Pills with Icons */}
              <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2.5 border-t border-white/[0.06]">
                {visibleTech.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => onOpenTechStackModal && onOpenTechStackModal(proj)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-slate-800/80 hover:bg-slate-700/80 border border-white/[0.08] hover:border-indigo-500/40 text-slate-200 transition cursor-pointer"
                    title={`Klik untuk melihat detail tech stack ${t} dalam modal`}
                  >
                    <TechIcon name={t} size="xs" showBackground={false} />
                    <span>{t}</span>
                  </button>
                ))}
                {remainingTech > 0 && (
                  <button
                    onClick={() => onOpenTechStackModal && onOpenTechStackModal(proj)}
                    className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition cursor-pointer"
                    title="Buka modal semua teknologi proyek ini"
                  >
                    +{remainingTech} lainnya
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {projects.length === 0 && (
          <div className="text-center py-12 glass-panel rounded-2xl border border-dashed border-white/10 p-6">
            <FolderGit2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-xs text-slate-400 font-medium">Belum ada portofolio proyek tersimpan.</p>
            <button
              onClick={onAddProject}
              className="mt-3 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
            >
              + Tambahkan Proyek Pertama Anda
            </button>
          </div>
        )}

        <div className="pt-1 flex items-center justify-between text-xs">
          {onOpenTechStackModal ? (
            <button
              onClick={() => onOpenTechStackModal()}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-indigo-300 transition cursor-pointer font-medium"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Modal Tech Stack &amp; Ikon</span>
            </button>
          ) : <div />}

          <Link 
            href="/projects" 
            className="group inline-flex items-center gap-1.5 font-bold text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
          >
            <span>Lihat Seluruh {projects.length} Proyek</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

