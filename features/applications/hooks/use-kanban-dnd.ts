'use client';

import { useState } from 'react';
import { ApplicationStatus, JobApplication } from '@/lib/types';

export function useKanbanDnd(
  applications: JobApplication[],
  onStatusChange: (app: JobApplication, newStatus: ApplicationStatus) => void
) {
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<ApplicationStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, appId: string) => {
    e.dataTransfer.setData('text/plain', appId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedAppId(appId);
  };

  const handleDragEnd = () => {
    setDraggedAppId(null);
    setDragOverCol(null);
  };

  const handleColumnDragOver = (e: React.DragEvent, colKey: ApplicationStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colKey) {
      setDragOverCol(colKey);
    }
  };

  const handleColumnDragLeave = (e: React.DragEvent, colKey: ApplicationStatus) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverCol === colKey) {
      setDragOverCol(null);
    }
  };

  const handleColumnDrop = (e: React.DragEvent, colKey: ApplicationStatus) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('text/plain') || draggedAppId;
    setDragOverCol(null);
    setDraggedAppId(null);
    if (!appId) return;
    const targetApp = applications.find(a => a.id === appId);
    if (targetApp && targetApp.status !== colKey) {
      onStatusChange(targetApp, colKey);
    }
  };

  return {
    draggedAppId,
    dragOverCol,
    handleDragStart,
    handleDragEnd,
    handleColumnDragOver,
    handleColumnDragLeave,
    handleColumnDrop,
  };
}
