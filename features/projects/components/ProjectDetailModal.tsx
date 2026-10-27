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
  Calendar, 
} from 'lucide-react';
import { ProjectDetailBody } from './ProjectDetailModal/ProjectDetailBody';

export interface ProjectDetailModalProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onEdit: (project: Project) => void;
  onDelete: (id: string, title: string) => void;
  onOpenTechModal?: (project: Project) => void;
}

export default function ProjectDetailModal({
  isOpen,
  project,
  onClose,
  onEdit,
  onDelete,
  onOpenTechModal,
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/[0.08] transition cursor-pointer"
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
              className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-xl hover:bg-white/[0.08] transition cursor-pointer"
              title="Edit Proyek"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                onClose();
                onDelete(project.id, project.title);
              }}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-white/[0.08] transition cursor-pointer"
              title="Hapus Proyek"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.08] transition ml-1 cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <ProjectDetailBody
          project={project}
          bulletPoints={bulletPoints}
          onOpenTechModal={onOpenTechModal}
        />

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/[0.08] bg-slate-900/60 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            ID: <span className="font-mono text-slate-400">{project.id}</span>
          </p>
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
