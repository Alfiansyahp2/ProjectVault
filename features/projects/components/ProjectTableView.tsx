import React from 'react';
import { 
  Briefcase, 
  Sparkles, 
  CheckCircle2, 
  Code2, 
  Globe, 
  ExternalLink, 
  ArrowRight, 
  Copy, 
  Check, 
  Edit3, 
  Trash2 
} from 'lucide-react';
import { ProjectTableViewProps } from '../types';
import { getCategoryBadge, parseAchievements } from '../utils';
import { TechIcon } from '@/components/tech-stack/TechIcon';

export const ProjectTableView: React.FC<ProjectTableViewProps> = ({
  projects,
  onSelect,
  onEdit,
  onDelete,
  copiedId,
  onCopy,
  onOpenTechModal,
}) => {
  return (
    <div className="space-y-4">
      {projects.map((proj) => {
        const bullets = parseAchievements(proj.achievements);

        return (
          <div
            key={proj.id}
            onClick={() => onSelect(proj)}
            className="glass-card rounded-2xl p-6 border border-white/[0.08] hover:border-indigo-500/50 transition-all flex flex-col lg:flex-row gap-6 justify-between group cursor-pointer"
          >
            {/* Left Column: Title, Role, Description, Links */}
            <div className="lg:w-5/12 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getCategoryBadge(proj.category)}`}>
                  {proj.category || 'General'}
                </span>
                {proj.date && (
                  <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.05]">
                    {proj.date}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                {proj.title}
              </h3>

              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <Briefcase className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{proj.role}</span>
              </div>

              <p className="text-xs text-slate-300/90 leading-relaxed">
                {proj.description}
              </p>

              {/* Links */}
              <div className="flex items-center gap-4 text-xs pt-2" onClick={e => e.stopPropagation()}>
                {proj.repo_url && (
                  <a
                    href={proj.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.06] transition cursor-pointer"
                  >
                    <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Repository</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                )}
                {proj.demo_url && (
                  <a
                    href={proj.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/20 transition cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Live Demo</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                )}
              </div>
            </div>

            {/* Right Column: Achievements & Tech Stack */}
            <div className="lg:w-7/12 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-white/[0.08] pt-4 lg:pt-0 lg:pl-6 space-y-4">
              {/* Achievements */}
              {bullets.length > 0 && (
                <div className="p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Dampak Terukur &amp; Capaian Kunci</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                      {bullets.length} Poin
                    </span>
                  </div>
                  <div className="space-y-1">
                    {bullets.slice(0, 2).map((b, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-emerald-200/90 leading-relaxed">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{b}</span>
                      </div>
                    ))}
                    {bullets.length > 2 && (
                      <span className="text-[10px] text-emerald-400/80 font-medium pl-5 block">
                        +{bullets.length - 2} capaian lainnya
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Tech stack & Actions */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-wrap items-center gap-1.5" onClick={e => e.stopPropagation()}>
                  {proj.technologies.map((t, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onOpenTechModal && onOpenTechModal(proj)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-slate-800/80 hover:bg-slate-700/80 border border-white/[0.08] hover:border-indigo-500/40 text-slate-200 transition cursor-pointer"
                      title={`Klik untuk melihat detail teknologi ${t} di modal`}
                    >
                      <TechIcon name={t} size="xs" showBackground={false} />
                      <span>{t}</span>
                    </button>
                  ))}
                  {proj.technologies.length > 0 && onOpenTechModal && (
                    <button
                      type="button"
                      onClick={() => onOpenTechModal(proj)}
                      className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 transition cursor-pointer"
                      title="Buka modal tech stack lengkap proyek ini"
                    >
                      Buka Modal Stack
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => onSelect(proj)}
                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
                  >
                    <span>Lihat Detail Lengkap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => onCopy(proj, e)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] transition cursor-pointer"
                    >
                      {copiedId === proj.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={(e) => onEdit(proj, e)}
                      className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-white/[0.08] transition cursor-pointer"
                      title="Edit Proyek"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => onDelete(proj.id, proj.title, e)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/[0.08] transition cursor-pointer"
                      title="Hapus Proyek"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
