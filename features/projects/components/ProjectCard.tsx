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
import { ProjectCardProps } from '../types';
import { getCategoryBadge, parseAchievements } from '../utils';
import { TechIcon } from '@/components/tech-stack/TechIcon';

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onSelect,
  onEdit,
  onDelete,
  copiedId,
  onCopy,
  onOpenTechModal,
}) => {
  const bullets = parseAchievements(project.achievements);
  const visibleBullets = bullets.slice(0, 2);
  const remainingBullets = bullets.length - visibleBullets.length;

  const visibleTech = project.technologies.slice(0, 5);
  const remainingTech = project.technologies.length - visibleTech.length;

  return (
    <div
      onClick={() => onSelect(project)}
      className="glass-card rounded-2xl p-5 border border-white/[0.08] hover:border-indigo-500/50 transition-all flex flex-col justify-between group cursor-pointer relative"
    >
      <div>
        {/* Top Header: Category & Action Buttons */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getCategoryBadge(project.category)}`}>
              {project.category || 'General'}
            </span>
            {project.date && (
              <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.05]">
                {project.date}
              </span>
            )}
          </div>

          {/* Quick action buttons */}
          <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
            <button
              onClick={(e) => onCopy(project, e)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.08] transition cursor-pointer"
              title="Salin ringkasan proyek untuk AI/CV"
            >
              {copiedId === project.id ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={(e) => onEdit(project, e)}
              className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-white/[0.08] transition cursor-pointer"
              title="Edit Proyek"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => onDelete(project.id, project.title, e)}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/[0.08] transition cursor-pointer"
              title="Hapus Proyek"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
          {project.title}
        </h3>

        {/* Role */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mt-1.5">
          <Briefcase className="w-3.5 h-3.5 text-indigo-400/80 shrink-0" />
          <span className="line-clamp-1">{project.role}</span>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300/90 mt-3 line-clamp-3 leading-relaxed">
          {project.description}
        </p>

        {/* Measurable Impact / Achievements Box */}
        {bullets.length > 0 && (
          <div className="mt-3.5 p-3 rounded-xl bg-emerald-500/[0.07] border border-emerald-500/20 text-xs text-emerald-200/90 font-medium space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Dampak Terukur &amp; Capaian</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                {bullets.length} Poin
              </span>
            </div>
            
            {visibleBullets.map((b, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-[11px] leading-relaxed">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{b}</span>
              </div>
            ))}

            {remainingBullets > 0 && (
              <div className="text-[10px] text-emerald-300/80 pt-1 font-semibold flex items-center gap-1">
                <span>+{remainingBullets} capaian lainnya</span>
                <span className="underline decoration-dotted">(Klik kartu untuk detail)</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Footer: Technologies & External Links */}
      <div className="mt-4 pt-3.5 border-t border-white/[0.06]">
        {/* Tech Tags with TechIcon */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3" onClick={e => e.stopPropagation()}>
          {visibleTech.map((t, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onOpenTechModal && onOpenTechModal(project)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-800/80 hover:bg-slate-700/80 border border-white/[0.08] hover:border-indigo-500/40 text-slate-200 transition cursor-pointer"
              title={`Klik untuk melihat detail teknologi ${t} di modal`}
            >
              <TechIcon name={t} size="xs" showBackground={false} />
              <span>{t}</span>
            </button>
          ))}
          {remainingTech > 0 && (
            <button
              type="button"
              onClick={() => onOpenTechModal && onOpenTechModal(project)}
              className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 transition cursor-pointer"
              title="Buka modal tech stack lengkap proyek ini"
            >
              +{remainingTech} lainnya &bull; Modal
            </button>
          )}
        </div>

        {/* Bottom Action Bar */}
        <div className="flex items-center justify-between text-xs pt-1" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-3">
            {project.repo_url && (
              <a
                href={project.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-slate-400 hover:text-white transition group/link cursor-pointer"
                title="Lihat Repository GitHub / GitLab"
              >
                <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Repo</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover/link:opacity-100" />
              </a>
            )}
            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition group/link cursor-pointer"
                title="Lihat Live Demo"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Demo</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover/link:opacity-100" />
              </a>
            )}
          </div>

          <button
            onClick={() => onSelect(project)}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
          >
            <span>Lihat Detail</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
