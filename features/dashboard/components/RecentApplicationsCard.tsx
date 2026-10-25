import React from 'react';
import Link from 'next/link';
import { Briefcase, Plus, Calendar, Wallet, ExternalLink, ArrowRight } from 'lucide-react';
import { JobApplication } from '@/lib/types';

interface RecentApplicationsCardProps {
  applications: JobApplication[];
  onAddApplication: () => void;
}

export const RecentApplicationsCard: React.FC<RecentApplicationsCardProps> = ({
  applications,
  onAddApplication,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'wishlist':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800/80 text-slate-300 border border-slate-700/60">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Wishlist
          </span>
        );
      case 'applied':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            Terkirim
          </span>
        );
      case 'interview':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            Wawancara
          </span>
        );
      case 'offer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Penawaran 🎉
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Belum Berhasil
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Lamaran Pekerjaan Terbaru
            </h2>
            <p className="text-xs text-slate-400">Monitoring status &amp; respon rekruter</p>
          </div>
        </div>

        <button
          onClick={onAddApplication}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Catat Lamaran</span>
        </button>
      </div>

      <div className="space-y-3.5">
        {applications.slice(0, 3).map((app) => (
          <div
            key={app.id}
            className="glass-card rounded-2xl p-5 border border-white/[0.08] hover:border-sky-500/40 transition-all group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-800/80 border border-white/[0.08] flex items-center justify-center text-slate-300 font-bold text-sm shrink-0 mt-0.5">
                  {app.company_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                    {app.company_name}
                  </h3>
                  <p className="text-xs font-medium text-slate-300 mt-0.5">
                    {app.job_title}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                {getStatusBadge(app.status)}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{app.applied_date}</span>
              </span>
              {app.salary_range && (
                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <Wallet className="w-3.5 h-3.5 text-slate-500" />
                  <span>{app.salary_range}</span>
                </span>
              )}
            </div>

            {app.notes && (
              <p className="text-xs text-slate-300 mt-2.5 bg-slate-800/60 border border-white/[0.06] p-2.5 rounded-xl leading-relaxed">
                📌 {app.notes}
              </p>
            )}

            {app.job_link && (
              <div className="mt-3 pt-2.5 border-t border-white/[0.06]">
                <a
                  href={app.job_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-400 hover:text-sky-300 transition cursor-pointer"
                >
                  <span>Buka Tautan Lowongan</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        ))}

        {applications.length === 0 && (
          <div className="text-center py-12 glass-panel rounded-2xl border border-dashed border-white/10 p-6">
            <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-xs text-slate-400 font-medium">Belum ada lamaran pekerjaan tersimpan.</p>
            <button
              onClick={onAddApplication}
              className="mt-3 text-xs font-bold text-sky-400 hover:text-sky-300 transition cursor-pointer"
            >
              + Catat Lamaran Pertama Anda
            </button>
          </div>
        )}

        <div className="pt-1 text-right">
          <Link 
            href="/applications" 
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 transition cursor-pointer"
          >
            <span>Buka Pelacak Lengkap (Kanban)</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
