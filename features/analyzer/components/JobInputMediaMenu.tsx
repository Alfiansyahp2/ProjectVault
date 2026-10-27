'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  ClipboardPaste, 
  RotateCcw, 
  Image as ImageIcon, 
  FolderOpen, 
  RefreshCw,
  CheckCircle2 
} from 'lucide-react';
import { LocalFilePickerModal } from './LocalFilePickerModal';
import { useJobInputOcr } from '../hooks/use-job-input-ocr';

interface JobInputMediaMenuProps {
  onInsertText: (text: string) => void;
  onSetJobTitle?: (title: string) => void;
  onSetCompanyName?: (company: string) => void;
  onReset: () => void;
}

export const JobInputMediaMenu: React.FC<JobInputMediaMenuProps> = ({
  onInsertText,
  onSetJobTitle,
  onSetCompanyName,
  onReset,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLocalModalOpen, setIsLocalModalOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    ocrLoading,
    ocrStatus,
    statusMsg,
    showStatus,
    handleImageOcr,
    handleLoadLocalFile,
  } = useJobInputOcr({ onInsertText, onSetJobTitle, onSetCompanyName });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onInsertText(text);
        showStatus('Teks berhasil ditempel dari clipboard');
      }
    } catch {
      // Ignore permission errors
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsMenuOpen(false);
      handleImageOcr(e.target.files[0]);
    }
  };

  return (
    <div className="relative flex items-center gap-1.5 shrink-0" ref={menuRef}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
        onChange={onFileChange}
      />

      {/* Floating Status Notification Pill */}
      {statusMsg && !isMenuOpen && (
        <div className="absolute right-0 top-full mt-2 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b1220]/95 border border-emerald-500/40 text-emerald-300 text-xs shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-1 whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {ocrLoading && ocrStatus && !isMenuOpen && (
        <div className="absolute right-0 top-full mt-2 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b1220]/95 border border-sky-500/40 text-sky-300 text-xs shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-1 whitespace-nowrap">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400 shrink-0" />
          <span>{ocrStatus}</span>
        </div>
      )}

      {/* Icon + (Plus Dropdown Button) */}
      <div className="relative">
        <button
          type="button"
          disabled={ocrLoading}
          onClick={() => setIsMenuOpen(prev => !prev)}
          title="Tambah gambar atau berkas lokal"
          aria-label="Tambah gambar atau berkas lokal"
          className={`p-1.5 rounded-lg border transition cursor-pointer flex items-center justify-center ${
            ocrLoading
              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 cursor-wait'
              : isMenuOpen 
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-sm shadow-sky-500/20' 
                : 'text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border-white/10'
          }`}
        >
          {ocrLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
          ) : (
            <Plus className={`w-4 h-4 transition-transform duration-200 ${isMenuOpen ? 'rotate-45 text-sky-400' : ''}`} />
          )}
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-56 bg-[#0b1220]/95 backdrop-blur-md border border-white/10 rounded-2xl p-1.5 shadow-2xl z-30 animate-in fade-in zoom-in-95 space-y-1">
            <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-white/[0.06]">
              Sumber Masukan
            </div>

            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                fileInputRef.current?.click();
              }}
              className="w-full p-2 rounded-xl text-left hover:bg-sky-500/15 text-slate-200 hover:text-white transition flex items-center gap-2.5 group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ImageIcon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold leading-tight">Tambah Gambar</p>
                <p className="text-[10px] text-slate-400 truncate">Ekstrak teks gambar (OCR)</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                setIsLocalModalOpen(true);
              }}
              className="w-full p-2 rounded-xl text-left hover:bg-indigo-500/15 text-slate-200 hover:text-white transition flex items-center gap-2.5 group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FolderOpen className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold leading-tight">Tambah dari Lokal</p>
                <p className="text-[10px] text-slate-400 truncate">Pilih berkas dari data/resume</p>
              </div>
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handlePasteClipboard}
        title="Tempel teks dari Clipboard"
        aria-label="Tempel teks dari Clipboard"
        className="p-1.5 rounded-lg text-slate-300 hover:text-indigo-400 hover:bg-white/[0.06] transition cursor-pointer flex items-center justify-center"
      >
        <ClipboardPaste className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={onReset}
        title="Bersihkan isi form"
        aria-label="Bersihkan isi form"
        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/[0.06] transition cursor-pointer flex items-center justify-center"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      <LocalFilePickerModal
        isOpen={isLocalModalOpen}
        onClose={() => setIsLocalModalOpen(false)}
        onSelectFile={file => {
          setIsLocalModalOpen(false);
          handleLoadLocalFile(file);
        }}
        isLoading={ocrLoading}
      />
    </div>
  );
};
