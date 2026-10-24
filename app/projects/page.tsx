'use client';

import React, { useState, useEffect } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { Project, UserProfile } from '@/lib/types';
import { getProjects, saveProject, deleteProject, getUserProfile } from '@/lib/storage';
import ProjectModal from '@/components/ProjectModal';
import AiPromptModal from '@/components/AiPromptModal';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [profile, setProfile] = useState<UserProfile>({ name: '', headline: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const loadData = async () => {
    const p = await getProjects();
    const prof = getUserProfile();
    setProjects(p);
    setProfile(prof);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (project: Project) => {
    await saveProject(project);
    loadData();
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus proyek "${title}" dari bank data?`)) {
      await deleteProject(id);
      loadData();
    }
  };

  const copySingleProject = (p: Project) => {
    const text = `### Proyek: ${p.title} (${p.role})\nKategori: ${p.category}\nTeknologi: ${p.technologies.join(', ')}\nDeskripsi: ${p.description}${p.achievements ? `\nHasil Nyata: ${p.achievements}` : ''}${p.repo_url ? `\nRepo: ${p.repo_url}` : ''}${p.demo_url ? `\nDemo: ${p.demo_url}` : ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter projects
  const filteredProjects = projects.filter(p => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.technologies.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = ['ALL', ...Array.from(new Set(projects.map(p => p.category).filter(Boolean)))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/10 shrink-0">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Bank Proyek &amp; Portofolio
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Single Source of Truth untuk seluruh riwayat proyek, peran, tech stack, dan capaian terukur.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
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

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama proyek, teknologi (Python, Next.js, Go, dll), atau peran..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-white/10 bg-[#0b1220] text-white placeholder:text-slate-500 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-white/10 bg-[#0b1220] text-white focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 outline-none transition cursor-pointer"
          >
            {categories.map((c, i) => (
              <option key={i} value={c} className="bg-[#090d16]">
                {c === 'ALL' ? 'Semua Kategori' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((proj) => (
          <div
            key={proj.id}
            className="glass-card rounded-2xl p-5 border border-white/[0.08] hover:border-indigo-500/40 transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Header card */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/25">
                    {proj.category || 'General'}
                  </span>
                  <h3 className="text-base font-bold text-white mt-2 group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {proj.title}
                  </h3>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">
                    {proj.role} {proj.date && `• ${proj.date}`}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => copySingleProject(proj)}
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

              {/* Description */}
              <p className="text-xs text-slate-300 mt-3 line-clamp-3 leading-relaxed">
                {proj.description}
              </p>

              {/* Achievements / Metrics */}
              {proj.achievements && (
                <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 text-[11px] text-emerald-300 font-medium">
                  <span className="font-bold text-emerald-400">★ Dampak Terukur:</span> {proj.achievements}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3.5 border-t border-white/[0.06]">
              {/* Tech Tags */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {proj.technologies.map((t, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-800/80 border border-white/[0.08] text-slate-300"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Links */}
              <div className="flex items-center gap-4 text-xs">
                {proj.repo_url && (
                  <a
                    href={proj.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-slate-400 hover:text-white transition"
                  >
                    <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Repository</span>
                  </a>
                )}
                {proj.demo_url && (
                  <a
                    href={proj.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 transition"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Live Demo</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-16 glass-panel rounded-3xl border border-dashed border-white/10 p-8">
          <FolderGit2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200">
            Tidak ada proyek yang sesuai pencarian
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Coba ubah kata kunci filter atau tambahkan proyek baru ke bank portofolio.
          </p>
        </div>
      )}

      {/* Modals */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSave}
        initialData={editingProject}
      />
      <AiPromptModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        projects={projects}
        profile={profile}
      />
    </div>
  );
}
