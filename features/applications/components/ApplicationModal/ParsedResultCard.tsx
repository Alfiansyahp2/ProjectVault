import React from 'react';
import { FileCheck2, Tag } from 'lucide-react';

interface ParsedResultCardProps {
  parsedResult: any;
}

export const ParsedResultCard: React.FC<ParsedResultCardProps> = ({ parsedResult }) => {
  if (!parsedResult) {
    return (
      <div className="border border-white/[0.06] rounded-2xl p-4 text-center space-y-1 bg-white/[0.01]">
        <p className="text-xs font-semibold text-slate-300">
          💡 Mengapa Menggunakan Fitur Ini?
        </p>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Sistem menggunakan AI NLP &amp; OCR lokal untuk mengekstrak nama PT/perusahaan, posisi, tanggal, kanal, serta keahlian teknis secara instan dari PDF, gambar, atau teks panjang.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#070b14] border border-indigo-500/30 rounded-2xl p-4 space-y-3 shadow-lg shadow-indigo-500/5 animate-in fade-in">
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
        <div className="flex items-center gap-2 min-w-0">
          <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold text-white truncate">
            {parsedResult.sourceFileName || parsedResult.file_name}
          </span>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
          Ter-parse AI
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
  );
};
