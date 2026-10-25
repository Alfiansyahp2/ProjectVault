import React from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { JobApplication } from '@/lib/types';

interface DashboardFollowUpAlertProps {
  followUpNeeded: JobApplication[];
}

export const DashboardFollowUpAlert: React.FC<DashboardFollowUpAlertProps> = ({
  followUpNeeded,
}) => {
  if (followUpNeeded.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-amber-950/20 to-slate-900/40 p-4.5 sm:p-5 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-amber-500/5">
      <div className="flex items-start sm:items-center gap-3.5">
        <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400">
              Perlu Tindak Lanjut (Follow-Up)
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
              {followUpNeeded.length} Lowongan
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 mt-0.5">
            Lamaran pekerjaan telah terkirim &ge; 7 hari lalu tanpa kabar:
            <strong className="ml-1 text-amber-200">
              {followUpNeeded.map(f => `${f.company_name} (${f.job_title})`).join(', ')}
            </strong>
          </p>
        </div>
      </div>

      <Link 
        href="/applications" 
        className="group flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all shrink-0 cursor-pointer"
      >
        <span>Tinjau &amp; Follow-up</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
};
