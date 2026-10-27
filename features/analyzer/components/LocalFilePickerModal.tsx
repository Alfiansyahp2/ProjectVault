'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, FileText, Sparkles, RefreshCw, Folder } from 'lucide-react';

interface LocalFileItem {
  name: string;
  path: string;
  size: number;
  folder: string;
}

interface LocalFilePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFile: (file: LocalFileItem) => void;
  isLoading: boolean;
}

export const LocalFilePickerModal: React.FC<LocalFilePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectFile,
  isLoading,
}) => {
  const [files, setFiles] = useState<LocalFileItem[]>([]);
  const [search, setSearch] = useState('');
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFetching(true);
      fetch('/api/applications/upload-parse')
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.files)) {
            setFiles(data.files);
          }
        })
        .catch(() => {})
        .finally(() => setFetching(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = files.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.folder.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div 
        className="w-full max-w-lg bg-[#070b14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center">
              <Folder className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Pilih Berkas Lokal</h3>
              <p className="text-[10px] text-slate-400">Direktori data/resume ({files.length} berkas)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-white/[0.06] bg-slate-950/40">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama berkas atau perusahaan..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-white/10 bg-slate-900 text-white placeholder-slate-500 focus:border-sky-500 outline-none"
            />
          </div>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {fetching ? (
            <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
              <span>Memindai berkas lokal...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Tidak ada berkas yang cocok dengan pencarian.
            </div>
          ) : (
            filtered.map((file, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isLoading}
                onClick={() => onSelectFile(file)}
                className="w-full p-2.5 rounded-xl border border-white/[0.04] hover:border-sky-500/40 bg-white/[0.015] hover:bg-sky-500/10 text-left transition flex items-center justify-between gap-3 group cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {file.folder} • {Math.round(file.size / 1024)} KB
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-sky-400 opacity-0 group-hover:opacity-100 transition shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Muat
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
