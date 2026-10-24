'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Building2, 
  FileText,
  AlertTriangle,
  LayoutGrid,
  ListFilter,
  RefreshCw,
  CheckCircle2,
  X,
  Tag,
  Globe,
  Layers,
  TrendingUp
} from 'lucide-react';
import { JobApplication, ApplicationStatus } from '@/lib/types';
import { getApplications, saveApplication, deleteApplication } from '@/lib/storage';
import ApplicationModal from '@/components/ApplicationModal';

const STATUS_COLUMNS: { key: ApplicationStatus; label: string; color: string; badge: string }[] = [
  { key: 'wishlist', label: 'Wishlist / Rencana', color: 'border-zinc-300 dark:border-zinc-700', badge: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' },
  { key: 'applied', label: 'Lamaran Terkirim', color: 'border-blue-400 dark:border-blue-800', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' },
  { key: 'interview', label: 'Tahap Wawancara', color: 'border-amber-400 dark:border-amber-800', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' },
  { key: 'offer', label: 'Diterima / Penawaran', color: 'border-emerald-400 dark:border-emerald-800', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
  { key: 'rejected', label: 'Belum Berhasil', color: 'border-rose-300 dark:border-rose-900', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' },
];

function getPortalBadge(portal?: string) {
  const p = (portal || '').toLowerCase();
  if (p.includes('jobstreet')) return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  if (p.includes('linkedin')) return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
  if (p.includes('glints')) return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
  if (p.includes('kalibrr')) return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
  if (p.includes('instagram')) return 'bg-pink-500/15 text-pink-300 border-pink-500/30';
  if (p.includes('website')) return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
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

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<{ title: string; text: string } | null>(null);

  const checkSyncStatus = async () => {
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
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/applications/sync');
      const syncData = await res.json();
      
      if (typeof syncData.unparsedCount === 'number') {
        setUnparsedCount(syncData.unparsedCount);
      }
      if (typeof syncData.totalPdfFiles === 'number') {
        setTotalPdfFiles(syncData.totalPdfFiles);
      }

      if (syncData.applications && Array.isArray(syncData.applications) && syncData.applications.length > 0) {
        setApplications(syncData.applications);
        if (typeof window !== 'undefined') {
          localStorage.setItem('tracker_applications_data', JSON.stringify(syncData.applications));
        }
      } else {
        const apps = await getApplications();
        setApplications(apps);
      }
    } catch (e) {
      console.error('Error loading applications:', e);
      try {
        const apps = await getApplications();
        setApplications(apps);
      } catch {}
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    checkSyncStatus();
  }, []);

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
          setApplications(data.applications);
          if (typeof window !== 'undefined') {
            localStorage.setItem('tracker_applications_data', JSON.stringify(data.applications));
          }
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
          setApplications(data.applications);
          if (typeof window !== 'undefined') {
            localStorage.setItem('tracker_applications_data', JSON.stringify(data.applications));
          }
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
    await saveApplication(app);
    loadData();
  };

  const handleDelete = async (id: string, company: string) => {
    if (confirm(`Hapus catatan lamaran di "${company}"?`)) {
      await deleteApplication(id);
      loadData();
    }
  };

  const handleStatusChange = async (app: JobApplication, newStatus: ApplicationStatus) => {
    await saveApplication({ ...app, status: newStatus });
    loadData();
  };

  const calculateDaysAgo = (dateStr: string) => {
    if (!dateStr) return 0;
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  // Metrics
  const uniqueCompanies = useMemo(() => new Set(applications.map(a => a.company_name)).size, [applications]);
  const portalCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach(a => {
      const p = a.source_portal || 'Direct';
      counts[p] = (counts[p] || 0) + 1;
    });
    return counts;
  }, [applications]);

  const topPortal = useMemo(() => {
    let top = 'Jobstreet';
    let max = 0;
    Object.entries(portalCounts).forEach(([p, count]) => {
      if (count > max && p !== 'Direct / Job Portal') {
        max = count;
        top = p;
      }
    });
    return top;
  }, [portalCounts]);

  const filteredApps = applications.filter(a =>
    a.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.source_portal && a.source_portal.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (a.notes && a.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (a.key_skills && a.key_skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/10 shrink-0">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                  Pelacak Lamaran Kerja (*Job Tracker*)
                </h1>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                  Local Document Intelligence
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Pantau setiap posisi yang Anda lamar, arsipkan cover letter yang dikirim, dan tindak lanjuti tahapan wawancara.
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap mt-4 text-xs font-medium text-slate-300">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              <span><strong>{applications.length}</strong> Total Lamaran</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <Building2 className="w-3.5 h-3.5 text-sky-400" />
              <span><strong>{uniqueCompanies}</strong> Perusahaan Unik</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>Top Kanal: <strong>{topPortal}</strong> ({portalCounts[topPortal] || 0})</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span><strong>{applications.filter(a => a.status === 'applied').length}</strong> Terkirim Aktif</span>
            </div>
            {unparsedCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span><strong>{unparsedCount}</strong> Belum di-Parse</span>
              </div>
            )}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => loadData()}
            className="p-2.5 rounded-xl text-xs font-semibold border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 transition"
            title="Muat ulang data dari Cloud / Database"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          {/* PARSE 5 BERKAS BARU BUTTON (User Requested Batch Flow) */}
          <button
            onClick={() => handleBatchParse(5)}
            disabled={isBatchParsing || isSyncing || unparsedCount === 0}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all shadow-sm ${
              unparsedCount > 0
                ? 'border-amber-500/40 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-200 shadow-amber-500/10 hover:scale-[1.02] active:scale-95'
                : 'border-zinc-700/50 bg-zinc-800/40 text-zinc-500 cursor-not-allowed'
            }`}
            title={
              unparsedCount > 0
                ? `Parse 5 berkas PDF berikutnya dari folder resume (${unparsedCount} berkas tersisa)`
                : 'Semua 91 berkas resume telah selesai di-parse!'
            }
          >
            <Sparkles className={`w-4 h-4 text-amber-400 ${isBatchParsing ? 'animate-spin' : ''}`} />
            <span>
              {isBatchParsing
                ? 'Mem-parse 5 Berkas...'
                : unparsedCount > 0
                ? `Parse 5 Berkas Baru (${unparsedCount} tersisa)`
                : '✓ Semua 91 Berkas Ter-parse'}
            </span>
          </button>

          {/* Scan & Sync from data/resume button (All remaining) */}
          <button
            onClick={handleSyncResumes}
            disabled={isSyncing || isBatchParsing}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 shadow-sm shadow-indigo-500/10 transition disabled:opacity-50"
            title="Pindai dan sinkronkan seluruh 91 PDF sekaligus ke database"
          >
            <Layers className={`w-4 h-4 text-indigo-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Memindai Semua...' : 'Sync Semua (91 PDF)'}</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" /> Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <ListFilter className="w-4 h-4" /> Daftar
            </button>
          </div>

          <button
            onClick={() => {
              setEditingApp(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Lamaran Baru</span>
          </button>
        </div>
      </div>

      {/* Unparsed Batch Reminder Banner */}
      {unparsedCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-200 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-amber-100">
                {unparsedCount} Berkas Surat Lamaran Belum Dimasukkan
              </p>
              <p className="text-[11px] text-amber-300/80 mt-0.5">
                Total {totalPdfFiles} berkas PDF ditemukan di <code className="text-amber-200">data/resume</code>. Anda dapat memasukkannya secara bertahap 5 per 5 agar mudah dipantau.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleBatchParse(5)}
              disabled={isBatchParsing || isSyncing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition shadow-sm disabled:opacity-50 active:scale-95"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isBatchParsing ? 'animate-spin' : ''}`} />
              <span>{isBatchParsing ? 'Memproses 5...' : `Parse 5 Berkas Baru`}</span>
            </button>
            <button
              onClick={() => handleBatchParse('all')}
              disabled={isBatchParsing || isSyncing}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.12] text-amber-200 border border-amber-500/30 transition disabled:opacity-50"
              title="Parse seluruh berkas yang tersisa sekaligus"
            >
              Parse Semua ({unparsedCount})
            </button>
          </div>
        </div>
      )}

      {/* Sync Notification Banner */}
      {syncNotification && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all animate-in fade-in slide-in-from-top-2 ${
          syncNotification.type === 'success'
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
            : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              syncNotification.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold">{syncNotification.message}</p>
              {syncNotification.details && (
                <p className="text-[11px] text-emerald-300/80 mt-0.5">{syncNotification.details}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setSyncNotification(null)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Cari nama perusahaan, posisi pekerjaan (Full Stack, Backend), portal (Jobstreet, LinkedIn), atau tech stack..."
          className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#0b1220] text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5"
            title="Hapus pencarian"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Result Indicator */}
      <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
        <span>Menampilkan <strong>{filteredApps.length}</strong> dari {applications.length} lamaran</span>
        {searchQuery && (
          <span>Filter aktif: &ldquo;{searchQuery}&rdquo;</span>
        )}
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {STATUS_COLUMNS.map((col) => {
            const items = filteredApps.filter(a => a.status === col.key);
            return (
              <div
                key={col.key}
                className="bg-zinc-100/60 dark:bg-zinc-900/40 rounded-2xl p-3 border border-zinc-200 dark:border-zinc-800 flex flex-col min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    {col.label}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${col.badge}`}>
                    {items.length}
                  </span>
                </div>

                {/* Cards in column */}
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {items.map((app) => {
                    const daysAgo = calculateDaysAgo(app.applied_date);
                    const isFollowUpDue = app.status === 'applied' && daysAgo >= 7;

                    return (
                      <div
                        key={app.id}
                        className="bg-white dark:bg-[#0d1527] border border-zinc-200 dark:border-white/[0.08] hover:border-indigo-500/40 rounded-xl p-3.5 shadow-sm transition group"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="flex-1 min-w-0">
                            {/* Portal Tag */}
                            {app.source_portal && (
                              <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border mb-1.5 ${getPortalBadge(app.source_portal)}`}>
                                {app.source_portal}
                              </span>
                            )}
                            <h4 className="text-sm font-bold text-zinc-900 dark:text-white leading-tight truncate">
                              {app.company_name}
                            </h4>
                            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300 mt-0.5 truncate">
                              {app.job_title}
                            </p>
                          </div>
                          <div className="flex items-center shrink-0">
                            <button
                              onClick={() => {
                                setEditingApp(app);
                                setIsModalOpen(true);
                              }}
                              className="p-1 text-zinc-400 hover:text-blue-500 rounded"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(app.id, app.company_name)}
                              className="p-1 text-zinc-400 hover:text-rose-500 rounded"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Key Skills */}
                        {app.key_skills && app.key_skills.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap mt-2">
                            {app.key_skills.slice(0, 3).map((sk, idx) => (
                              <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-300 border border-white/[0.06]">
                                {sk}
                              </span>
                            ))}
                            {app.key_skills.length > 3 && (
                              <span className="text-[10px] text-slate-400">
                                +{app.key_skills.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Date & Follow-up */}
                        <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" /> {app.applied_date}
                          </span>
                          <span>{daysAgo === 0 ? 'Hari ini' : `${daysAgo} hari lalu`}</span>
                        </div>

                        {/* Alert if follow up due */}
                        {isFollowUpDue && (
                          <div className="mt-2 p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[10px] text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                            Saatnya follow up rekruter!
                          </div>
                        )}

                        {/* Quick Actions (Cover Letter & Status) */}
                        <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-white/[0.08] flex items-center justify-between text-xs">
                          {app.cover_letter ? (
                            <button
                              onClick={() => setSelectedCoverLetter({ title: `${app.company_name} - ${app.job_title}`, text: app.cover_letter || '' })}
                              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
                            >
                              <FileText className="w-3 h-3" /> Cover Letter
                            </button>
                          ) : (
                            <span className="text-[10px] text-zinc-400">Tanpa arsip teks</span>
                          )}

                          <select
                            value={app.status}
                            onChange={e => handleStatusChange(app, e.target.value as ApplicationStatus)}
                            className="text-[10px] bg-zinc-100 dark:bg-[#0b1220] border border-zinc-200 dark:border-white/10 rounded px-1.5 py-0.5 text-zinc-600 dark:text-zinc-300 outline-none"
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
                  })}

                  {items.length === 0 && (
                    <div className="text-center py-8 text-zinc-400 text-xs">
                      Kosong
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white dark:bg-[#0d1527] border border-zinc-200 dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-zinc-50 dark:bg-white/[0.03] text-zinc-500 dark:text-slate-400 border-b border-zinc-200 dark:border-white/[0.08]">
              <tr>
                <th className="px-4 py-3 font-semibold">Perusahaan &amp; Posisi</th>
                <th className="px-4 py-3 font-semibold">Kanal Portal</th>
                <th className="px-4 py-3 font-semibold">Status Tahapan</th>
                <th className="px-4 py-3 font-semibold">Tanggal Kirim</th>
                <th className="px-4 py-3 font-semibold">Ringkasan / Skills</th>
                <th className="px-4 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.06]">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition">
                  <td className="px-4 py-3">
                    <div className="font-bold text-zinc-900 dark:text-white">{app.company_name}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">{app.job_title}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getPortalBadge(app.source_portal)}`}>
                      {app.source_portal || 'Direct'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={app.status}
                      onChange={e => handleStatusChange(app, e.target.value as ApplicationStatus)}
                      className="text-xs bg-zinc-100 dark:bg-[#0b1220] rounded px-2 py-1 border border-zinc-300 dark:border-white/10 outline-none text-zinc-900 dark:text-white"
                    >
                      <option value="wishlist">Wishlist</option>
                      <option value="applied">Terkirim</option>
                      <option value="interview">Wawancara</option>
                      <option value="offer">Diterima</option>
                      <option value="rejected">Ditolak</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {app.applied_date}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-slate-400 text-xs max-w-xs truncate">
                    {app.summary || (app.key_skills && app.key_skills.join(', ')) || app.notes || '-'}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {app.cover_letter && (
                      <button
                        onClick={() => setSelectedCoverLetter({ title: `${app.company_name} - ${app.job_title}`, text: app.cover_letter || '' })}
                        className="p-1.5 text-indigo-400 hover:text-indigo-300 rounded hover:bg-white/10"
                        title="Lihat Cover Letter"
                      >
                        <FileText className="w-4 h-4 inline" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingApp(app);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-blue-400 rounded hover:bg-white/10"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(app.id, app.company_name)}
                      className="p-1.5 text-zinc-400 hover:text-rose-400 rounded hover:bg-white/10"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Cover Letter Modal */}
      {selectedCoverLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0b1220] border border-zinc-200 dark:border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-white/10">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Arsip Surat Lamaran: {selectedCoverLetter.title}
              </h3>
              <button
                onClick={() => setSelectedCoverLetter(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              readOnly
              rows={12}
              value={selectedCoverLetter.text}
              className="w-full p-4 font-sans text-xs rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/40 text-zinc-800 dark:text-zinc-200 outline-none select-all leading-relaxed"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedCoverLetter(null)}
                className="px-4 py-2 border border-white/10 hover:bg-white/5 rounded-xl text-xs text-slate-300"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedCoverLetter.text);
                  alert('Surat lamaran berhasil disalin ke clipboard!');
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-500/20"
              >
                Salin Teks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingApp(null);
        }}
        onSave={handleSave}
        initialData={editingApp}
      />
    </div>
  );
}
