'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  TrendingUp,
  Send,
  MessageSquare,
  Award,
  XCircle,
  Copy,
  Check,
  Download,
  ArrowUpDown,
  Filter,
  ChevronRight,
  Eye,
  GripVertical
} from 'lucide-react';
import { JobApplication, ApplicationStatus } from '@/lib/types';
import { getApplications, saveApplication, deleteApplication } from '@/lib/storage';
import ApplicationModal from '@/components/ApplicationModal';

const STATUS_COLUMNS: { 
  key: ApplicationStatus; 
  label: string; 
  icon: any; 
  badge: string; 
  glow: string; 
  borderTop: string;
}[] = [
  { 
    key: 'wishlist', 
    label: 'Wishlist / Rencana', 
    icon: Briefcase, 
    badge: 'bg-slate-500/15 text-slate-300 border-slate-500/30', 
    glow: 'group-hover:border-slate-500/40',
    borderTop: 'border-t-slate-400'
  },
  { 
    key: 'applied', 
    label: 'Lamaran Terkirim', 
    icon: Send, 
    badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30', 
    glow: 'group-hover:border-blue-500/40',
    borderTop: 'border-t-blue-500'
  },
  { 
    key: 'interview', 
    label: 'Tahap Wawancara', 
    icon: MessageSquare, 
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30', 
    glow: 'group-hover:border-amber-500/40',
    borderTop: 'border-t-amber-500'
  },
  { 
    key: 'offer', 
    label: 'Diterima / Penawaran', 
    icon: Award, 
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', 
    glow: 'group-hover:border-emerald-500/40',
    borderTop: 'border-t-emerald-500'
  },
  { 
    key: 'rejected', 
    label: 'Belum Berhasil', 
    icon: XCircle, 
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30', 
    glow: 'group-hover:border-rose-500/40',
    borderTop: 'border-t-rose-500'
  },
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

function getCompanyInitials(name: string): string {
  if (!name) return 'CO';
  const clean = name.replace(/^(PT|CV|PT\.|CV\.)\s+/i, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

function getAvatarGradient(name: string): string {
  const gradients = [
    'from-indigo-500 to-purple-600',
    'from-blue-500 to-cyan-600',
    'from-sky-500 to-indigo-600',
    'from-purple-500 to-pink-600',
    'from-teal-500 to-emerald-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-red-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedPortal, setSelectedPortal] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'company_asc' | 'followup_due'>('date_desc');
  const [onlyFollowUpDue, setOnlyFollowUpDue] = useState<boolean>(false);
  const [onlyHasCoverLetter, setOnlyHasCoverLetter] = useState<boolean>(false);

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

  // Drag and drop state for Kanban
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<ApplicationStatus | null>(null);

  // Modals
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
  const [copiedLetter, setCopiedLetter] = useState(false);

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
            // Preserve user modifications (status, notes, etc.)
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
      setIsModalOpen(false);
      setEditingApp(null);
    } catch (err) {
      console.error('Failed to save application:', err);
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

    // 1. Optimistic UI update so card moves immediately without flicker or reversion
    const updated: JobApplication = { ...app, status: newStatus };
    setApplications(prev => prev.map(a => (a.id === app.id ? updated : a)));

    // 2. Persist to storage (Appwrite + LocalStorage)
    try {
      await saveApplication(updated);
    } catch (err) {
      console.error('Failed to save status change:', err);
      // Revert if saving fails
      setApplications(prev => prev.map(a => (a.id === app.id ? app : a)));
    }
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

  const followUpDueCount = useMemo(() => {
    return applications.filter(a => a.status === 'applied' && calculateDaysAgo(a.applied_date) >= 7).length;
  }, [applications]);

  const interviewCount = useMemo(() => applications.filter(a => a.status === 'interview').length, [applications]);
  const offerCount = useMemo(() => applications.filter(a => a.status === 'offer').length, [applications]);

  // Filtering & Sorting
  const filteredApps = useMemo(() => {
    return applications
      .filter(a => {
        // Search
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch = !q || (
          a.company_name.toLowerCase().includes(q) ||
          a.job_title.toLowerCase().includes(q) ||
          (a.source_portal && a.source_portal.toLowerCase().includes(q)) ||
          (a.notes && a.notes.toLowerCase().includes(q)) ||
          (a.key_skills && a.key_skills.some(s => s.toLowerCase().includes(q)))
        );

        // Portal filter
        const matchesPortal = selectedPortal === 'all' || (a.source_portal || 'Direct').toLowerCase().includes(selectedPortal.toLowerCase());

        // Follow up filter
        const daysAgo = calculateDaysAgo(a.applied_date);
        const matchesFollowUp = !onlyFollowUpDue || (a.status === 'applied' && daysAgo >= 7);

        // Cover letter filter
        const matchesCoverLetter = !onlyHasCoverLetter || Boolean(a.cover_letter && a.cover_letter.trim().length > 10);

        return matchesSearch && matchesPortal && matchesFollowUp && matchesCoverLetter;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') {
          return new Date(b.applied_date).getTime() - new Date(a.applied_date).getTime();
        }
        if (sortBy === 'date_asc') {
          return new Date(a.applied_date).getTime() - new Date(b.applied_date).getTime();
        }
        if (sortBy === 'company_asc') {
          return a.company_name.localeCompare(b.company_name);
        }
        if (sortBy === 'followup_due') {
          const aDue = a.status === 'applied' ? calculateDaysAgo(a.applied_date) : -1;
          const bDue = b.status === 'applied' ? calculateDaysAgo(b.applied_date) : -1;
          return bDue - aDue;
        }
        return 0;
      });
  }, [applications, searchQuery, selectedPortal, onlyFollowUpDue, onlyHasCoverLetter, sortBy]);

  const uniquePortals = useMemo(() => {
    const portals = new Set<string>();
    applications.forEach(a => {
      if (a.source_portal) portals.add(a.source_portal);
    });
    return Array.from(portals);
  }, [applications]);

  const parsedProgressPercent = useMemo(() => {
    if (totalPdfFiles === 0) return 100;
    return Math.min(100, Math.round((applications.length / totalPdfFiles) * 100));
  }, [applications.length, totalPdfFiles]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header Command Bar */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/60 border border-white/[0.08] p-5 sm:p-7 backdrop-blur-xl shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Row: Title & Action Hub */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          
          {/* Brand & Title Lockup */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-400 p-[1px] shadow-lg shadow-indigo-500/15 shrink-0">
              <div className="w-full h-full bg-[#0a0f1d] rounded-[15px] flex items-center justify-center text-sky-400">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Pelacak Lamaran Kerja
                </h1>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                  Local Intelligence
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xl">
                Pantau status lamaran, arsipkan dokumen cover letter, dan kelola tindak lanjut rekruter secara terpusat.
              </p>
            </div>
          </div>

          {/* Clean Primary Toolbar */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {/* View Switcher */}
            <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/[0.08]">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  viewMode === 'kanban'
                    ? 'bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Kanban
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" /> Tabel
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => loadData()}
              className="p-2 rounded-xl text-xs font-semibold border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 transition"
              title="Muat ulang data dari Cloud / Database"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>

            {/* Catat Lamaran Baru (Primary CTA) */}
            <button
              onClick={() => {
                setEditingApp(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Lamaran</span>
            </button>
          </div>
        </div>

        {/* Symmetrical Executive KPI Cards Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-white/[0.08]">
          {/* Card 1: Total Lamaran */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3.5 flex items-center gap-3 hover:border-indigo-500/30 transition">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Lamaran</p>
              <p className="text-xl font-extrabold text-white tracking-tight">{applications.length}</p>
              <p className="text-[10px] text-slate-500 truncate">Lamaran tercatat</p>
            </div>
          </div>

          {/* Card 2: Perusahaan Unik */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3.5 flex items-center gap-3 hover:border-sky-500/30 transition">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perusahaan Unik</p>
              <p className="text-xl font-extrabold text-white tracking-tight">{uniqueCompanies}</p>
              <p className="text-[10px] text-slate-500 truncate">Entitas terverifikasi</p>
            </div>
          </div>

          {/* Card 3: Kanal Terbanyak */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3.5 flex items-center gap-3 hover:border-emerald-500/30 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Kanal Utama</p>
              <p className="text-base font-extrabold text-white tracking-tight truncate">{topPortal}</p>
              <p className="text-[10px] text-slate-500 truncate">{portalCounts[topPortal] || 0} Lamaran</p>
            </div>
          </div>

          {/* Card 4: Butuh Follow-up */}
          <div 
            onClick={() => setOnlyFollowUpDue(prev => !prev)}
            className={`cursor-pointer border rounded-2xl p-3.5 flex items-center gap-3 transition ${
              onlyFollowUpDue 
                ? 'bg-amber-500/20 border-amber-500 shadow-md shadow-amber-500/20' 
                : 'bg-white/[0.03] border-white/[0.06] hover:border-amber-500/40'
            }`}
            title="Klik untuk menyaring lamaran yang butuh follow-up"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              followUpDueCount > 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-500/15 text-slate-400'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Follow-Up</p>
              <p className="text-xl font-extrabold text-amber-300 tracking-tight">{followUpDueCount}</p>
              <p className="text-[10px] text-amber-400/80 truncate">&gt; 7 Hari Kerja</p>
            </div>
          </div>

          {/* Card 5: Progres Berkas PDF (Now 100% Symmetrical with Icon) */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3.5 flex items-center gap-3 hover:border-purple-500/30 transition">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Progres Arsip</p>
              <div className="flex items-baseline justify-between gap-1">
                <span className="text-xl font-extrabold text-white tracking-tight">{parsedProgressPercent}%</span>
                <span className="text-[10px] text-slate-500 font-mono">{applications.length}/{totalPdfFiles}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-sky-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${parsedProgressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Ingestion & Batch Control Banner (Unified & Professional) */}
      {unparsedCount > 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-900/60 border border-amber-500/25 p-4 sm:p-4.5 backdrop-blur-md shadow-lg shadow-amber-500/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm font-bold text-amber-100">
                    {unparsedCount} Berkas Resume PDF Siap Di-parse
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Antrean Folder
                  </span>
                </div>
                <p className="text-[11px] text-amber-300/80 mt-0.5">
                  Ditemukan di folder <code className="font-mono text-amber-200 bg-black/20 px-1 py-0.5 rounded">data/resume</code>. Anda dapat memasukkannya secara bertahap 5 berkas per klik.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleBatchParse(5)}
                disabled={isBatchParsing || isSyncing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition shadow-md shadow-amber-500/20 disabled:opacity-50 active:scale-95 cursor-pointer"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isBatchParsing ? 'animate-spin' : ''}`} />
                <span>{isBatchParsing ? 'Memproses 5...' : `Parse 5 Berkas Baru (${unparsedCount} tersisa)`}</span>
              </button>
              <button
                onClick={() => handleBatchParse('all')}
                disabled={isBatchParsing || isSyncing}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-amber-200 border border-amber-500/30 transition disabled:opacity-50 cursor-pointer"
                title="Parse seluruh berkas yang tersisa sekaligus"
              >
                Parse Semua ({unparsedCount})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sync Toast Notification Banner */}
      {syncNotification && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all animate-in fade-in slide-in-from-top-2 shadow-lg ${
          syncNotification.type === 'success'
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 shadow-emerald-500/10'
            : 'bg-rose-950/40 border-rose-500/40 text-rose-200 shadow-rose-500/10'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              syncNotification.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold">{syncNotification.message}</p>
              {syncNotification.details && (
                <p className="text-[11px] text-emerald-300/80 mt-0.5 leading-relaxed">{syncNotification.details}</p>
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

      {/* Modern Filter, Search & Sorting Hub */}
      <div className="bg-[#0b1220]/80 border border-white/[0.08] rounded-2xl p-4 space-y-3.5 shadow-xl backdrop-blur-md">
        
        {/* Row 1: Search & Sorting */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari perusahaan, posisi (Full Stack, Backend, Frontend), portal rekrutmen, atau skills..."
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-white/[0.09] bg-white/[0.03] hover:border-indigo-500/40 focus:border-indigo-500 text-white placeholder:text-slate-500 outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                title="Hapus pencarian"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown & Toggles */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-transparent outline-none cursor-pointer text-xs font-semibold text-white"
              >
                <option value="date_desc" className="bg-[#0b1220] text-white">Tanggal Terbaru</option>
                <option value="date_asc" className="bg-[#0b1220] text-white">Tanggal Terlama</option>
                <option value="company_asc" className="bg-[#0b1220] text-white">Perusahaan (A-Z)</option>
                <option value="followup_due" className="bg-[#0b1220] text-white">Prioritas Follow-Up</option>
              </select>
            </div>

            {/* Quick Filter: Only with Cover Letter */}
            <button
              onClick={() => setOnlyHasCoverLetter(prev => !prev)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
                onlyHasCoverLetter
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                  : 'bg-white/[0.03] text-slate-400 border-white/[0.08] hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Cover Letter</span>
            </button>

            {/* Quick Filter: Follow up due */}
            <button
              onClick={() => setOnlyFollowUpDue(prev => !prev)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
                onlyFollowUpDue
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                  : 'bg-white/[0.03] text-slate-400 border-white/[0.08] hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Butuh Follow-Up ({followUpDueCount})</span>
            </button>
          </div>
        </div>

        {/* Row 2: Portal Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3 h-3 text-indigo-400" /> Portal:
          </span>
          <button
            onClick={() => setSelectedPortal('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition border ${
              selectedPortal === 'all'
                ? 'bg-white/15 text-white border-white/30 shadow-sm'
                : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:text-white'
            }`}
          >
            Semua ({applications.length})
          </button>
          {['Jobstreet', 'LinkedIn', 'Glints', 'Kalibrr', 'Instagram', 'Direct / Job Portal'].map((p) => {
            const count = portalCounts[p] || 0;
            if (count === 0 && !uniquePortals.some(up => up.toLowerCase().includes(p.toLowerCase()))) return null;
            const isSelected = selectedPortal.toLowerCase() === p.toLowerCase();
            return (
              <button
                key={p}
                onClick={() => setSelectedPortal(isSelected ? 'all' : p)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition border ${
                  isSelected
                    ? 'bg-indigo-500/25 text-indigo-200 border-indigo-500/40 shadow-sm'
                    : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:text-white'
                }`}
              >
                {p} ({count})
              </button>
            );
          })}

          {(selectedPortal !== 'all' || onlyFollowUpDue || onlyHasCoverLetter || searchQuery) && (
            <button
              onClick={() => {
                setSelectedPortal('all');
                setOnlyFollowUpDue(false);
                setOnlyHasCoverLetter(false);
                setSearchQuery('');
              }}
              className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold underline underline-offset-2 ml-auto shrink-0"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Result Indicator Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Menampilkan <strong className="text-white">{filteredApps.length}</strong> dari {applications.length} lamaran
        </span>
        {(searchQuery || selectedPortal !== 'all' || onlyFollowUpDue || onlyHasCoverLetter) && (
          <span className="text-[11px] text-indigo-300">
            Penyaringan aktif
          </span>
        )}
      </div>

      {/* KANBAN VIEW */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
          {STATUS_COLUMNS.map((col) => {
            const items = filteredApps.filter(a => a.status === col.key);
            const IconComp = col.icon;

            return (
              <div
                key={col.key}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverCol !== col.key) {
                    setDragOverCol(col.key);
                  }
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                  if (dragOverCol === col.key) {
                    setDragOverCol(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const appId = e.dataTransfer.getData('text/plain') || draggedAppId;
                  setDragOverCol(null);
                  setDraggedAppId(null);
                  if (!appId) return;
                  const targetApp = applications.find(a => a.id === appId);
                  if (targetApp && targetApp.status !== col.key) {
                    handleStatusChange(targetApp, col.key);
                  }
                }}
                className={`bg-[#0b1220]/70 border ${
                  dragOverCol === col.key
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
                  {dragOverCol === col.key && (
                    <div className="py-3 px-2 border-2 border-dashed border-indigo-400/60 rounded-xl bg-indigo-500/10 text-center text-xs font-bold text-indigo-300 animate-pulse transition">
                      Lepas untuk memindahkan ke {col.label}
                    </div>
                  )}

                  {items.map((app) => {
                    const daysAgo = calculateDaysAgo(app.applied_date);
                    const isFollowUpDue = app.status === 'applied' && daysAgo >= 7;
                    const initials = getCompanyInitials(app.company_name);
                    const avatarGrad = getAvatarGradient(app.company_name);
                    const isDragged = draggedAppId === app.id;

                    return (
                      <div
                        key={app.id}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', app.id);
                          e.dataTransfer.effectAllowed = 'move';
                          setDraggedAppId(app.id);
                        }}
                        onDragEnd={() => {
                          setDraggedAppId(null);
                          setDragOverCol(null);
                        }}
                        className={`group relative bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-indigo-500/40 rounded-xl p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 cursor-grab active:cursor-grabbing select-none ${
                          isDragged ? 'opacity-30 scale-95 border-dashed border-indigo-400 ring-2 ring-indigo-400/30' : ''
                        } ${
                          isFollowUpDue ? 'ring-1 ring-amber-500/30' : ''
                        }`}
                      >
                        {/* Company Header with Avatar Initial & Drag Handle */}
                        <div className="flex items-start gap-2.5">
                          <div className="flex items-center gap-1.5 shrink-0">
                            <GripVertical className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 opacity-40 group-hover:opacity-100 transition" />
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${avatarGrad} flex items-center justify-center text-white text-[11px] font-extrabold shadow-sm`}>
                              {initials}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-white leading-snug truncate group-hover:text-indigo-300 transition" title={app.company_name}>
                              {app.company_name}
                            </h4>
                            <p className="text-xs font-medium text-slate-300 truncate mt-0.5" title={app.job_title}>
                              {app.job_title}
                            </p>
                          </div>
                          
                          {/* Quick Card Edit/Delete Icons */}
                          <div 
                            className="flex items-center opacity-70 group-hover:opacity-100 transition shrink-0"
                            draggable={false}
                            onMouseDown={e => e.stopPropagation()}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingApp(app);
                                setIsModalOpen(true);
                              }}
                              className="p-1 text-slate-400 hover:text-sky-400 rounded transition"
                              title="Edit Catatan"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(app.id, app.company_name);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-400 rounded transition"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Portal Pill & Date */}
                        <div className="flex items-center justify-between gap-2 mt-2.5 text-[10px]">
                          <span className={`font-semibold px-2 py-0.5 rounded-full border truncate max-w-[140px] ${getPortalBadge(app.source_portal)}`}>
                            {app.source_portal || 'Direct'}
                          </span>
                          <span className="text-slate-400 flex items-center gap-1 font-mono">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {app.applied_date}
                          </span>
                        </div>

                        {/* Skills preview */}
                        {app.key_skills && app.key_skills.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap mt-2.5">
                            {app.key_skills.slice(0, 3).map((sk, idx) => (
                              <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/[0.05] text-slate-300 border border-white/[0.06]">
                                {sk}
                              </span>
                            ))}
                            {app.key_skills.length > 3 && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                +{app.key_skills.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Follow up due alert indicator */}
                        {isFollowUpDue && (
                          <div className="mt-2.5 p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[10px] text-amber-300 font-bold flex items-center gap-1.5">
                            <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>Perlu Follow-up ({daysAgo} hari)</span>
                          </div>
                        )}

                        {/* Card Footer Toolbar */}
                        <div 
                          className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs"
                          draggable={false}
                          onMouseDown={e => e.stopPropagation()}
                        >
                          {app.cover_letter ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
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
                              className="text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition"
                              title="Buka dokumen cover letter lengkap"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Cover Letter</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400">Tanpa arsip</span>
                          )}

                          {/* Quick Status Dropdown */}
                          <select
                            draggable={false}
                            onMouseDown={e => e.stopPropagation()}
                            value={app.status}
                            onChange={e => {
                              e.stopPropagation();
                              handleStatusChange(app, e.target.value as ApplicationStatus);
                            }}
                            className="text-[10px] font-semibold bg-[#0b1220] border border-white/[0.12] rounded-lg px-2 py-1 text-slate-300 hover:border-indigo-500/40 outline-none transition cursor-pointer"
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
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 space-y-1">
                      <IconComp className="w-6 h-6 opacity-30" />
                      <p className="text-xs font-semibold">Tidak ada lamaran</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST / TABLE VIEW */
        <div className="bg-[#0b1220]/80 border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-white/[0.03] text-slate-400 border-b border-white/[0.08] uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="px-5 py-3.5">Perusahaan &amp; Posisi</th>
                  <th className="px-4 py-3.5">Kanal Portal</th>
                  <th className="px-4 py-3.5">Status Lamaran</th>
                  <th className="px-4 py-3.5">Tanggal Pengiriman</th>
                  <th className="px-4 py-3.5">Tech Stack &amp; Ringkasan</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredApps.map((app) => {
                  const daysAgo = calculateDaysAgo(app.applied_date);
                  const isFollowUpDue = app.status === 'applied' && daysAgo >= 7;
                  const initials = getCompanyInitials(app.company_name);
                  const avatarGrad = getAvatarGradient(app.company_name);

                  return (
                    <tr key={app.id} className="hover:bg-white/[0.03] transition group">
                      {/* Company & Role with Avatar */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${avatarGrad} flex items-center justify-center text-white text-xs font-extrabold shrink-0 shadow-sm`}>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-white group-hover:text-indigo-300 transition">{app.company_name}</div>
                            <div className="text-xs text-slate-400">{app.job_title}</div>
                          </div>
                        </div>
                      </td>

                      {/* Portal */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getPortalBadge(app.source_portal)}`}>
                          {app.source_portal || 'Direct'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <select
                          value={app.status}
                          onChange={e => handleStatusChange(app, e.target.value as ApplicationStatus)}
                          className="text-xs font-semibold bg-[#090d16] rounded-xl px-2.5 py-1.5 border border-white/[0.12] text-white outline-none cursor-pointer"
                        >
                          <option value="wishlist">Wishlist / Rencana</option>
                          <option value="applied">Lamaran Terkirim</option>
                          <option value="interview">Tahap Wawancara</option>
                          <option value="offer">Diterima / Penawaran</option>
                          <option value="rejected">Belum Berhasil</option>
                        </select>
                      </td>

                      {/* Date & Follow-up */}
                      <td className="px-4 py-3.5 text-slate-300 font-mono text-xs">
                        <div>{app.applied_date}</div>
                        <div className={`text-[10px] ${isFollowUpDue ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                          {daysAgo === 0 ? 'Hari ini' : `${daysAgo} hari lalu`}
                          {isFollowUpDue && ' • Perlu Follow-up!'}
                        </div>
                      </td>

                      {/* Skills & Summary */}
                      <td className="px-4 py-3.5 text-slate-400 text-xs max-w-sm truncate">
                        {app.summary || (app.key_skills && app.key_skills.join(', ')) || app.notes || '-'}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right space-x-1.5">
                        {app.cover_letter && (
                          <button
                            onClick={() => setSelectedCoverLetter({
                              title: `${app.company_name} — ${app.job_title}`,
                              company: app.company_name,
                              job: app.job_title,
                              date: app.applied_date,
                              portal: app.source_portal || 'Direct',
                              text: app.cover_letter || '',
                              skills: app.key_skills
                            })}
                            className="p-2 text-sky-400 hover:text-sky-300 rounded-xl hover:bg-white/10 transition"
                            title="Baca Dokumen Cover Letter"
                          >
                            <FileText className="w-4 h-4 inline" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingApp(app);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-sky-400 rounded-xl hover:bg-white/10 transition"
                          title="Edit Catatan"
                        >
                          <Edit3 className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(app.id, app.company_name)}
                          className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-white/10 transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LUXURY COVER LETTER READER MODAL */}
      {selectedCoverLetter && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative bg-[#0b1220] border border-white/[0.12] rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="shrink-0 px-6 py-4.5 border-b border-white/[0.08] flex items-center justify-between bg-slate-900/70 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-inner">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {selectedCoverLetter.company}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                    <span className="text-indigo-300 font-semibold">{selectedCoverLetter.job}</span>
                    <span>•</span>
                    <span>{selectedCoverLetter.date}</span>
                    <span>•</span>
                    <span className={`px-2 py-0.2 rounded-full border text-[10px] ${getPortalBadge(selectedCoverLetter.portal)}`}>
                      {selectedCoverLetter.portal}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCoverLetter(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition"
                title="Tutup (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Content View */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 overscroll-contain">
              {/* Skills Tags */}
              {selectedCoverLetter.skills && selectedCoverLetter.skills.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pb-3 border-b border-white/[0.06]">
                  <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-indigo-400" /> Keahlian Terdeteksi:
                  </span>
                  {selectedCoverLetter.skills.map((s, idx) => (
                    <span key={idx} className="text-xs px-2 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-200 border border-indigo-500/25">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {/* Formatted Letter Paper Sheet */}
              <div className="bg-[#070b14] border border-white/[0.08] rounded-2xl p-6 sm:p-8 font-sans text-xs sm:text-sm text-slate-200 leading-relaxed shadow-inner select-text whitespace-pre-wrap">
                {selectedCoverLetter.text}
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="shrink-0 px-6 py-4 border-t border-white/[0.08] flex items-center justify-between bg-slate-900/70 backdrop-blur-md">
              <span className="text-xs text-slate-400">
                Arsip berkas lokal dari folder <code className="text-indigo-300">data/resume</code>
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    const blob = new Blob([selectedCoverLetter.text], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `Cover_Letter_${selectedCoverLetter.company.replace(/\s+/g, '_')}.txt`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 border border-white/10 hover:bg-white/[0.06] rounded-xl text-xs font-semibold text-slate-300 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh (.txt)</span>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedCoverLetter.text);
                    setCopiedLetter(true);
                    setTimeout(() => setCopiedLetter(false), 2000);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-sky-500 text-white rounded-xl text-xs font-bold hover:from-indigo-600 hover:to-sky-600 shadow-md shadow-indigo-500/25 transition active:scale-95"
                >
                  {copiedLetter ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLetter ? 'Disalin ke Clipboard!' : 'Salin Teks'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Application Create/Edit Modal */}
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
