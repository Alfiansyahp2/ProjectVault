'use client';

import React, { useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  RefreshCw 
} from 'lucide-react';
import { JobApplication } from '@/lib/types';
import ApplicationModal from '@/components/ApplicationModal';
import { useApplications } from '../hooks/use-applications';
import { useApplicationFilters } from '../hooks/use-application-filters';
import { useKanbanDnd } from '../hooks/use-kanban-dnd';
import { ApplicationsStats } from './ApplicationsStats';
import { ApplicationsIngestionBanner } from './ApplicationsIngestionBanner';
import { ApplicationsFilterBar } from './ApplicationsFilterBar';
import { KanbanBoard } from './Kanban/KanbanBoard';
import { ApplicationsTableView } from './ApplicationsTableView';
import { CoverLetterModal } from './CoverLetterModal';

export const ApplicationsView: React.FC = () => {
  // Data hook
  const {
    applications,
    isLoading,
    isSyncing,
    isBatchParsing,
    unparsedCount,
    totalPdfFiles,
    syncNotification,
    handleBatchParse,
    handleSyncResumes,
    handleSave,
    handleDelete,
    handleStatusChange,
  } = useApplications();

  // Filter hook
  const {
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    selectedPortal,
    setSelectedPortal,
    sortBy,
    setSortBy,
    onlyFollowUpDue,
    setOnlyFollowUpDue,
    onlyHasCoverLetter,
    setOnlyHasCoverLetter,
    portalCounts,
    uniquePortals,
    followUpDueCount,
    parsedProgressPercent,
    filteredApps,
    resetFilters,
    isFilteringActive,
  } = useApplicationFilters(applications, totalPdfFiles);

  // Kanban DnD hook
  const {
    draggedAppId,
    dragOverCol,
    handleDragStart,
    handleDragEnd,
    handleColumnDragOver,
    handleColumnDragLeave,
    handleColumnDrop,
  } = useKanbanDnd(applications, handleStatusChange);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<{
    title: string;
    company: string;
    job: string;
    date: string;
    portal: string;
    text: string;
    skills?: string[];
  } | null>(null);

  const appliedCount = applications.filter(a => a.status === 'applied').length;
  const interviewCount = applications.filter(a => a.status === 'interview').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
              </span>
              Pelacak Lamaran Kerja
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {applications.length} Dokumen
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Visualisasikan tahapan seleksi karir, pantau jadwal follow-up, dan telusuri arsip surat lamaran.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleSyncResumes}
            disabled={isSyncing || isBatchParsing}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.1] hover:border-indigo-500/40 transition disabled:opacity-50 cursor-pointer shadow-sm active:scale-95"
            title="Pindai ulang seluruh berkas di folder data/resume"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
            <span>{isSyncing ? 'Memindai Semua...' : 'Pindai Folder Resume'}</span>
          </button>

          <button
            onClick={() => {
              setEditingApp(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Catatan</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <ApplicationsStats
        totalCount={applications.length}
        appliedCount={appliedCount}
        interviewCount={interviewCount}
        followUpDueCount={followUpDueCount}
        parsedProgressPercent={parsedProgressPercent}
        totalPdfFiles={totalPdfFiles}
        onlyFollowUpDue={onlyFollowUpDue}
        onToggleFollowUp={() => setOnlyFollowUpDue(prev => !prev)}
      />

      {/* Ingestion & Batch Control Banner */}
      <ApplicationsIngestionBanner
        unparsedCount={unparsedCount}
        isBatchParsing={isBatchParsing}
        isSyncing={isSyncing}
        onBatchParse={handleBatchParse}
        syncNotification={syncNotification}
      />

      {/* Filter & Search Toolbar */}
      <ApplicationsFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onlyFollowUpDue={onlyFollowUpDue}
        onToggleFollowUp={() => setOnlyFollowUpDue(prev => !prev)}
        onlyHasCoverLetter={onlyHasCoverLetter}
        onToggleCoverLetter={() => setOnlyHasCoverLetter(prev => !prev)}
        selectedPortal={selectedPortal}
        onSelectPortal={setSelectedPortal}
        portalCounts={portalCounts}
        uniquePortals={uniquePortals}
        totalApps={applications.length}
        filteredCount={filteredApps.length}
        followUpDueCount={followUpDueCount}
        onResetFilters={resetFilters}
        isFilteringActive={isFilteringActive}
      />

      {/* Main View: Kanban vs Table */}
      {viewMode === 'kanban' ? (
        <KanbanBoard
          filteredApps={filteredApps}
          dragOverCol={dragOverCol}
          draggedAppId={draggedAppId}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onColumnDragOver={handleColumnDragOver}
          onColumnDragLeave={handleColumnDragLeave}
          onColumnDrop={handleColumnDrop}
          onEdit={(app) => {
            setEditingApp(app);
            setIsModalOpen(true);
          }}
          onDelete={handleDelete}
          onOpenCoverLetter={(app) => {
            setSelectedCoverLetter({
              title: `${app.company_name} — ${app.job_title}`,
              company: app.company_name,
              job: app.job_title,
              date: app.applied_date,
              portal: app.source_portal || 'Direct',
              text: app.cover_letter || '',
              skills: app.key_skills
            });
          }}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <ApplicationsTableView
          filteredApps={filteredApps}
          onEdit={(app) => {
            setEditingApp(app);
            setIsModalOpen(true);
          }}
          onDelete={handleDelete}
          onOpenCoverLetter={(app) => {
            setSelectedCoverLetter({
              title: `${app.company_name} — ${app.job_title}`,
              company: app.company_name,
              job: app.job_title,
              date: app.applied_date,
              portal: app.source_portal || 'Direct',
              text: app.cover_letter || '',
              skills: app.key_skills
            });
          }}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Cover Letter Reader Modal */}
      <CoverLetterModal
        coverLetter={selectedCoverLetter}
        onClose={() => setSelectedCoverLetter(null)}
      />

      {/* Application Form / Parser Modal */}
      {isModalOpen && (
        <ApplicationModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingApp(null);
          }}
          onSave={async (app) => {
            await handleSave(app);
            setIsModalOpen(false);
            setEditingApp(null);
          }}
          initialData={editingApp}
        />
      )}
    </div>
  );
};
