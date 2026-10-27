'use client';

import { useState } from 'react';
import { JobApplication } from '@/lib/types';

export interface SyncNotification {
  type: 'success' | 'error';
  message: string;
  details?: string;
}

export function useApplicationsSync(
  setApplications: React.Dispatch<React.SetStateAction<JobApplication[]>>,
  loadData: () => Promise<void>,
  setUnparsedCount: React.Dispatch<React.SetStateAction<number>>
) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isBatchParsing, setIsBatchParsing] = useState(false);
  const [syncNotification, setSyncNotification] = useState<SyncNotification | null>(null);

  const mergeAndStoreApplications = (incomingApps: JobApplication[]) => {
    setApplications(prev => {
      const prevMap = new Map(prev.map(a => [a.id, a]));
      const merged: JobApplication[] = incomingApps.map((incoming: JobApplication) => {
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
  };

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
          mergeAndStoreApplications(data.applications);
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
          mergeAndStoreApplications(data.applications);
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

  return {
    isSyncing,
    isBatchParsing,
    syncNotification,
    setSyncNotification,
    handleBatchParse,
    handleSyncResumes,
  };
}
