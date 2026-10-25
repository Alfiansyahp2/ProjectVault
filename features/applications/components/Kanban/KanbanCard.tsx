'use client';

import React from 'react';
import { 
  Edit3, 
  Trash2, 
  Calendar, 
  AlertTriangle, 
  Eye, 
  GripVertical 
} from 'lucide-react';
import { JobApplication, ApplicationStatus } from '@/lib/types';
import { 
  getPortalBadge, 
  getCompanyInitials, 
  getAvatarGradient, 
  calculateDaysAgo 
} from '@/lib/utils';

interface KanbanCardProps {
  app: JobApplication;
  isDragged: boolean;
  onDragStart: (e: React.DragEvent, appId: string) => void;
  onDragEnd: () => void;
  onEdit: (app: JobApplication) => void;
  onDelete: (id: string, company: string) => void;
  onOpenCoverLetter: (app: JobApplication) => void;
  onStatusChange: (app: JobApplication, newStatus: ApplicationStatus) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  app,
  isDragged,
  onDragStart,
  onDragEnd,
  onEdit,
  onDelete,
  onOpenCoverLetter,
  onStatusChange,
}) => {
  const daysAgo = calculateDaysAgo(app.applied_date);
  const isFollowUpDue = app.status === 'applied' && daysAgo >= 7;
  const initials = getCompanyInitials(app.company_name);
  const avatarGrad = getAvatarGradient(app.company_name);

  return (
    <div
      draggable={true}
      onDragStart={(e) => onDragStart(e, app.id)}
      onDragEnd={onDragEnd}
      className={`group relative bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-indigo-500/40 rounded-xl p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 cursor-grab active:cursor-grabbing select-none ${
        isDragged ? 'opacity-30 scale-95 border-dashed border-indigo-400 ring-2 ring-indigo-400/30' : ''
      } ${
        isFollowUpDue ? 'ring-1 ring-amber-500/30' : ''
      }`}
    >
      {/* Company Header with Avatar Initial & Drag Handle */}
      <div className="flex items-start gap-2.5">
        <div className="flex items-center gap-1.5 shrink-0">
          <GripVertical className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 opacity-40 group-hover:opacity-100 transition" />
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${avatarGrad} flex items-center justify-center text-white text-[11px] font-extrabold shadow-sm`}>
            {initials}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs sm:text-sm font-bold text-white leading-snug truncate group-hover:text-indigo-300 transition" title={app.company_name}>
            {app.company_name}
          </h4>
          <p className="text-xs font-medium text-slate-300 truncate mt-0.5" title={app.job_title}>
            {app.job_title}
          </p>
        </div>
        
        {/* Quick Card Edit/Delete Icons */}
        <div 
          className="flex items-center opacity-70 group-hover:opacity-100 transition shrink-0"
          draggable={false}
          onMouseDown={e => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(app);
            }}
            className="p-1 text-slate-400 hover:text-sky-400 rounded transition"
            title="Edit Catatan"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(app.id, app.company_name);
            }}
            className="p-1 text-slate-400 hover:text-rose-400 rounded transition"
            title="Hapus"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Portal Pill & Date */}
      <div className="flex items-center justify-between gap-2 mt-2.5 text-[10px]">
        <span className={`font-semibold px-2 py-0.5 rounded-full border truncate max-w-[140px] ${getPortalBadge(app.source_portal)}`}>
          {app.source_portal || 'Direct'}
        </span>
        <span className="text-slate-400 flex items-center gap-1 font-mono">
          <Calendar className="w-3 h-3 text-slate-400" />
          {app.applied_date}
        </span>
      </div>

      {/* Skills preview */}
      {app.key_skills && app.key_skills.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap mt-2.5">
          {app.key_skills.slice(0, 3).map((sk, idx) => (
            <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/[0.05] text-slate-300 border border-white/[0.06]">
              {sk}
            </span>
          ))}
          {app.key_skills.length > 3 && (
            <span className="text-[10px] text-slate-400 font-medium">
              +{app.key_skills.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Follow up due alert indicator */}
      {isFollowUpDue && (
        <div className="mt-2.5 p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[10px] text-amber-300 font-bold flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
          <span>Perlu Follow-up ({daysAgo} hari)</span>
        </div>
      )}

      {/* Card Footer Toolbar */}
      <div 
        className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs"
        draggable={false}
        onMouseDown={e => e.stopPropagation()}
      >
        {app.cover_letter ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenCoverLetter(app);
            }}
            className="text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition"
            title="Buka dokumen cover letter lengkap"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Cover Letter</span>
          </button>
        ) : (
          <span className="text-[10px] text-slate-400">Tanpa arsip</span>
        )}

        {/* Quick Status Dropdown */}
        <select
          draggable={false}
          onMouseDown={e => e.stopPropagation()}
          value={app.status}
          onChange={e => {
            e.stopPropagation();
            onStatusChange(app, e.target.value as ApplicationStatus);
          }}
          className="text-[10px] font-semibold bg-[#0b1220] border border-white/[0.12] rounded-lg px-2 py-1 text-slate-300 hover:border-indigo-500/40 outline-none transition cursor-pointer"
        >
          <option value="wishlist">Wishlist</option>
          <option value="applied">Terkirim</option>
          <option value="interview">Wawancara</option>
          <option value="offer">Diterima</option>
          <option value="rejected">Ditolak</option>
        </select>
      </div>
    </div>
  );
};
