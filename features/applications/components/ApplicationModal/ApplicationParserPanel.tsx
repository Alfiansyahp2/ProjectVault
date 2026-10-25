import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  UploadCloud, 
  FileUp, 
  FileCheck2, 
  Tag 
} from 'lucide-react';
import { ApplicationParserPanelProps } from './types';

export const ApplicationParserPanel: React.FC<ApplicationParserPanelProps> = ({
  isParsing,
  parsedResult,
  parseSuccessMsg,
  parseErrorMsg,
  localFiles,
  selectedLocalFile,
  setSelectedLocalFile,
  onFileUpload,
  onLocalFileParse,
  onResetParsed,
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
    <div className="lg:col-span-5 p-5 sm:p-6 space-y-4 bg-white/[0.015] flex flex-col justify-between min-w-0 max-w-full overflow-hidden">
      <div className="space-y-4 min-w-0 max-w-full">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider truncate">
                AI Document Parser
              </h3>
              <p className="text-[10px] text-slate-400 truncate">
                Ekstraksi otomatis teks &amp; entitas PDF
              </p>
            </div>
          </div>

          {parsedResult && (
            <button
              type="button"
              onClick={onResetParsed}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition shrink-0 ml-2"
              title="Reset hasil ekstraksi"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          )}
        </div>

        {/* Notifications Banner */}
        {parseSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="truncate">{parseSuccessMsg}</span>
          </div>
        )}

        {parseErrorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="truncate">{parseErrorMsg}</span>
          </div>
        )}

        {/* Drag & Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
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

          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-sky-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/10">
              {isParsing ? (
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
              ) : (
                <UploadCloud className="w-6 h-6" />
              )}
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-white">
                {isParsing ? 'Mengekstrak Berkas PDF...' : 'Tarik & Lepaskan PDF ke Sini'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                atau <span className="text-indigo-400 font-semibold underline underline-offset-2">jelajahi file</span> dari komputer Anda (.pdf)
              </p>
            </div>
          </div>
        </div>

        {/* Quick Local File Picker */}
        <div className="bg-slate-900/60 border border-white/[0.08] rounded-2xl p-3.5 space-y-2.5 min-w-0 max-w-full">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider truncate">
              <FileUp className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>Ambil dari Berkas Lokal ({localFiles.length})</span>
            </label>
            <span className="text-[10px] text-slate-500 font-mono shrink-0">data/resume</span>
          </div>

          <div className="space-y-2 w-full min-w-0">
            <div className="w-full min-w-0">
              <select
                value={selectedLocalFile}
                onChange={e => {
                  const val = e.target.value;
                  setSelectedLocalFile(val);
                  if (val) onLocalFileParse(val);
                }}
                className="w-full max-w-full px-3 py-2.5 text-xs rounded-xl border border-white/10 bg-[#070b14] text-white focus:border-sky-500/60 outline-none transition truncate cursor-pointer"
              >
                <option value="">-- Pilih Berkas Surat Lamaran ({localFiles.length} berkas) --</option>
                {localFiles.map((f, idx) => (
                  <option key={idx} value={f.path} className="bg-[#0b1220]">
                    {f.name} ({Math.round(f.size / 1024)} KB)
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              disabled={!selectedLocalFile || isParsing}
              onClick={() => onLocalFileParse(selectedLocalFile)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition shadow-md shadow-indigo-500/20 active:scale-[0.98] cursor-pointer"
            >
              {isParsing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Mengekstrak Teks Dokumen...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-sky-200" />
                  <span>Ekstrak Berkas Ini ke Formulir</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Parsed Result Insight Card */}
        {parsedResult ? (
          <div className="bg-[#070b14] border border-indigo-500/30 rounded-2xl p-4 space-y-3 shadow-lg shadow-indigo-500/5 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-2 min-w-0">
                <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-white truncate">
                  {parsedResult.sourceFileName || parsedResult.file_name}
                </span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
                Ter-parse
              </span>
            </div>

            {/* Detected Entity Chips */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/[0.03] p-2 rounded-xl border border-white/[0.06]">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Perusahaan</p>
                <p className="font-semibold text-white truncate mt-0.5">{parsedResult.company_name}</p>
              </div>
              <div className="bg-white/[0.03] p-2 rounded-xl border border-white/[0.06]">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Posisi</p>
                <p className="font-semibold text-white truncate mt-0.5">{parsedResult.job_title}</p>
              </div>
              <div className="bg-white/[0.03] p-2 rounded-xl border border-white/[0.06]">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Tanggal</p>
                <p className="font-mono text-slate-300 truncate mt-0.5">{parsedResult.applied_date}</p>
              </div>
              <div className="bg-white/[0.03] p-2 rounded-xl border border-white/[0.06]">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Kanal</p>
                <p className="font-semibold text-indigo-300 truncate mt-0.5">{parsedResult.source_portal}</p>
              </div>
            </div>

            {/* Key skills if detected */}
            {parsedResult.key_skills && parsedResult.key_skills.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Tag className="w-3 h-3 text-indigo-400" />
                  <span>Keahlian Terdeteksi ({parsedResult.key_skills.length}):</span>
                </p>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                  {parsedResult.key_skills.map((s: string, idx: number) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="border border-white/[0.06] rounded-2xl p-4 text-center space-y-1 bg-white/[0.01]">
            <p className="text-xs font-semibold text-slate-300">
              💡 Mengapa Menggunakan Fitur Ini?
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Sistem menggunakan NLP lokal untuk mengekstrak nama PT/perusahaan, posisi, tanggal, kanal, serta isi surat lamaran secara instan tanpa mengetik manual.
            </p>
          </div>
        )}
      </div>

      {/* Bottom tip info */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center gap-2 text-[11px] text-slate-400">
        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
        <span>Pemrosesan berjalan 100% di mesin lokal tanpa API eksternal.</span>
      </div>
    </div>
  );
};
