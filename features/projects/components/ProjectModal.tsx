'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Project } from '@/lib/types';
import { X, FolderGit2 } from 'lucide-react';
import { ProjectFormFields } from './ProjectModal/ProjectFormFields';

export interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
  initialData?: Project | null;
}

export default function ProjectModal({ isOpen, onClose, onSave, initialData }: ProjectModalProps) {
  const [mounted, setMounted] = useState(false);
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
    setMounted(true);
  }, []);

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

  if (!isOpen || !mounted) return null;

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

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#0b1220] border border-white/[0.12] rounded-3xl shadow-2xl shadow-indigo-500/10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4.5 border-b border-white/[0.08] bg-slate-900/70 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-inner shrink-0">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-white tracking-tight truncate">
                {initialData ? 'Edit Proyek Portofolio' : 'Tambah Proyek ke Bank Portofolio'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                Simpan data proyek sekali, gunakan berulang kali untuk lamaran &amp; AI.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition shrink-0 ml-2 cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="project-modal-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 overscroll-contain">
          <ProjectFormFields
            title={title}
            setTitle={setTitle}
            role={role}
            setRole={setRole}
            category={category}
            setCategory={setCategory}
            date={date}
            setDate={setDate}
            techInput={techInput}
            setTechInput={setTechInput}
            technologies={technologies}
            onAddTech={handleAddTech}
            onRemoveTech={handleRemoveTech}
            description={description}
            setDescription={setDescription}
            achievements={achievements}
            setAchievements={setAchievements}
            repoUrl={repoUrl}
            setRepoUrl={setRepoUrl}
            demoUrl={demoUrl}
            setDemoUrl={setDemoUrl}
          />
        </form>

        {/* Fixed Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-white/[0.08] bg-slate-900/80 backdrop-blur-md flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/[0.06] transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            form="project-modal-form"
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white shadow-lg shadow-indigo-500/25 transition cursor-pointer"
          >
            {initialData ? 'Simpan Perubahan' : 'Tambahkan ke Portofolio'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
