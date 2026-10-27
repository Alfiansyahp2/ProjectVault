'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  ClipboardPaste, 
  RotateCcw, 
  Sparkles, 
  RefreshCw, 
  AlignLeft, 
  Plus, 
  Image as ImageIcon, 
  FolderOpen 
} from 'lucide-react';
import { LocalFilePickerModal } from '@/features/analyzer/components/LocalFilePickerModal';
import { useJobInputOcr } from '@/features/analyzer/hooks/use-job-input-ocr';

interface RawTextParserTabProps {
  isParsing: boolean;
  onRawTextParse: (text: string, sourceHint?: string) => void;
}

export const RawTextParserTab: React.FC<RawTextParserTabProps> = ({
  isParsing,
  onRawTextParse,
}) => {
  const [rawText, setRawText] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLocalModalOpen, setIsLocalModalOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    ocrLoading,
    ocrStatus,
    handleImageOcr,
    handleLoadLocalFile,
  } = useJobInputOcr({
    onInsertText: text => setRawText(prev => prev ? `${prev}\n\n${text}` : text),
  });

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
        setRawText(text);
      }
    } catch {
      // Ignore clipboard permission errors silently
    }
  };

  const handleClear = () => {
    setRawText('');
  };

  const wordCount = rawText.trim() ? rawText.trim().split(/\s+/).length : 0;
  const charCount = rawText.length;

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
        onChange={e => {
          if (e.target.files && e.target.files.length > 0) {
            setIsMenuOpen(false);
            handleImageOcr(e.target.files[0]);
          }
        }}
      />

      {/* Header action bar */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider shrink-0 whitespace-nowrap">
          <AlignLeft className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Salin / Tempel Teks Panjang</span>
        </span>

        <div className="relative flex items-center gap-1.5 shrink-0" ref={menuRef}>
          {ocrLoading && ocrStatus && !isMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#0b1220]/95 border border-sky-500/40 text-sky-300 text-[10px] shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-1 whitespace-nowrap">
              <RefreshCw className="w-3 h-3 animate-spin text-sky-400 shrink-0" />
              <span>{ocrStatus}</span>
            </div>
          )}

          {/* Icon + (Plus Button) */}
          <div className="relative">
            <button
              type="button"
              disabled={ocrLoading}
              onClick={() => setIsMenuOpen(prev => !prev)}
              title="Tambah gambar atau dari lokal"
              aria-label="Tambah gambar atau dari lokal"
              className={`p-1.5 rounded-lg border transition cursor-pointer flex items-center justify-center ${
                ocrLoading
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 cursor-wait'
                  : isMenuOpen 
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/50' 
                    : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border-white/10'
              }`}
            >
              {ocrLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
              ) : (
                <Plus className={`w-3.5 h-3.5 transition-transform ${isMenuOpen ? 'rotate-45 text-sky-400' : ''}`} />
              )}
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-[#0b1220]/95 backdrop-blur-md border border-white/10 rounded-xl p-1 shadow-2xl z-30 animate-in fade-in space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    fileInputRef.current?.click();
                  }}
                  className="w-full p-2 rounded-lg text-left hover:bg-sky-500/15 text-slate-200 hover:text-white transition flex items-center gap-2 group cursor-pointer text-xs"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-xs leading-tight">Tambah Gambar</p>
                    <p className="text-[10px] text-slate-400">Ekstrak teks gambar (OCR)</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsLocalModalOpen(true);
                  }}
                  className="w-full p-2 rounded-lg text-left hover:bg-indigo-500/15 text-slate-200 hover:text-white transition flex items-center gap-2 group cursor-pointer text-xs"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-xs leading-tight">Tambah dari Lokal</p>
                    <p className="text-[10px] text-slate-400">Pilih dari data/resume</p>
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
            className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-sky-400 transition cursor-pointer flex items-center justify-center"
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
          </button>

          {rawText && (
            <button
              type="button"
              onClick={handleClear}
              title="Bersihkan isi form"
              aria-label="Bersihkan isi form"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition cursor-pointer flex items-center justify-center"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={rawText}
          onChange={e => setRawText(e.target.value)}
          placeholder="Tempel teks lowongan kerja, pesan rekruter LinkedIn/WhatsApp, atau isi surat lamaran panjang di sini..."
          rows={6}
          className="w-full px-3.5 py-3 text-xs rounded-2xl border border-white/10 bg-[#070b14] text-white placeholder-slate-500 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 outline-none transition resize-none leading-relaxed"
        />
        <div className="flex items-center justify-between pt-1 px-1 text-[10px] text-slate-500">
          <span>{wordCount} kata • {charCount} karakter</span>
          <span>Dianalisis NLP Lokal</span>
        </div>
      </div>

      {/* Trigger Extract Button */}
      <button
        type="button"
        disabled={!rawText.trim() || isParsing}
        onClick={() => onRawTextParse(rawText, 'Teks Salinan Panjang')}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition shadow-md shadow-emerald-500/20 active:scale-[0.98] cursor-pointer"
      >
        {isParsing ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Menganalisis Entitas Teks...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>Ekstrak Entitas dari Teks Ini</span>
          </>
        )}
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
