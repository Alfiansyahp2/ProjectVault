'use client';

import React from 'react';
import { Briefcase, Send, MessageSquare, AlertTriangle, Sparkles } from 'lucide-react';

interface ApplicationsStatsProps {
  totalCount: number;
  appliedCount: number;
  interviewCount: number;
  followUpDueCount: number;
  parsedProgressPercent: number;
  totalPdfFiles: number;
  onlyFollowUpDue: boolean;
  onToggleFollowUp: () => void;
}

export const ApplicationsStats: React.FC<ApplicationsStatsProps> = ({
  totalCount,
  appliedCount,
  interviewCount,
  followUpDueCount,
  parsedProgressPercent,
  totalPdfFiles,
  onlyFollowUpDue,
  onToggleFollowUp,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {/* Card 1: Total Lamaran */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3.5 flex items-center gap-3 hover:border-white/15 transition">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
          <Briefcase className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Lamaran</p>
          <p className="text-xl font-extrabold text-white tracking-tight">{totalCount}</p>
          <p className="text-[10px] text-slate-500 truncate">Semua Status</p>
        </div>
      </div>

      {/* Card 2: Terkirim */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3.5 flex items-center gap-3 hover:border-blue-500/30 transition">
        <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
          <Send className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Terkirim</p>
          <p className="text-xl font-extrabold text-blue-300 tracking-tight">{appliedCount}</p>
          <p className="text-[10px] text-slate-500 truncate">Menunggu Respon</p>
        </div>
      </div>

      {/* Card 3: Wawancara */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3.5 flex items-center gap-3 hover:border-amber-500/30 transition">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Wawancara</p>
          <p className="text-xl font-extrabold text-amber-300 tracking-tight">{interviewCount}</p>
          <p className="text-[10px] text-slate-500 truncate">Tahap Lanjut</p>
        </div>
      </div>

      {/* Card 4: Butuh Follow-up */}
      <div 
        onClick={onToggleFollowUp}
        className={`rounded-2xl p-3.5 flex items-center gap-3 border transition cursor-pointer select-none ${
          onlyFollowUpDue 
            ? 'bg-amber-500/20 border-amber-500 shadow-md shadow-amber-500/20' 
            : 'bg-white/[0.03] border-white/[0.06] hover:border-amber-500/40'
        }`}
        title="Klik untuk menyaring lamaran yang butuh follow-up"
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          followUpDueCount > 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-500/15 text-slate-400'
        }`}>
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Follow-Up</p>
          <p className="text-xl font-extrabold text-amber-300 tracking-tight">{followUpDueCount}</p>
          <p className="text-[10px] text-amber-400/80 truncate">&gt; 7 Hari Kerja</p>
        </div>
      </div>

      {/* Card 5: Progres Berkas PDF */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3.5 flex items-center gap-3 hover:border-purple-500/30 transition">
        <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Progres Arsip</p>
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-xl font-extrabold text-white tracking-tight">{parsedProgressPercent}%</span>
            <span className="text-[10px] text-slate-500 font-mono">{totalCount}/{totalPdfFiles}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-purple-500 to-sky-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${parsedProgressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
