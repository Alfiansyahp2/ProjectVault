'use client';

import React, { useState } from 'react';
import { FolderGit2 } from 'lucide-react';
import { Project } from '@/lib/types';
import { useProjects } from '../hooks/use-projects';
import { useProjectFilters } from '../hooks/use-project-filters';
import { formatProjectForClipboard } from '../utils';
import { ProjectStats } from './ProjectStats';
import { ProjectNotificationBanner } from './ProjectNotificationBanner';
import { ProjectFilterBar } from './ProjectFilterBar';
import { ProjectGrid } from './ProjectGrid';
import { ProjectTableView } from './ProjectTableView';
import ProjectModal from '@/components/ProjectModal';
import AiPromptModal from '@/components/AiPromptModal';
import ProjectDetailModal from '@/components/ProjectDetailModal';
import TechStackModal from '@/components/TechStackModal';

export const ProjectsView: React.FC = () => {
  const {
    projects,
    profile,
    isLoading,
    isSyncing,
    syncNotification,
    setSyncNotification,
    loadData,
    handleSyncFromMd,
    handleSave,
    handleDelete,
  } = useProjects();

  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    viewMode,
    setViewMode,
    filteredProjects,
    categoryStats,
    categories,
    totalTech,
    totalAchievements,
  } = useProjectFilters(projects);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [detailProject, setDetailProject] = useState<Project | null>(null);
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);
  const [selectedProjectForTech, setSelectedProjectForTech] = useState<Project | null>(null);

  const handleOpenTechModal = (p?: Project) => {
    setSelectedProjectForTech(p || null);
    setIsTechModalOpen(true);
  };

  const handleCopyProject = (p: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = formatProjectForClipboard(p);
    navigator.clipboard.writeText(text);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEditProject = (p: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(p);
    setIsModalOpen(true);
  };

  const handleDeleteProject = async (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const deleted = await handleDelete(id, title);
    if (deleted && detailProject && detailProject.id === id) {
      setDetailProject(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      {/* Top Header Banner & Actions */}
      <ProjectStats
        totalProjects={projects.length}
        totalTech={totalTech}
        totalAchievements={totalAchievements}
        isLoading={isLoading}
        isSyncing={isSyncing}
        onRefresh={loadData}
        onSync={handleSyncFromMd}
        onOpenAiPrompt={() => setIsAiModalOpen(true)}
        onAddProject={() => {
          setEditingProject(null);
          setIsModalOpen(true);
        }}
        onOpenTechModal={() => handleOpenTechModal()}
      />

      {/* Sync Notification Banner */}
      <ProjectNotificationBanner
        notification={syncNotification}
        onClose={() => setSyncNotification(null)}
      />

      {/* Search, Filter Tabs & View Switcher */}
      <ProjectFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        categories={categories}
        categoryStats={categoryStats}
        totalProjects={projects.length}
        filteredCount={filteredProjects.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* PROJECTS CONTAINER */}
      {viewMode === 'grid' ? (
        <ProjectGrid
          projects={filteredProjects}
          onSelect={setDetailProject}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
          copiedId={copiedId}
          onCopy={handleCopyProject}
          onOpenTechModal={handleOpenTechModal}
        />
      ) : (
        <ProjectTableView
          projects={filteredProjects}
          onSelect={setDetailProject}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
          copiedId={copiedId}
          onCopy={handleCopyProject}
          onOpenTechModal={handleOpenTechModal}
        />
      )}

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-16 glass-panel rounded-3xl border border-dashed border-white/10 p-8 space-y-3">
          <FolderGit2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">
            Tidak ada proyek yang sesuai dengan kriteria pencarian
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Coba bersihkan kata kunci pencarian atau ubah filter kategori untuk melihat proyek lainnya.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/[0.08] transition cursor-pointer"
          >
            Reset Semua Filter
          </button>
        </div>
      )}

      {/* DETAIL MODAL */}
      <ProjectDetailModal
        isOpen={Boolean(detailProject)}
        project={detailProject}
        onClose={() => setDetailProject(null)}
        onOpenTechModal={(p) => handleOpenTechModal(p)}
        onEdit={(p) => {
          setEditingProject(p);
          setIsModalOpen(true);
        }}
        onDelete={async (id, title) => {
          const deleted = await handleDelete(id, title);
          if (deleted && detailProject && detailProject.id === id) {
            setDetailProject(null);
          }
        }}
      />

      {/* CREATE / EDIT MODAL */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        onSave={async (project) => {
          await handleSave(project);
          if (detailProject && detailProject.id === project.id) {
            setDetailProject(project);
          }
        }}
        initialData={editingProject}
      />

      {/* AI PROMPT MODAL */}
      <AiPromptModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        projects={projects}
        profile={profile}
      />

      {/* TECH STACK ECOSYSTEM & PROJECT MODAL */}
      <TechStackModal
        isOpen={isTechModalOpen}
        onClose={() => setIsTechModalOpen(false)}
        projects={projects}
        initialProject={selectedProjectForTech}
        onSelectProject={(p) => {
          setSelectedProjectForTech(p);
        }}
      />
    </div>
  );
};
