'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Project } from '@/lib/types';
import { TechIcon, getTechMeta, TechCategory } from './tech-stack/TechIcon';
import {
  X,
  Search,
  Layers,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  FolderGit2,
  Cpu,
  ArrowRight,
  Filter,
  CheckCircle2,
  Code2,
} from 'lucide-react';

interface TechStackModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  initialProject?: Project | null;
  onSelectProject?: (project: Project) => void;
}

const CATEGORIES: { label: string; value: 'ALL' | TechCategory }[] = [
  { label: 'Semua', value: 'ALL' },
  { label: 'Frontend', value: 'Frontend' },
  { label: 'Backend', value: 'Backend' },
  { label: 'Database & Cache', value: 'Database & Cache' },
  { label: 'DevOps & Cloud', value: 'DevOps & Cloud' },
  { label: 'AI & Data', value: 'AI & Machine Learning' },
  { label: 'Mobile', value: 'Mobile' },
  { label: 'Testing & Tools', value: 'Testing & Tools' },
];

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

  // Sync initial project when modal opens
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

  // Aggregate all unique technologies across all projects with project references
  const aggregatedTech = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        meta: ReturnType<typeof getTechMeta>;
        projects: Project[];
      }
    >();

    projects.forEach((proj) => {
      (proj.technologies || []).forEach((rawTech) => {
        const clean = rawTech.trim();
        if (!clean) return;
        const key = clean.toLowerCase();
        if (!map.has(key)) {
          map.set(key, {
            name: clean,
            meta: getTechMeta(clean),
            projects: [],
          });
        }
        const entry = map.get(key)!;
        if (!entry.projects.some((p) => p.id === proj.id)) {
          entry.projects.push(proj);
        }
      });
    });

    return Array.from(map.values()).sort((a, b) => {
      // Sort by number of projects descending, then alphabetically
      if (b.projects.length !== a.projects.length) {
        return b.projects.length - a.projects.length;
      }
      return a.name.localeCompare(b.name);
    });
  }, [projects]);

  // Filtered aggregated technologies
  const filteredTech = useMemo(() => {
    return aggregatedTech.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.meta.category.toLowerCase().includes(q) ||
        t.projects.some((p) => p.title.toLowerCase().includes(q));

      const matchesCat =
        selectedCategory === 'ALL' || t.meta.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [aggregatedTech, searchQuery, selectedCategory]);

  // Calculate category stats
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: aggregatedTech.length };
    aggregatedTech.forEach((t) => {
      counts[t.meta.category] = (counts[t.meta.category] || 0) + 1;
    });
    return counts;
  }, [aggregatedTech]);

  // Group technologies for single project view
  const projectTechGrouped = useMemo(() => {
    if (!currentProject) return [];
    const groups: Record<TechCategory, string[]> = {
      Frontend: [],
      Backend: [],
      'Database & Cache': [],
      'DevOps & Cloud': [],
      'AI & Machine Learning': [],
      Mobile: [],
      'Testing & Tools': [],
      Other: [],
    };

    (currentProject.technologies || []).forEach((t) => {
      const meta = getTechMeta(t);
      groups[meta.category].push(t);
    });

    return Object.entries(groups)
      .filter(([_, list]) => list.length > 0)
      .map(([cat, list]) => ({
        category: cat as TechCategory,
        technologies: list,
      }));
  }, [currentProject]);

  const handleCopyTechList = (techs: string[]) => {
    const text = techs.join(', ');
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative bg-[#0b1220] border border-white/[0.12] rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl shadow-indigo-500/15 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-gradient-to-r from-indigo-500/20 via-sky-500/20 to-purple-500/20 blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative shrink-0 px-6 py-5 border-b border-white/[0.08] bg-slate-900/80 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-sky-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/10 shrink-0">
              <Cpu className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {viewMode === 'project' && currentProject
                    ? `Tech Stack: ${currentProject.title}`
                    : 'Ekosistem Tech Stack & Tooling'}
                </h2>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  {viewMode === 'project' && currentProject
                    ? `${currentProject.technologies.length} Teknologi`
                    : `${aggregatedTech.length} Total Tech`}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {viewMode === 'project' && currentProject
                  ? `Daftar arsitektur dan pustaka yang digunakan pada ${currentProject.role}`
                  : 'Katalog interaktif seluruh bahasa, framework, database, dan alat perbankan proyek'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {/* View Mode Toggle Button */}
            {currentProject && (
              <div className="flex items-center p-1 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs font-semibold">
                <button
                  onClick={() => setViewMode('project')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === 'project'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Proyek Ini
                </button>
                <button
                  onClick={() => setViewMode('all')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === 'all'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Semua ({aggregatedTech.length})
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.08] transition cursor-pointer"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* ====================================================
              MODE A: SINGLE PROJECT TECH STACK
             ==================================================== */}
          {viewMode === 'project' && currentProject && (
            <div className="space-y-6">
              {/* Project Quick Info Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-950/80 border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      {currentProject.category || 'Portofolio'}
                    </span>
                    {currentProject.date && (
                      <span className="text-[10px] text-slate-400">
                        {currentProject.date}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {currentProject.title}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Peran: <strong className="text-indigo-400">{currentProject.role}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopyTechList(currentProject.technologies)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/[0.08] transition cursor-pointer"
                  >
                    {copiedText ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Salin Stack</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setViewMode('all')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition cursor-pointer"
                  >
                    <span>Eksplor Semua Ekosistem</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
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
          )}

          {/* ====================================================
              MODE B: ALL ECOSYSTEM TECH STACK
             ==================================================== */}
          {viewMode === 'all' && (
            <div className="space-y-6">
              {/* Search Bar & Stats */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari teknologi, framework, atau database (misal: React, Python, Docker)..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-900/80 border border-white/[0.08] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                    >
                      Bersihkan
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleCopyTechList(filteredTech.map((t) => t.name))}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/[0.08] transition shrink-0 cursor-pointer"
                  title="Salin daftar teknologi yang difilter"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Salin Semua ({filteredTech.length})</span>
                    </>
                  )}
                </button>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {CATEGORIES.map((cat) => {
                  const count = categoryCounts[cat.value] || 0;
                  const isActive = selectedCategory === cat.value;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 flex items-center gap-1.5 transition cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20'
                          : 'bg-white/[0.04] text-slate-400 hover:text-slate-200 border border-white/[0.06]'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-white/[0.06] text-slate-400'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

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
                              onClick={() =>
                                setExpandedTech(isExpanded ? null : item.name)
                              }
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
                                    setCurrentProject(p);
                                    setViewMode('project');
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
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('ALL');
                    }}
                    className="mt-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  >
                    Reset Filter
                  </button>
                </div>
              )}
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
