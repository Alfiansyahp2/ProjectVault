'use client';

import React from 'react';
import { STATUS_COLUMNS } from '../../constants';
import { JobApplication, ApplicationStatus } from '@/lib/types';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  filteredApps: JobApplication[];
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

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  filteredApps,
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
      {STATUS_COLUMNS.map((col) => {
        const items = filteredApps.filter(a => a.status === col.key);
        return (
          <KanbanColumn
            key={col.key}
            col={col}
            items={items}
            dragOverCol={dragOverCol}
            draggedAppId={draggedAppId}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onColumnDragOver={onColumnDragOver}
            onColumnDragLeave={onColumnDragLeave}
            onColumnDrop={onColumnDrop}
            onEdit={onEdit}
            onDelete={onDelete}
            onOpenCoverLetter={onOpenCoverLetter}
            onStatusChange={onStatusChange}
          />
        );
      })}
    </div>
  );
};
