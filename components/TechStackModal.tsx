'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Project } from '@/lib/types';
import { X, Layers, Sparkles, Cpu } from 'lucide-react';
import { TechCategory } from './tech-stack/tech-taxonomy';
import { useTechAggregation } from './tech-stack/use-tech-aggregation';
import { TechCategoryTabs } from './tech-stack/TechCategoryTabs';
import { TechEcosystemGrid } from './tech-stack/TechEcosystemGrid';
import { ProjectTechBreakdown } from './tech-stack/ProjectTechBreakdown';

interface TechStackModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  initialProject?: Project | null;
  onSelectProject?: (project: Project) => void;
}

export default function TechStackModal({
  isOpen,
  onClose,
  projects,
  initialProject = null,
  onSelectProject,
}: TechStackModalProps) {
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'project'>('all');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | TechCategory>('ALL');
  const [expandedTech, setExpandedTech] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialProject) {
      setCurrentProject(initialProject);
      setViewMode('project');
    } else {
      setViewMode('all');
    }
    setSearchQuery('');
    setSelectedCategory('ALL');
    setExpandedTech(null);
  }, [initialProject, isOpen]);

  const {
    aggregatedTech,
    projectTechGrouped,
    categoryCounts,
    filteredTech,
  } = useTechAggregation(projects, currentProject, searchQuery, selectedCategory);

  if (!isOpen || !mounted) return null;

  const handleCopyTechList = (list: string[]) => {
    const text = list.join(', ');
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative bg-[#0b1220] border border-white/[0.12] rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl shadow-indigo-500/10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4.5 border-b border-white/[0.08] bg-slate-900/70 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-inner shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                  {viewMode === 'project' && currentProject
                    ? `Tech Stack: ${currentProject.title}`
                    : 'Ekosistem Tech Stack & Ikon'}
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {viewMode === 'project' && currentProject
                    ? `${currentProject.technologies?.length || 0} Teknologi`
                    : `${aggregatedTech.length} Teknologi Unik`}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                {viewMode === 'project'
                  ? 'Daftar teknologi dan peran arsitektural proyek terpilih.'
                  : 'Katalog terpusat seluruh keahlian teknis dari semua portofolio proyek.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentProject && (
              <div className="flex items-center p-1 rounded-xl bg-slate-800/80 border border-white/[0.06] text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('project')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                    viewMode === 'project'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Proyek Ini
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                    viewMode === 'all'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Semua Ekosistem
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition cursor-pointer"
              aria-label="Tutup modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {viewMode === 'project' && currentProject ? (
            <ProjectTechBreakdown
              currentProject={currentProject}
              projectTechGrouped={projectTechGrouped}
              onExploreAll={() => setViewMode('all')}
            />
          ) : (
            <div className="space-y-6">
              <TechCategoryTabs
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                categoryCounts={categoryCounts}
                filteredCount={filteredTech.length}
                onCopyAll={() => handleCopyTechList(filteredTech.map((t) => t.name))}
                copiedText={copiedText}
              />

              <TechEcosystemGrid
                filteredTech={filteredTech}
                expandedTech={expandedTech}
                onToggleExpand={(name) =>
                  setExpandedTech(expandedTech === name ? null : name)
                }
                onSelectProject={onSelectProject}
                onViewProjectMode={(p) => {
                  setCurrentProject(p);
                  setViewMode('project');
                }}
                searchQuery={searchQuery}
                onResetFilter={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-white/[0.08] bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Single Source of Truth Tech Stack ProjectVault</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.15] text-white transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
