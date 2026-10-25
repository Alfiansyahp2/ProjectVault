'use client';

import React from 'react';
import { 
  FileText, 
  Edit3, 
  Trash2 
} from 'lucide-react';
import { JobApplication, ApplicationStatus } from '@/lib/types';
import { 
  getPortalBadge, 
  getCompanyInitials, 
  getAvatarGradient, 
  calculateDaysAgo 
} from '@/lib/utils';

interface ApplicationsTableViewProps {
  filteredApps: JobApplication[];
  onEdit: (app: JobApplication) => void;
  onDelete: (id: string, company: string) => void;
  onOpenCoverLetter: (app: JobApplication) => void;
  onStatusChange: (app: JobApplication, newStatus: ApplicationStatus) => void;
}

export const ApplicationsTableView: React.FC<ApplicationsTableViewProps> = ({
  filteredApps,
  onEdit,
  onDelete,
  onOpenCoverLetter,
  onStatusChange,
}) => {
  return (
    <div className="bg-[#0b1220]/80 border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-white/[0.03] text-slate-400 border-b border-white/[0.08] uppercase text-[10px] tracking-wider font-bold">
            <tr>
              <th className="px-5 py-3.5">Perusahaan &amp; Posisi</th>
              <th className="px-4 py-3.5">Kanal Portal</th>
              <th className="px-4 py-3.5">Status Lamaran</th>
              <th className="px-4 py-3.5">Tanggal Pengiriman</th>
              <th className="px-4 py-3.5">Tech Stack &amp; Ringkasan</th>
              <th className="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {filteredApps.map((app) => {
              const daysAgo = calculateDaysAgo(app.applied_date);
              const isFollowUpDue = app.status === 'applied' && daysAgo >= 7;
              const initials = getCompanyInitials(app.company_name);
              const avatarGrad = getAvatarGradient(app.company_name);

              return (
                <tr key={app.id} className="hover:bg-white/[0.03] transition group">
                  {/* Company & Role with Avatar */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${avatarGrad} flex items-center justify-center text-white text-xs font-extrabold shrink-0 shadow-sm`}>
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-white group-hover:text-indigo-300 transition">{app.company_name}</div>
                        <div className="text-xs text-slate-400">{app.job_title}</div>
                      </div>
                    </div>
                  </td>

                  {/* Portal */}
                  <td className="px-4 py-3.5">
                    <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getPortalBadge(app.source_portal)}`}>
                      {app.source_portal || 'Direct'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <select
                      value={app.status}
                      onChange={e => onStatusChange(app, e.target.value as ApplicationStatus)}
                      className="text-xs font-semibold bg-[#090d16] rounded-xl px-2.5 py-1.5 border border-white/[0.12] text-white outline-none cursor-pointer"
                    >
                      <option value="wishlist">Wishlist / Rencana</option>
                      <option value="applied">Lamaran Terkirim</option>
                      <option value="interview">Tahap Wawancara</option>
                      <option value="offer">Diterima / Penawaran</option>
                      <option value="rejected">Belum Berhasil</option>
                    </select>
                  </td>

                  {/* Date & Follow-up */}
                  <td className="px-4 py-3.5 text-slate-300 font-mono text-xs">
                    <div>{app.applied_date}</div>
                    <div className={`text-[10px] ${isFollowUpDue ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                      {daysAgo === 0 ? 'Hari ini' : `${daysAgo} hari lalu`}
                      {isFollowUpDue && ' • Perlu Follow-up!'}
                    </div>
                  </td>

                  {/* Skills & Summary */}
                  <td className="px-4 py-3.5 text-slate-400 text-xs max-w-sm truncate">
                    {app.summary || (app.key_skills && app.key_skills.join(', ')) || app.notes || '-'}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5 text-right space-x-1.5">
                    {app.cover_letter && (
                      <button
                        onClick={() => onOpenCoverLetter(app)}
                        className="p-2 text-sky-400 hover:text-sky-300 rounded-xl hover:bg-white/10 transition"
                        title="Baca Dokumen Cover Letter"
                      >
                        <FileText className="w-4 h-4 inline" />
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(app)}
                      className="p-2 text-slate-400 hover:text-sky-400 rounded-xl hover:bg-white/10 transition"
                      title="Edit Catatan"
                    >
                      <Edit3 className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => onDelete(app.id, app.company_name)}
                      className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-white/10 transition"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              );
            })}

            {filteredApps.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                  Tidak ada lamaran yang cocok dengan kriteria pencarian atau filter aktif.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
