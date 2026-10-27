import React, { useRef, useState } from 'react';
import { UploadCloud, RefreshCw, FileUp, Sparkles } from 'lucide-react';
import { LocalResumeFile } from './types';

interface PdfParserTabProps {
  isParsing: boolean;
  localFiles: LocalResumeFile[];
  selectedLocalFile: string;
  setSelectedLocalFile: (path: string) => void;
  onFileUpload: (file: File) => void;
  onLocalFileParse: (path: string) => void;
}

export const PdfParserTab: React.FC<PdfParserTabProps> = ({
  isParsing,
  localFiles,
  selectedLocalFile,
  setSelectedLocalFile,
  onFileUpload,
  onLocalFileParse,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-5 text-center transition-all ${
          isDragging
            ? 'border-indigo-400 bg-indigo-500/15 scale-[1.01]'
            : 'border-white/15 hover:border-indigo-500/40 bg-white/[0.02] hover:bg-white/[0.04]'
        } ${isParsing ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={e => {
            if (e.target.files && e.target.files.length > 0) {
              onFileUpload(e.target.files[0]);
            }
          }}
        />

        <div className="flex flex-col items-center justify-center space-y-1.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-sky-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-md shadow-indigo-500/10">
            {isParsing ? (
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
            ) : (
              <UploadCloud className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-white">
              {isParsing ? 'Mengekstrak Berkas PDF...' : 'Tarik & Lepaskan PDF ke Sini'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              atau <span className="text-indigo-400 font-semibold underline underline-offset-2">jelajahi file</span> (.pdf)
            </p>
          </div>
        </div>
      </div>

      {/* Quick Local File Picker */}
      <div className="bg-slate-900/60 border border-white/[0.08] rounded-2xl p-3 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider truncate">
            <FileUp className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>Berkas Lokal ({localFiles.length})</span>
          </label>
          <span className="text-[10px] text-slate-500 font-mono shrink-0">data/resume</span>
        </div>

        <div className="space-y-2 w-full">
          <select
            value={selectedLocalFile}
            onChange={e => {
              const val = e.target.value;
              setSelectedLocalFile(val);
              if (val) onLocalFileParse(val);
            }}
            className="w-full px-3 py-2 text-xs rounded-xl border border-white/10 bg-[#070b14] text-white focus:border-sky-500/60 outline-none transition truncate cursor-pointer"
          >
            <option value="">-- Pilih Berkas Surat Lamaran ({localFiles.length} berkas) --</option>
            {localFiles.map((f, idx) => (
              <option key={idx} value={f.path} className="bg-[#0b1220]">
                {f.name} ({Math.round(f.size / 1024)} KB)
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={!selectedLocalFile || isParsing}
            onClick={() => onLocalFileParse(selectedLocalFile)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition shadow-md shadow-indigo-500/20 active:scale-[0.98] cursor-pointer"
          >
            {isParsing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Mengekstrak Dokumen...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-sky-200" />
                <span>Ekstrak Berkas Ini</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
