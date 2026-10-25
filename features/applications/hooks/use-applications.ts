'use client';

import { useState, useEffect, useCallback } from 'react';
import { JobApplication, ApplicationStatus } from '@/lib/types';
import { getApplications, saveApplication, deleteApplication } from '@/lib/storage';

export function useApplications() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isBatchParsing, setIsBatchParsing] = useState(false);
  const [unparsedCount, setUnparsedCount] = useState<number>(0);
  const [totalPdfFiles, setTotalPdfFiles] = useState<number>(91);
  const [syncNotification, setSyncNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    details?: string;
  } | null>(null);

  const checkSyncStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/applications/sync');
      const data = await res.json();
      if (typeof data.unparsedCount === 'number') {
        setUnparsedCount(data.unparsedCount);
      }
      if (typeof data.totalPdfFiles === 'number') {
        setTotalPdfFiles(data.totalPdfFiles);
      }
    } catch (e) {
      console.warn('Failed to fetch sync status', e);
    }
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch resume parser stats
      const res = await fetch('/api/applications/sync');
      const syncData = await res.json();
      
      if (typeof syncData.unparsedCount === 'number') {
        setUnparsedCount(syncData.unparsedCount);
      }
      if (typeof syncData.totalPdfFiles === 'number') {
        setTotalPdfFiles(syncData.totalPdfFiles);
      }

      // 2. Load persistent applications from storage (Appwrite -> LocalStorage)
      let storedApps = await getApplications();

      // Initial synchronization: merge parsed json into stored applications without overwriting user status/edits
      if (syncData.applications && Array.isArray(syncData.applications) && syncData.applications.length > 0) {
        if (!storedApps || storedApps.length === 0 || storedApps.length < syncData.applications.length) {
          const storedMap = new Map((storedApps || []).map(a => [a.id, a]));
          const merged: JobApplication[] = syncData.applications.map((incoming: JobApplication) => {
            const existing = storedMap.get(incoming.id);
            return existing ? { ...incoming, ...existing } : incoming;
          });
          (storedApps || []).forEach(sa => {
            if (!merged.some(m => m.id === sa.id)) {
              merged.push(sa);
            }
          });
          storedApps = merged;
          if (typeof window !== 'undefined') {
            localStorage.setItem('tracker_applications_data', JSON.stringify(storedApps));
          }
        }
      }

      setApplications(storedApps || []);
    } catch (e) {
      console.error('Error loading applications:', e);
      try {
        const apps = await getApplications();
        setApplications(apps || []);
      } catch {}
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    checkSyncStatus();
  }, [loadData, checkSyncStatus]);

  const handleBatchParse = async (batchSize: number | 'all' = 5) => {
    setIsBatchParsing(true);
    setSyncNotification(null);
    try {
      const res = await fetch('/api/applications/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchSize })
      });
      const data = await res.json();
      if (data.success) {
        if (data.applications && Array.isArray(data.applications)) {
          setApplications(prev => {
            const prevMap = new Map(prev.map(a => [a.id, a]));
            const merged: JobApplication[] = data.applications.map((incoming: JobApplication) => {
              const existing = prevMap.get(incoming.id);
              return existing ? { ...incoming, ...existing } : incoming;
            });
            prev.forEach(sa => {
              if (!merged.some(m => m.id === sa.id)) {
                merged.push(sa);
              }
            });
            if (typeof window !== 'undefined') {
              localStorage.setItem('tracker_applications_data', JSON.stringify(merged));
            }
            return merged;
          });
        } else {
          await loadData();
        }

        const remaining = typeof data.unparsedCount === 'number' ? data.unparsedCount : 0;
        setUnparsedCount(remaining);

        const newItems = (data.newlyParsed || []).map((p: any) => `${p.company_name} (${p.job_title})`);
        const detailsText = newItems.length > 0
          ? `Berkas baru dimasukkan: ${newItems.join(', ')}. Tersisa ${remaining} berkas di folder.`
          : `Tersisa ${remaining} berkas di folder.`;

        setSyncNotification({
          type: 'success',
          message: data.message || `Berhasil mem-parse ${data.batchProcessed || 5} berkas baru!`,
          details: detailsText
        });
      } else {
        setSyncNotification({
          type: 'error',
          message: data.error || 'Gagal mem-parse berkas resume'
        });
      }
    } catch (err: any) {
      setSyncNotification({
        type: 'error',
        message: err.message || 'Terjadi kesalahan jaringan saat mem-parse berkas resume'
      });
    } finally {
      setIsBatchParsing(false);
    }
  };

  const handleSyncResumes = async () => {
    setIsSyncing(true);
    setSyncNotification(null);
    try {
      const res = await fetch('/api/applications/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchSize: 'all' })
      });
      const data = await res.json();
      if (data.success) {
        if (data.applications && Array.isArray(data.applications)) {
          setApplications(prev => {
            const prevMap = new Map(prev.map(a => [a.id, a]));
            const merged: JobApplication[] = data.applications.map((incoming: JobApplication) => {
              const existing = prevMap.get(incoming.id);
              return existing ? { ...incoming, ...existing } : incoming;
            });
            prev.forEach(sa => {
              if (!merged.some(m => m.id === sa.id)) {
                merged.push(sa);
              }
            });
            if (typeof window !== 'undefined') {
              localStorage.setItem('tracker_applications_data', JSON.stringify(merged));
            }
            return merged;
          });
        } else {
          await loadData();
        }

        setUnparsedCount(0);
        const total = data.stats?.totalApplications || 0;
        const unique = data.stats?.uniqueCompanies || 0;
        const cloudSynced = data.stats?.appwriteSynced || 0;

        setSyncNotification({
          type: 'success',
          message: data.message || `Berhasil memindai ${total} berkas surat lamaran!`,
          details: `Total: ${total} lamaran | ${unique} perusahaan unik | ${cloudSynced} dokumen tersinkronkan ke Appwrite Cloud.`
        });
      } else {
        setSyncNotification({
          type: 'error',
          message: data.error || 'Gagal memindai folder data/resume'
        });
      }
    } catch (err: any) {
      setSyncNotification({
        type: 'error',
        message: err.message || 'Terjadi kesalahan jaringan saat memindai surat lamaran'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSave = async (app: JobApplication) => {
    try {
      const saved = await saveApplication(app);
      setApplications(prev => {
        const idx = prev.findIndex(a => a.id === app.id || a.id === saved.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [saved, ...prev];
      });
      return saved;
    } catch (err) {
      console.error('Failed to save application:', err);
      throw err;
    }
  };

  const handleDelete = async (id: string, company: string) => {
    if (confirm(`Hapus catatan lamaran di "${company}"?`)) {
      setApplications(prev => prev.filter(a => a.id !== id));
      try {
        await deleteApplication(id);
      } catch (err) {
        console.error('Failed to delete application:', err);
        const apps = await getApplications();
        setApplications(apps || []);
      }
    }
  };

  const handleStatusChange = async (app: JobApplication, newStatus: ApplicationStatus) => {
    if (app.status === newStatus) return;

    // 1. Optimistic UI update
    const updated: JobApplication = { ...app, status: newStatus };
    setApplications(prev => prev.map(a => (a.id === app.id ? updated : a)));

    // 2. Persist to storage (Appwrite + LocalStorage)
    try {
      await saveApplication(updated);
    } catch (err) {
      console.error('Failed to save status change:', err);
      setApplications(prev => prev.map(a => (a.id === app.id ? app : a)));
    }
  };

  return {
    applications,
    setApplications,
    isLoading,
    isSyncing,
    isBatchParsing,
    unparsedCount,
    totalPdfFiles,
    syncNotification,
    setSyncNotification,
    loadData,
    handleBatchParse,
    handleSyncResumes,
    handleSave,
    handleDelete,
    handleStatusChange,
  };
}
