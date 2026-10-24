'use client';

import React, { useState, useEffect } from 'react';
import { Project } from '@/lib/types';
import { X, Plus, Trash2, Globe, Code2, FolderGit2 } from 'lucide-react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
  initialData?: Project | null;
}

export default function ProjectModal({ isOpen, onClose, onSave, initialData }: ProjectModalProps) {
  const [title, setTitle] = useState('');
  const [role, setRole] = useState('');
  const [category, setCategory] = useState('Web Application');
  const [techInput, setTechInput] = useState('');
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [achievements, setAchievements] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setRole(initialData.role || '');
      setCategory(initialData.category || 'Web Application');
      setTechnologies(initialData.technologies || []);
      setDescription(initialData.description || '');
      setAchievements(initialData.achievements || '');
      setRepoUrl(initialData.repo_url || '');
      setDemoUrl(initialData.demo_url || '');
      setDate(initialData.date || '');
    } else {
      setTitle('');
      setRole('Developer');
      setCategory('Web Application');
      setTechnologies([]);
      setDescription('');
      setAchievements('');
      setRepoUrl('');
      setDemoUrl('');
      setDate(new Date().getFullYear().toString());
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddTech = () => {
    if (techInput.trim()) {
      const items = techInput.split(',').map(s => s.trim()).filter(Boolean);
      setTechnologies(prev => Array.from(new Set([...prev, ...items])));
      setTechInput('');
    }
  };

  const handleRemoveTech = (index: number) => {
    setTechnologies(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Judul proyek dan deskripsi wajib diisi.');
      return;
    }

    onSave({
      id: initialData?.id || '',
      title: title.trim(),
      role: role.trim() || 'Developer',
      category: category.trim(),
      technologies,
      description: description.trim(),
      achievements: achievements.trim(),
      repo_url: repoUrl.trim(),
      demo_url: demoUrl.trim(),
      date: date.trim(),
      createdAt: initialData?.createdAt || new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0b1220] border border-white/[0.12] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl shadow-indigo-500/10 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08] bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-inner">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {initialData ? 'Edit Proyek Portofolio' : 'Tambah Proyek ke Bank Portofolio'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Simpan data proyek sekali, gunakan berulang kali untuk lamaran & AI.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
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
              Teknologi & Tools yang Digunakan (Pisahkan dengan koma atau Enter)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={techInput}
                onChange={e => setTechInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTech();
                  }
                }}
                placeholder="Next.js, Python, PostgreSQL, Docker..."
                className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-white/10 bg-[#070b14] text-white placeholder:text-slate-500 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 outline-none transition"
              />
              <button
                type="button"
                onClick={handleAddTech}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 rounded-xl text-xs font-bold transition"
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
                    onClick={() => handleRemoveTech(i)}
                    className="hover:text-rose-400 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Deskripsi Proyek *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ceritakan masalah yang diselesaikan, arsitektur sistem, dan fitur utama..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-white/10 bg-[#070b14] text-white placeholder:text-slate-500 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 outline-none transition leading-relaxed"
            />
          </div>

          {/* Achievements / Metrics */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Hasil Terukur &amp; Pencapaian Nyata (Dampak, metrik, angka efisiensi)
            </label>
            <textarea
              rows={2}
              value={achievements}
              onChange={e => setAchievements(e.target.value)}
              placeholder="Contoh: Meningkatkan kecepatan query 40%, memproses 10k transaksi harian, atau menghemat waktu tim 5 jam/minggu."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-white/10 bg-[#070b14] text-white placeholder:text-slate-500 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 outline-none transition leading-relaxed"
            />
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Repository URL</span>
              </label>
              <input
                type="url"
                value={repoUrl}
                onChange={e => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repo"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-white/10 bg-[#070b14] text-white placeholder:text-slate-500 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 outline-none transition"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                <span>Live Demo URL</span>
              </label>
              <input
                type="url"
                value={demoUrl}
                onChange={e => setDemoUrl(e.target.value)}
                placeholder="https://my-app.vercel.app"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-white/10 bg-[#070b14] text-white placeholder:text-slate-500 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 outline-none transition"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white shadow-lg shadow-indigo-500/25 transition active:scale-95"
            >
              {initialData ? 'Simpan Perubahan' : 'Simpan ke Bank Portofolio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
