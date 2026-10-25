'use client';

import { useState, useEffect, useCallback } from 'react';
import { Project, UserProfile } from '@/lib/types';
import { getProjects, saveProject, deleteProject, getUserProfile } from '@/lib/storage';
import { ProjectNotification } from '../types';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [profile, setProfile] = useState<UserProfile>({ name: '', headline: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotification, setSyncNotification] = useState<ProjectNotification | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const p = await getProjects();
      const prof = getUserProfile();
      setProjects(p);
      setProfile(prof);
    } catch (e) {
      console.error('Error loading projects:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSyncFromMd = useCallback(async () => {
    setIsSyncing(true);
    setSyncNotification(null);
    try {
      const res = await fetch('/api/projects/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        if (data.projects && Array.isArray(data.projects)) {
          setProjects(data.projects);
        } else {
          await loadData();
        }

        const newCount = data.stats?.newGenerated || 0;
        const updatedCount = data.stats?.updated || 0;
        const total = data.stats?.total || 0;

        let detailMsg = `Total: ${total} proyek aktif terindeks.`;
        if (newCount > 0) detailMsg += ` (+${newCount} proyek baru dibuat)`;
        if (updatedCount > 0) detailMsg += ` (${updatedCount} proyek diperbarui)`;

        setSyncNotification({
          type: 'success',
          message: data.message || 'Sinkronisasi project.md berhasil!',
          details: detailMsg
        });
      } else {
        setSyncNotification({
          type: 'error',
          message: data.error || 'Gagal menyinkronkan project.md'
        });
      }
    } catch (err: any) {
      setSyncNotification({
        type: 'error',
        message: err.message || 'Terjadi kesalahan jaringan saat sync'
      });
    } finally {
      setIsSyncing(false);
    }
  }, [loadData]);

  const handleSave = useCallback(async (project: Project) => {
    await saveProject(project);
    await loadData();
  }, [loadData]);

  const handleDelete = useCallback(async (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus proyek "${title}" dari bank data?`)) {
      await deleteProject(id);
      await loadData();
      return true;
    }
    return false;
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    projects,
    profile,
    isLoading,
    isSyncing,
    syncNotification,
    setSyncNotification,
    loadData,
    handleSyncFromMd,
    handleSave,
    handleDelete
  };
}
