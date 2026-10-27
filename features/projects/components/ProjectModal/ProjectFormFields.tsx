'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface ProjectFormFieldsProps {
  title: string;
  setTitle: (val: string) => void;
  role: string;
  setRole: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  date: string;
  setDate: (val: string) => void;
  techInput: string;
  setTechInput: (val: string) => void;
  technologies: string[];
  onAddTech: () => void;
  onRemoveTech: (index: number) => void;
  description: string;
  setDescription: (val: string) => void;
  achievements: string;
  setAchievements: (val: string) => void;
  repoUrl: string;
  setRepoUrl: (val: string) => void;
  demoUrl: string;
  setDemoUrl: (val: string) => void;
}

export const ProjectFormFields: React.FC<ProjectFormFieldsProps> = ({
  title,
  setTitle,
  role,
  setRole,
  category,
  setCategory,
  date,
  setDate,
  techInput,
  setTechInput,
  technologies,
  onAddTech,
  onRemoveTech,
  description,
  setDescription,
  achievements,
  setAchievements,
  repoUrl,
  setRepoUrl,
  demoUrl,
  setDemoUrl,
}) => {
  return (
    <div className="space-y-4">
      {/* Title & Role */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Nama / Judul Proyek *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Contoh: Real-Time Analytics Dashboard"
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-white/10 bg-[#070b14] text-white placeholder:text-slate-500 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 outline-none transition"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Peran Anda dalam Proyek
          </label>
          <input
            type="text"
            value={role}
            onChange={e => setRole(e.target.value)}
            placeholder="Contoh: Lead Fullstack Developer"
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-white/10 bg-[#070b14] text-white placeholder:text-slate-500 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 outline-none transition"
          />
        </div>
      </div>

      {/* Category & Year */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Kategori Proyek
          </label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-white/10 bg-[#070b14] text-white focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 outline-none transition"
          >
            <option value="Projek di SEVIMA" className="bg-[#0b1220]">Projek di SEVIMA</option>
            <option value="My Produk" className="bg-[#0b1220]">My Produk</option>
            <option value="Freelance" className="bg-[#0b1220]">Freelance</option>
            <option value="Research & Thesis" className="bg-[#0b1220]">Research & Thesis</option>
            <option value="Test" className="bg-[#0b1220]">Test</option>
            <option value="Lainnya" className="bg-[#0b1220]">Lainnya</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Tahun / Periode
          </label>
          <input
            type="text"
            value={date}
            onChange={e => setDate(e.target.value)}
            placeholder="Contoh: 2024 atau Jan 2024 - Mei 2024"
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-white/10 bg-[#070b14] text-white placeholder:text-slate-500 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 outline-none transition"
          />
        </div>
      </div>

      {/* Technologies Tag Input */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Teknologi &amp; Tools yang Digunakan (Pisahkan dengan koma atau Enter)
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={techInput}
            onChange={e => setTechInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onAddTech();
              }
            }}
            placeholder="Next.js, Python, PostgreSQL, Docker..."
            className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-white/10 bg-[#070b14] text-white placeholder:text-slate-500 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 outline-none transition"
          />
          <button
            type="button"
            onClick={onAddTech}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Tambah Tag
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 min-h-[32px]">
          {technologies.map((tech, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/25"
            >
              <span>{tech}</span>
              <button
                type="button"
                onClick={() => onRemoveTech(i)}
                className="hover:text-rose-400 transition"
              >
                &times;
              </button>
            </span>
          ))}
          {technologies.length === 0 && (
            <span className="text-xs text-slate-500 italic">Belum ada teknologi ditambahkan.</span>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Deskripsi Arsitektur &amp; Sistem *
        </label>
        <textarea
          required
          rows={3}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Jelaskan peran teknis, arsitektur yang dirancang, atau masalah yang diselesaikan..."
          className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-white/10 bg-[#070b14] text-white placeholder:text-slate-500 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 outline-none transition resize-none leading-relaxed"
        />
      </div>

      {/* Achievements */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Capaian Terukur &amp; Dampak Kunci (Gunakan bullet poin / baris baru)
        </label>
        <textarea
          rows={3}
          value={achievements}
          onChange={e => setAchievements(e.target.value)}
          placeholder="• Mengoptimasi latensi query hingga 40%&#10;• Mengotomatisasi 500+ proses per hari"
          className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-white/10 bg-[#070b14] text-white placeholder:text-slate-500 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 outline-none transition resize-none leading-relaxed font-mono text-xs"
        />
      </div>

      {/* Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            URL Repository (Opsional)
          </label>
          <input
            type="url"
            value={repoUrl}
            onChange={e => setRepoUrl(e.target.value)}
            placeholder="https://github.com/..."
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-white/10 bg-[#070b14] text-white placeholder:text-slate-500 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 outline-none transition"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            URL Live Demo / Portofolio (Opsional)
          </label>
          <input
            type="url"
            value={demoUrl}
            onChange={e => setDemoUrl(e.target.value)}
            placeholder="https://myproject.com"
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-white/10 bg-[#070b14] text-white placeholder:text-slate-500 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 outline-none transition"
          />
        </div>
      </div>
    </div>
  );
};
