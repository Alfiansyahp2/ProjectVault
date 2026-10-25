'use client';

import React from 'react';
import { KanbanColumnConfig } from '../../constants';
import { JobApplication, ApplicationStatus } from '@/lib/types';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  col: KanbanColumnConfig;
  items: JobApplication[];
  dragOverCol: ApplicationStatus | null;
  draggedAppId: string | null;
  onDragStart: (e: React.DragEvent, appId: string) => void;
  onDragEnd: () => void;
  onColumnDragOver: (e: React.DragEvent, colKey: ApplicationStatus) => void;
  onColumnDragLeave: (e: React.DragEvent, colKey: ApplicationStatus) => void;
  onColumnDrop: (e: React.DragEvent, colKey: ApplicationStatus) => void;
  onEdit: (app: JobApplication) => void;
  onDelete: (id: string, company: string) => void;
  onOpenCoverLetter: (app: JobApplication) => void;
  onStatusChange: (app: JobApplication, newStatus: ApplicationStatus) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  col,
  items,
  dragOverCol,
  draggedAppId,
  onDragStart,
  onDragEnd,
  onColumnDragOver,
  onColumnDragLeave,
  onColumnDrop,
  onEdit,
  onDelete,
  onOpenCoverLetter,
  onStatusChange,
}) => {
  const IconComp = col.icon;
  const isOver = dragOverCol === col.key;

  return (
    <div
      onDragOver={(e) => onColumnDragOver(e, col.key)}
      onDragLeave={(e) => onColumnDragLeave(e, col.key)}
      onDrop={(e) => onColumnDrop(e, col.key)}
      className={`bg-[#0b1220]/70 border ${
        isOver
          ? 'border-indigo-500 ring-2 ring-indigo-500/50 bg-indigo-950/30 shadow-indigo-500/10'
          : 'border-white/[0.07]'
      } ${col.borderTop} border-t-2 rounded-2xl p-3.5 flex flex-col min-h-[550px] shadow-lg backdrop-blur-sm transition-all duration-150`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <IconComp className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-white tracking-tight">
            {col.label}
          </span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${col.badge}`}>
          {items.length}
        </span>
      </div>

      {/* Cards Container */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-0.5 min-h-[120px]">
        {/* Drop zone feedback */}
        {isOver && (
          <div className="py-3 px-2 border-2 border-dashed border-indigo-400/60 rounded-xl bg-indigo-500/10 text-center text-xs font-bold text-indigo-300 animate-pulse transition">
            Lepas untuk memindahkan ke {col.label}
          </div>
        )}

        {items.map((app) => (
          <KanbanCard
            key={app.id}
            app={app}
            isDragged={draggedAppId === app.id}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onEdit={onEdit}
            onDelete={onDelete}
            onOpenCoverLetter={onOpenCoverLetter}
            onStatusChange={onStatusChange}
          />
        ))}

        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 space-y-1">
            <IconComp className="w-6 h-6 opacity-30" />
            <p className="text-xs font-semibold">Tidak ada lamaran</p>
          </div>
        )}
      </div>
    </div>
  );
};
