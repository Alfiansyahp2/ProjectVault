'use client';

import React from 'react';
import { Project } from '@/lib/types';
import { 
  Briefcase, 
  Code2, 
  Globe, 
  ExternalLink, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Cpu 
} from 'lucide-react';
import { TechIcon } from '@/components/tech-stack/TechIcon';

interface ProjectDetailBodyProps {
  project: Project;
  bulletPoints: string[];
  onOpenTechModal?: (project: Project) => void;
}

export const ProjectDetailBody: React.FC<ProjectDetailBodyProps> = ({
  project,
  bulletPoints,
  onOpenTechModal,
}) => {
  return (
    <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
      {/* Header Title & Role */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
          {project.title}
        </h2>
        <div className="flex items-center gap-2 mt-2 text-sm font-medium text-slate-300">
          <Briefcase className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{project.role}</span>
        </div>
      </div>

      {/* Repository & Live Demo Links */}
      {(project.repo_url || project.demo_url) && (
        <div className="flex items-center gap-3 flex-wrap pt-1">
          {project.repo_url && (
            <a
              href={project.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition group"
            >
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span>Kunjungi Repository</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition" />
            </a>
          )}
          {project.demo_url && (
            <a
              href={project.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 transition group"
            >
              <Globe className="w-4 h-4 text-sky-400" />
              <span>Buka Live Demo</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition" />
            </a>
          )}
        </div>
      )}

      {/* Description Section */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-indigo-400" />
          <span>Deskripsi Arsitektur &amp; Gambaran Sistem</span>
        </h4>
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-sm text-slate-200 leading-relaxed whitespace-pre-line">
          {project.description}
        </div>
      </div>

      {/* Measurable Achievements / Impact */}
      {bulletPoints.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dampak Terukur &amp; Capaian Kunci ({bulletPoints.length})</span>
          </h4>
          <div className="space-y-2.5">
            {bulletPoints.map((point, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/20 text-xs sm:text-sm text-emerald-200 leading-relaxed"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="flex-1">{point}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technologies Stack */}
      {project.technologies && project.technologies.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Teknologi &amp; Tech Stack ({project.technologies.length})</span>
            </h4>

            {onOpenTechModal && (
              <button
                onClick={() => onOpenTechModal(project)}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Buka di Modal Stack</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {project.technologies.map((t, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onOpenTechModal && onOpenTechModal(project)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 border border-white/[0.1] hover:border-indigo-500/40 text-slate-200 shadow-sm transition cursor-pointer"
                title={`Lihat detail ${t} di modal`}
              >
                <TechIcon name={t} size="xs" showBackground={false} />
                <span>{t}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
