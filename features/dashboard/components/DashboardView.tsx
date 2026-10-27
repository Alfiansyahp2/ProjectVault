'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Project, JobApplication, UserProfile } from '@/lib/types';
import { getProjects, getApplications, getUserProfile, saveProject, saveApplication } from '@/lib/storage';
import { DashboardHeroBanner } from './DashboardHeroBanner';
import { DashboardFollowUpAlert } from './DashboardFollowUpAlert';
import { DashboardMetrics } from './DashboardMetrics';
import { RecentProjectsCard } from './RecentProjectsCard';
import { RecentApplicationsCard } from './RecentApplicationsCard';
import ProjectModal from '@/components/ProjectModal';
import ApplicationModal from '@/components/ApplicationModal';
import AiPromptModal from '@/components/AiPromptModal';
import TechStackModal from '@/components/TechStackModal';

export const DashboardView: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [profile, setProfile] = useState<UserProfile>({ name: '', headline: '' });
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);
  const [selectedProjectForTech, setSelectedProjectForTech] = useState<Project | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const p = await getProjects();
      const a = await getApplications();
      const prof = getUserProfile();
      setProjects(p);
      setApplications(a);
      setProfile(prof);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveProject = async (p: Project) => {
    await saveProject(p);
    loadData();
  };

  const handleSaveApplication = async (app: JobApplication) => {
    await saveApplication(app);
    loadData();
  };

  const copyProjectSummary = (p: Project) => {
    const text = `Proyek: ${p.title} (${p.role})\nTeknologi: ${p.technologies.join(', ')}\nDeskripsi: ${p.description}${p.achievements ? `\nHasil Terukur: ${p.achievements}` : ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Follow-up calculations (applied >= 7 days ago and still in 'applied' status)
  const followUpNeeded = applications.filter(a => {
    if (a.status !== 'applied') return false;
    const appliedTime = new Date(a.applied_date).getTime();
    const daysAgo = (Date.now() - appliedTime) / (1000 * 60 * 60 * 24);
    return daysAgo >= 7;
  });

  const interviewCount = applications.filter(a => a.status === 'interview').length;
  const offerCount = applications.filter(a => a.status === 'offer').length;

  const totalTech = useMemo(() => {
    const all = new Set<string>();
    projects.forEach(p => (p.technologies || []).forEach(t => all.add(t.toLowerCase().trim())));
    return all.size;
  }, [projects]);

  const handleOpenTechModal = (proj?: Project) => {
    setSelectedProjectForTech(proj || null);
    setIsTechModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero / Welcome Banner */}
      <DashboardHeroBanner
        profile={profile}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onOpenTechModal={() => handleOpenTechModal()}
      />

      {/* Follow-up Smart Alert Banner */}
      <DashboardFollowUpAlert followUpNeeded={followUpNeeded} />

      {/* Key Metrics Grid */}
      <DashboardMetrics
        totalProjects={projects.length}
        totalApplications={applications.length}
        interviewCount={interviewCount}
        offerCount={offerCount}
        totalTech={totalTech}
        onOpenTechStackModal={() => handleOpenTechModal()}
      />

      {/* Main Sections: Recent Projects & Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentProjectsCard
          projects={projects}
          copiedId={copiedId}
          onCopySummary={copyProjectSummary}
          onAddProject={() => setIsProjectModalOpen(true)}
          onOpenTechStackModal={handleOpenTechModal}
        />

        <RecentApplicationsCard
          applications={applications}
          onAddApplication={() => setIsAppModalOpen(true)}
        />
      </div>

      {/* Modals */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleSaveProject}
      />
      <ApplicationModal
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
        onSave={handleSaveApplication}
      />
      <AiPromptModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        projects={projects}
        profile={profile}
      />
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
