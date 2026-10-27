'use client';

import React from 'react';
import { Project } from '@/lib/types';
import { ArrowRight, Sparkles } from 'lucide-react';
import { TechIcon } from './TechIcon';
import { getTechMeta, TechCategory } from './tech-taxonomy';

interface ProjectTechBreakdownProps {
  currentProject: Project;
  projectTechGrouped: { category: TechCategory; technologies: string[] }[];
  onExploreAll: () => void;
}

export const ProjectTechBreakdown: React.FC<ProjectTechBreakdownProps> = ({
  currentProject,
  projectTechGrouped,
  onExploreAll,
}) => {
  return (
    <div className="space-y-6">
      {/* Active Project Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900/60 to-indigo-950/60 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
              {currentProject.category}
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs font-medium text-slate-300">
              {currentProject.role}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-white mt-1">
            {currentProject.title}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
            {currentProject.description}
          </p>
        </div>

        <button
          type="button"
          onClick={onExploreAll}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 transition shrink-0 cursor-pointer"
        >
          <span>Eksplor Semua Ekosistem</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Categorized Tech Stacks */}
      <div className="space-y-5">
        {projectTechGrouped.map((group) => (
          <div key={group.category} className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span>{group.category}</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-400">
                {group.technologies.length} item
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {group.technologies.map((t, idx) => {
                const meta = getTechMeta(t);
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-900/60 border border-white/[0.08] hover:border-indigo-500/40 transition-all flex items-center gap-3 group"
                  >
                    <TechIcon name={t} size="lg" />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-300 transition truncate">
                        {t}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {meta.category}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
