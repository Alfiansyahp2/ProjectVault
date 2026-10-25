'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Project } from '@/lib/types';
import { 
  X, 
  Copy, 
  Check, 
  Edit3, 
  Trash2, 
  Code2, 
  Globe, 
  Sparkles, 
  Calendar, 
  Briefcase, 
  ExternalLink,
  Layers,
  Award,
  CheckCircle2,
  FileText
} from 'lucide-react';

interface ProjectDetailModalProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onEdit: (project: Project) => void;
  onDelete: (id: string, title: string) => void;
}

export default function ProjectDetailModal({
  isOpen,
  project,
  onClose,
  onEdit,
  onDelete,
}: ProjectDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const [copiedContext, setCopiedContext] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !project || !mounted) return null;

  // Parse achievements into clean bullet points
  const bulletPoints = (project.achievements || '')
    .split(/\n|•|\*/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const copyCvFormat = () => {
    let text = `### ${project.title}\n`;
    text += `Peran: ${project.role} (${project.date || 'Present'})\n`;
    text += `Kategori: ${project.category}\n`;
    text += `Teknologi: ${project.technologies.join(', ')}\n\n`;
    text += `Deskripsi:\n${project.description}\n\n`;
    if (bulletPoints.length > 0) {
      text += `Capaian & Dampak Terukur:\n`;
      bulletPoints.forEach(bp => {
        text += `- ${bp}\n`;
      });
    }
    if (project.repo_url) text += `Repository: ${project.repo_url}\n`;
    if (project.demo_url) text += `Demo: ${project.demo_url}\n`;

    navigator.clipboard.writeText(text);
    setCopiedContext(true);
    setTimeout(() => setCopiedContext(false), 2000);
  };

  if (!isOpen || !project || !mounted) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="relative bg-[#0b1220] border border-white/[0.12] rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl shadow-indigo-500/10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Bar Actions */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-slate-900/70 backdrop-blur-md">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              {project.category || 'General'}
            </span>
            {project.date && (
              <span className="flex items-center gap-1 text-xs font-medium text-slate-400 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {project.date}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyCvFormat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/[0.08] transition"
              title="Salin ringkasan proyek untuk CV / AI"
            >
              {copiedContext ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Salin untuk CV</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                onClose();
                onEdit(project);
              }}
              className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-xl hover:bg-white/[0.08] transition"
              title="Edit Proyek"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                onClose();
                onDelete(project.id, project.title);
              }}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-white/[0.08] transition"
              title="Hapus Proyek"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.08] transition ml-1"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
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
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Teknologi &amp; Tech Stack ({project.technologies.length})</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl text-xs font-medium bg-slate-800/80 border border-white/[0.1] text-slate-200 shadow-sm"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/[0.08] bg-slate-900/60 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            ID: <span className="font-mono text-slate-400">{project.id}</span>
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.15] text-white transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
