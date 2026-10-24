'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  FolderGit2, 
  Plus, 
  Search, 
  Copy, 
  Check, 
  Edit3, 
  Trash2, 
  Code2, 
  Globe, 
  Sparkles,
  BrainCircuit,
  Filter,
  ArrowRight,
  ExternalLink,
  LayoutGrid,
  List,
  Calendar,
  Briefcase,
  Layers,
  X,
  RefreshCw,
  CheckCircle2,
  TrendingUp,
  Award
} from 'lucide-react';
import { Project, UserProfile } from '@/lib/types';
import { getProjects, saveProject, deleteProject, getUserProfile } from '@/lib/storage';
import ProjectModal from '@/components/ProjectModal';
import AiPromptModal from '@/components/AiPromptModal';
import ProjectDetailModal from '@/components/ProjectDetailModal';

// Helper to parse bullet points cleanly from text
function parseAchievements(text?: string): string[] {
  if (!text) return [];
  return text
    .split(/\n|•|\*/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

// Category color badges with tailored dark-mode aesthetics
function getCategoryBadge(category?: string) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('machine learning') || cat.includes('ai') || cat.includes('nlp')) {
    return 'bg-purple-500/10 text-purple-300 border-purple-500/25';
  }
  if (cat.includes('workflow') || cat.includes('distributed')) {
    return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25';
  }
  if (cat.includes('data engineering') || cat.includes('analytics') || cat.includes('bi')) {
    return 'bg-amber-500/10 text-amber-300 border-amber-500/25';
  }
  if (cat.includes('full stack') || cat.includes('edtech')) {
    return 'bg-sky-500/10 text-sky-300 border-sky-500/25';
  }
  if (cat.includes('web portal') || cat.includes('search')) {
    return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25';
  }
  return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/25';
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [profile, setProfile] = useState<UserProfile>({ name: '', headline: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [detailProject, setDetailProject] = useState<Project | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const p = await getProjects();
      const prof = getUserProfile();
      setProjects(p);
      setProfile(prof);
    } catch (e) {
      console.error('Error loading projects:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (project: Project) => {
    await saveProject(project);
    await loadData();
    if (detailProject && detailProject.id === project.id) {
      setDetailProject(project);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus proyek "${title}" dari bank data?`)) {
      await deleteProject(id);
      if (detailProject && detailProject.id === id) {
        setDetailProject(null);
      }
      loadData();
    }
  };

  const copySingleProject = (p: Project, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const bullets = parseAchievements(p.achievements);
    let text = `### Proyek: ${p.title} (${p.role})\nKategori: ${p.category}\nTeknologi: ${p.technologies.join(', ')}\nDeskripsi: ${p.description}`;
    if (bullets.length > 0) {
      text += `\nCapaian & Dampak Terukur:\n` + bullets.map(b => `- ${b}`).join('\n');
    }
    if (p.repo_url) text += `\nRepo: ${p.repo_url}`;
    if (p.demo_url) text += `\nDemo: ${p.demo_url}`;

    navigator.clipboard.writeText(text);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        p.title.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.achievements && p.achievements.toLowerCase().includes(q)) ||
        p.technologies.some(t => t.toLowerCase().includes(q))
      );

      const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [projects, searchQuery, selectedCategory]);

  // Aggregate category counts
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach(p => {
      const cat = p.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [projects]);

  const categories = useMemo(() => {
    return ['ALL', ...Object.keys(categoryStats)];
  }, [categoryStats]);

  // Metrics summary
  const totalTech = useMemo(() => {
    const all = new Set<string>();
    projects.forEach(p => p.technologies.forEach(t => all.add(t.toLowerCase().trim())));
    return all.size;
  }, [projects]);

  const totalAchievements = useMemo(() => {
    return projects.reduce((acc, p) => acc + parseAchievements(p.achievements).length, 0);
  }, [projects]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      
      {/* Top Header Banner */}
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
              <span><strong>{projects.length}</strong> Proyek Unggulan</span>
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
            onClick={() => loadData()}
            className="p-2.5 rounded-xl text-xs font-semibold border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 transition"
            title="Muat ulang data dari Cloud / Database"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-white/[0.1] bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 transition"
          >
            <BrainCircuit className="w-4 h-4 text-indigo-400" />
            <span>Salin Konteks AI</span>
          </button>
          
          <button
            onClick={() => {
              setEditingProject(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Proyek</span>
          </button>
        </div>
      </div>

      {/* Search, Filter Tabs & View Switcher */}
      <div className="space-y-4">
        {/* Search input + View Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama proyek, teknologi (Python, Next.js, Go, dll), peran, atau dampak..."
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-white/10 bg-[#0b1220] text-white placeholder:text-slate-500 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                title="Hapus pencarian"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* View Mode Toggle Button */}
          <div className="flex items-center gap-1 p-1 bg-[#0b1220] border border-white/10 rounded-xl shrink-0 self-end sm:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Tampilan Grid Card"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Tampilan List / Baris Komprehensif"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>

        {/* Interactive Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((c, i) => {
            const count = c === 'ALL' ? projects.length : (categoryStats[c] || 0);
            const isSelected = selectedCategory === c;
            return (
              <button
                key={i}
                onClick={() => setSelectedCategory(c)}
                className={`whitespace-nowrap flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                    : 'bg-white/[0.04] text-slate-400 hover:text-slate-200 border border-white/[0.06] hover:bg-white/[0.08]'
                }`}
              >
                <span>{c === 'ALL' ? 'Semua Kategori' : c}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-indigo-500/30 text-indigo-200' : 'bg-white/[0.08] text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Result Indicator */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Menampilkan <strong>{filteredProjects.length}</strong> dari {projects.length} proyek</span>
        {searchQuery && (
          <span>Filter aktif: &ldquo;{searchQuery}&rdquo;</span>
        )}
      </div>

      {/* PROJECTS CONTAINER */}
      {viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => {
            const bullets = parseAchievements(proj.achievements);
            const visibleBullets = bullets.slice(0, 2);
            const remainingBullets = bullets.length - visibleBullets.length;

            const visibleTech = proj.technologies.slice(0, 5);
            const remainingTech = proj.technologies.length - visibleTech.length;

            return (
              <div
                key={proj.id}
                onClick={() => setDetailProject(proj)}
                className="glass-card rounded-2xl p-5 border border-white/[0.08] hover:border-indigo-500/50 transition-all flex flex-col justify-between group cursor-pointer relative"
              >
                <div>
                  {/* Top Header: Category & Action Buttons */}
                  <div className="flex items-start justify-between gap-2 mb-3">
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

                    {/* Quick action buttons */}
                    <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={(e) => copySingleProject(proj, e)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.08] transition"
                        title="Salin ringkasan proyek untuk AI/CV"
                      >
                        {copiedId === proj.id ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setEditingProject(proj);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-white/[0.08] transition"
                        title="Edit Proyek"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(proj.id, proj.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/[0.08] transition"
                        title="Hapus Proyek"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title (Full readable line-clamp-2) */}
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
                    {proj.title}
                  </h3>

                  {/* Role */}
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mt-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-400/80 shrink-0" />
                    <span className="line-clamp-1">{proj.role}</span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300/90 mt-3 line-clamp-3 leading-relaxed">
                    {proj.description}
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
                  {/* Tech Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {visibleTech.map((t, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-800/80 border border-white/[0.08] text-slate-300"
                      >
                        {t}
                      </span>
                    ))}
                    {remainingTech > 0 && (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                        +{remainingTech} lainnya
                      </span>
                    )}
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="flex items-center justify-between text-xs pt-1" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-3">
                      {proj.repo_url && (
                        <a
                          href={proj.repo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-slate-400 hover:text-white transition group/link"
                          title="Lihat Repository GitHub / GitLab"
                        >
                          <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Repo</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover/link:opacity-100" />
                        </a>
                      )}
                      {proj.demo_url && (
                        <a
                          href={proj.demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition group/link"
                          title="Lihat Live Demo"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>Demo</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover/link:opacity-100" />
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => setDetailProject(proj)}
                      className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
                    >
                      <span>Lihat Detail</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST / EXPANDED VIEW */
        <div className="space-y-4">
          {filteredProjects.map((proj) => {
            const bullets = parseAchievements(proj.achievements);

            return (
              <div
                key={proj.id}
                onClick={() => setDetailProject(proj)}
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
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.06] transition"
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
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/20 transition"
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
                    <div className="p-3.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Dampak Terukur &amp; Capaian Kunci</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                          {bullets.length} Capaian
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {bullets.map((b, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-emerald-200/90 leading-relaxed">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tech stack & Actions */}
                  <div className="space-y-3 pt-2">
                    <div className="flex flex-wrap gap-1.5">
                      {proj.technologies.map((t, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-slate-800/80 border border-white/[0.08] text-slate-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setDetailProject(proj)}
                        className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
                      >
                        <span>Lihat Detail Lengkap</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => copySingleProject(proj, e)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] transition"
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
                          onClick={() => {
                            setEditingProject(proj);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-white/[0.08] transition"
                          title="Edit Proyek"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(proj.id, proj.title)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/[0.08] transition"
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
      )}

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-16 glass-panel rounded-3xl border border-dashed border-white/10 p-8 space-y-3">
          <FolderGit2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">
            Tidak ada proyek yang sesuai dengan kriteria pencarian
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Coba bersihkan kata kunci pencarian atau ubah filter kategori untuk melihat proyek lainnya.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/[0.08] transition"
          >
            Reset Semua Filter
          </button>
        </div>
      )}

      {/* DETAIL MODAL */}
      <ProjectDetailModal
        isOpen={Boolean(detailProject)}
        project={detailProject}
        onClose={() => setDetailProject(null)}
        onEdit={(p) => {
          setEditingProject(p);
          setIsModalOpen(true);
        }}
        onDelete={handleDelete}
      />

      {/* CREATE / EDIT MODAL */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSave}
        initialData={editingProject}
      />

      {/* AI PROMPT MODAL */}
      <AiPromptModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        projects={projects}
        profile={profile}
      />
    </div>
  );
}
