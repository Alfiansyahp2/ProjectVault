'use client';

import React from 'react';
import { Project } from '@/lib/types';
import { FolderGit2, ArrowRight, Cpu } from 'lucide-react';
import { TechIcon } from './TechIcon';
import { AggregatedTechItem } from './use-tech-aggregation';

interface TechEcosystemGridProps {
  filteredTech: AggregatedTechItem[];
  expandedTech: string | null;
  onToggleExpand: (techName: string) => void;
  onSelectProject?: (project: Project) => void;
  onViewProjectMode: (project: Project) => void;
  searchQuery: string;
  onResetFilter: () => void;
}

export const TechEcosystemGrid: React.FC<TechEcosystemGridProps> = ({
  filteredTech,
  expandedTech,
  onToggleExpand,
  onSelectProject,
  onViewProjectMode,
  searchQuery,
  onResetFilter,
}) => {
  return (
    <div>
      {/* Tech Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredTech.map((item) => {
          const isExpanded = expandedTech === item.name;
          return (
            <div
              key={item.name}
              className={`p-4 rounded-2xl border transition-all ${
                isExpanded
                  ? 'bg-slate-900/90 border-indigo-500/50 shadow-xl shadow-indigo-500/10'
                  : 'bg-slate-900/60 border-white/[0.08] hover:border-white/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <TechIcon name={item.name} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                      {item.name}
                    </h4>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                      style={{
                        color: item.meta.color,
                        backgroundColor: item.meta.bgColor,
                      }}
                    >
                      {item.meta.category}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-[11px]">
                      <FolderGit2 className="w-3 h-3 text-indigo-400" />
                      <span>{item.projects.length} Proyek Terkait</span>
                    </span>

                    <button
                      onClick={() => onToggleExpand(item.name)}
                      className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
                    >
                      {isExpanded ? 'Tutup Proyek' : 'Lihat Proyek'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Projects Sub-list */}
              {isExpanded && (
                <div className="mt-3.5 pt-3 border-t border-white/[0.08] space-y-2 animate-in fade-in duration-150">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Digunakan pada:
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {item.projects.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          if (onSelectProject) {
                            onSelectProject(p);
                          } else {
                            onViewProjectMode(p);
                          }
                        }}
                        className="p-2 rounded-xl bg-white/[0.04] hover:bg-indigo-600/20 border border-white/[0.05] hover:border-indigo-500/30 transition flex items-center justify-between gap-2 text-xs text-slate-200 cursor-pointer group/p"
                      >
                        <div className="truncate">
                          <p className="font-semibold truncate text-[11px] group-hover/p:text-indigo-300">
                            {p.title}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {p.role}
                          </span>
                        </div>
                        <ArrowRight className="w-3 h-3 text-slate-500 group-hover/p:text-indigo-400 group-hover/p:translate-x-0.5 transition" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty Search State */}
      {filteredTech.length === 0 && (
        <div className="text-center py-12 glass-panel rounded-2xl border border-dashed border-white/10 p-6 space-y-2">
          <Cpu className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-xs sm:text-sm font-semibold text-slate-300">
            Tidak ada teknologi yang cocok dengan &quot;{searchQuery}&quot;
          </p>
          <p className="text-xs text-slate-500">
            Coba ganti kata kunci pencarian atau pilih kategori &quot;Semua&quot;.
          </p>
          <button
            onClick={onResetFilter}
            className="mt-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
          >
            Reset Filter
          </button>
        </div>
      )}
    </div>
  );
};
