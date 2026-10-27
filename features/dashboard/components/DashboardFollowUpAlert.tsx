'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, ChevronDown, ChevronUp, Clock, Building2 } from 'lucide-react';
import { JobApplication } from '@/lib/types';

interface DashboardFollowUpAlertProps {
  followUpNeeded: JobApplication[];
}

export const DashboardFollowUpAlert: React.FC<DashboardFollowUpAlertProps> = ({
  followUpNeeded,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (followUpNeeded.length === 0) return null;

  const topItems = followUpNeeded.slice(0, 4);
  const remainingCount = followUpNeeded.length - topItems.length;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-r from-amber-500/[0.10] via-amber-950/[0.15] to-slate-950/60 p-4 sm:p-5 backdrop-blur-xl shadow-lg shadow-amber-500/5 transition-all">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400">
                Peringatan Tindak Lanjut
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {followUpNeeded.length} Lowongan Menunggu
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Terkirim &ge; 7 hari lalu tanpa kabar. Pertimbangkan kirim email sopan follow-up ke rekruter.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition cursor-pointer"
          >
            <span>{isExpanded ? 'Sembunyikan' : 'Daftar Singkat'}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          <Link
            href="/applications"
            className="group flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 transition shadow-sm cursor-pointer"
          >
            <span>Buka Kanban</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Preview Chips (Top 4 Items) */}
      <div className="mt-3.5 pt-3 border-t border-amber-500/15 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold text-amber-400/90 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>Prioritas:</span>
        </span>

        {topItems.map((item, idx) => (
          <span
            key={item.id || idx}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-900/80 border border-amber-500/20 text-slate-200"
          >
            <Building2 className="w-3 h-3 text-amber-400/80" />
            <strong className="text-white font-semibold">{item.company_name}</strong>
            <span className="text-slate-400">&bull; {item.job_title}</span>
          </span>
        ))}

        {remainingCount > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 transition cursor-pointer"
          >
            +{remainingCount} lainnya
          </button>
        )}
      </div>

      {/* Expandable Full List Drawer */}
      {isExpanded && (
        <div className="mt-3.5 pt-3.5 border-t border-amber-500/20 max-h-56 overflow-y-auto pr-1 space-y-1.5 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {followUpNeeded.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-2.5 rounded-xl bg-slate-950/80 border border-white/[0.06] hover:border-amber-500/30 transition flex items-center justify-between gap-2 text-xs"
              >
                <div className="min-w-0">
                  <p className="font-bold text-white truncate text-[11px]">{item.company_name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{item.job_title}</p>
                </div>
                {item.applied_date && (
                  <span className="text-[10px] text-amber-400/90 shrink-0">
                    {item.applied_date}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
