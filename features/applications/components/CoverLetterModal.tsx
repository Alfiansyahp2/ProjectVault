'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Building2, 
  Calendar, 
  Tag, 
  X, 
  Copy, 
  Check, 
  Download, 
  FileText 
} from 'lucide-react';
import { getPortalBadge } from '@/lib/utils';

interface CoverLetterData {
  title: string;
  company: string;
  job: string;
  date: string;
  portal: string;
  text: string;
  skills?: string[];
}

interface CoverLetterModalProps {
  coverLetter: CoverLetterData | null;
  onClose: () => void;
}

export const CoverLetterModal: React.FC<CoverLetterModalProps> = ({
  coverLetter,
  onClose,
}) => {
  const [copiedLetter, setCopiedLetter] = useState(false);

  if (!coverLetter || typeof document === 'undefined') return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter.text);
    setCopiedLetter(true);
    setTimeout(() => setCopiedLetter(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([coverLetter.text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Surat_Lamaran_${coverLetter.company.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative bg-[#0b1220] border border-white/[0.12] rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between gap-4 bg-gradient-to-r from-sky-500/10 via-indigo-500/5 to-transparent">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                {coverLetter.company}
              </h3>
              <p className="text-xs text-sky-300 truncate">
                {coverLetter.job}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/[0.1] flex items-center gap-1.5 transition cursor-pointer"
              title="Salin isi surat lamaran ke clipboard"
            >
              {copiedLetter ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLetter ? 'Tersalin!' : 'Salin Teks'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/[0.1] flex items-center gap-1.5 transition cursor-pointer"
              title="Unduh berkas TXT"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Unduh TXT</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.1] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="px-5 py-2.5 bg-white/[0.02] border-b border-white/[0.06] flex items-center gap-4 text-[11px] text-slate-400 flex-wrap">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Tanggal: <strong className="text-slate-300 font-mono">{coverLetter.date}</strong></span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Portal:</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getPortalBadge(coverLetter.portal)}`}>
              {coverLetter.portal}
            </span>
          </span>
          {coverLetter.skills && coverLetter.skills.length > 0 && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                <span>Keahlian Utama:</span>
                <span className="text-slate-300 font-medium truncate max-w-xs">
                  {coverLetter.skills.slice(0, 4).join(', ')}
                </span>
              </span>
            </>
          )}
        </div>

        {/* Document Reader Canvas */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap select-text bg-[#070b13]/50">
          <div className="max-w-2xl mx-auto bg-black/20 border border-white/[0.06] p-6 sm:p-8 rounded-2xl shadow-inner font-mono text-[12px] sm:text-[13px] leading-relaxed text-slate-300">
            {coverLetter.text}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 px-6 border-t border-white/[0.06] bg-white/[0.02] flex items-center justify-between text-xs text-slate-500">
          <span>Arsip tersimpan aman pada pelacak lamaran</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white font-semibold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
