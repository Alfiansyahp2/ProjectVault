'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FolderGit2, 
  Briefcase, 
  Sparkles, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Copy, 
  Check, 
  ExternalLink,
  BrainCircuit,
  Building2,
  Calendar,
  Wallet,
  Trophy,
  Layers,
  Flame
} from 'lucide-react';
import { Project, JobApplication, UserProfile } from '@/lib/types';
import { getProjects, getApplications, getUserProfile, saveProject, saveApplication } from '@/lib/storage';
import ProjectModal from '@/components/ProjectModal';
import ApplicationModal from '@/components/ApplicationModal';
import AiPromptModal from '@/components/AiPromptModal';

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [profile, setProfile] = useState<UserProfile>({ name: '', headline: '' });
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const p = await getProjects();
    const a = await getApplications();
    const prof = getUserProfile();
    setProjects(p);
    setApplications(a);
    setProfile(prof);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'wishlist':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800/80 text-slate-300 border border-slate-700/60">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Wishlist
          </span>
        );
      case 'applied':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            Terkirim
          </span>
        );
      case 'interview':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            Wawancara
          </span>
        );
      case 'offer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Penawaran 🎉
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Belum Berhasil
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Hero / Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.1] bg-gradient-to-br from-indigo-950/70 via-slate-900/90 to-[#090d16] p-7 sm:p-10 shadow-2xl backdrop-blur-2xl">
        {/* Ambient atmospheric aura */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Solusi Anti-Lupa Konteks AI & Vault Portofolio</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Halo, <span className="bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">{profile.name || 'Kandidat Profesional'}</span>! 👋
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Semua riwayat proyek dan surat lamaran tersimpan aman di sini. AI eksternal tidak akan berhalusinasi lagi karena Anda dapat merakit konteks lengkap dalam 1 klik.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <BrainCircuit className="w-4 h-4 text-white" />
              <span>Salin Konteks untuk AI</span>
            </button>

            <Link
              href="/analyzer"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-slate-100 text-xs sm:text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] backdrop-blur-md"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Analisis Lowongan</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Follow-up Smart Alert Banner */}
      {followUpNeeded.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-amber-950/20 to-slate-900/40 p-4.5 sm:p-5 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-amber-500/5">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400">
                  Perlu Tindak Lanjut (Follow-Up)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
                  {followUpNeeded.length} Lowongan
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 mt-0.5">
                Lamaran pekerjaan telah terkirim $\ge$ 7 hari lalu tanpa kabar:
                <strong className="ml-1 text-amber-200">
                  {followUpNeeded.map(f => `${f.company_name} (${f.job_title})`).join(', ')}
                </strong>
              </p>
            </div>
          </div>

          <Link 
            href="/applications" 
            className="group flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all shrink-0"
          >
            <span>Tinjau & Follow-up</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}

      {/* Key Metrics Grid (4 Glass Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Metric 1: Bank Proyek */}
        <div className="glass-card rounded-2xl p-5 sm:p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Bank Proyek
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {projects.length}
            </span>
            <span className="text-xs font-medium text-slate-400">portofolio</span>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.06]">
            <Link 
              href="/projects" 
              className="group/link inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              <span>Kelola Proyek</span>
              <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Metric 2: Total Lamaran */}
        <div className="glass-card rounded-2xl p-5 sm:p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Lamaran
            </span>
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:scale-110 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {applications.length}
            </span>
            <span className="text-xs font-medium text-slate-400">perusahaan</span>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.06]">
            <Link 
              href="/applications" 
              className="group/link inline-flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300"
            >
              <span>Buka Kanban</span>
              <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Metric 3: Wawancara Aktif */}
        <div className="glass-card rounded-2xl p-5 sm:p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400/90 uppercase tracking-wider">
              Wawancara Aktif
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-amber-300 tracking-tight">
              {interviewCount}
            </span>
            <span className="text-xs font-medium text-slate-400">tahap proses</span>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.06] text-xs text-slate-400">
            Fokus simulasi wawancara teknis
          </div>
        </div>

        {/* Metric 4: Penawaran Diterima */}
        <div className="glass-card rounded-2xl p-5 sm:p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400/90 uppercase tracking-wider">
              Tawaran Diterima
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition-transform">
              <Trophy className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-300 tracking-tight">
              {offerCount}
            </span>
            <span className="text-xs font-medium text-slate-400">penawaran kerja</span>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.06] text-xs text-slate-400">
            Target keberhasilan karir Anda
          </div>
        </div>

      </div>

      {/* Main Sections: Recent Projects & Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Bank Proyek */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <FolderGit2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Bank Proyek Pilihan
                </h2>
                <p className="text-xs text-slate-400">Bukti karya nyata &amp; capaian terukur</p>
              </div>
            </div>

            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Proyek</span>
            </button>
          </div>

          <div className="space-y-3.5">
            {projects.slice(0, 3).map((proj) => (
              <div
                key={proj.id}
                className="glass-card rounded-2xl p-5 border border-white/[0.08] hover:border-indigo-500/40 transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {proj.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className="font-semibold text-indigo-400">{proj.role}</span>
                      <span className="text-slate-600">&bull;</span>
                      <span className="text-slate-400">{proj.category}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => copyProjectSummary(proj)}
                    className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/60 border border-white/[0.08] text-xs flex items-center gap-1.5 transition-colors shrink-0"
                    title="Salin ringkasan proyek untuk AI eksternal"
                  >
                    {copiedId === proj.id ? (
                      <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-semibold">
                        <Check className="w-3.5 h-3.5" /> Tersalin
                      </span>
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-300 mt-2.5 line-clamp-2 leading-relaxed">
                  {proj.description}
                </p>

                {proj.achievements && (
                  <div className="mt-3 flex items-start gap-2 bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-300 text-xs px-3 py-2 rounded-xl">
                    <span className="text-emerald-400 text-sm leading-none shrink-0 mt-0.5">★</span>
                    <span className="leading-snug text-[11px] font-medium">{proj.achievements}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 mt-3.5 pt-3 border-t border-white/[0.06]">
                  {proj.technologies.slice(0, 5).map((t, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-lg text-[10px] font-medium bg-slate-800/80 border border-white/[0.08] text-slate-300"
                    >
                      {t}
                    </span>
                  ))}
                  {proj.technologies.length > 5 && (
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-white/[0.05] text-slate-400 border border-white/[0.05]">
                      +{proj.technologies.length - 5}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {projects.length === 0 && (
              <div className="text-center py-12 glass-panel rounded-2xl border border-dashed border-white/10 p-6">
                <FolderGit2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-xs text-slate-400 font-medium">Belum ada portofolio proyek tersimpan.</p>
                <button
                  onClick={() => setIsProjectModalOpen(true)}
                  className="mt-3 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
                >
                  + Tambahkan Proyek Pertama Anda
                </button>
              </div>
            )}

            <div className="pt-1 text-right">
              <Link 
                href="/projects" 
                className="group inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
              >
                <span>Lihat Seluruh {projects.length} Proyek</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Pelacak Lamaran */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Lamaran Pekerjaan Terbaru
                </h2>
                <p className="text-xs text-slate-400">Monitoring status &amp; respon rekruter</p>
              </div>
            </div>

            <button
              onClick={() => setIsAppModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Catat Lamaran</span>
            </button>
          </div>

          <div className="space-y-3.5">
            {applications.slice(0, 3).map((app) => (
              <div
                key={app.id}
                className="glass-card rounded-2xl p-5 border border-white/[0.08] hover:border-sky-500/40 transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800/80 border border-white/[0.08] flex items-center justify-center text-slate-300 font-bold text-sm shrink-0 mt-0.5">
                      {app.company_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                        {app.company_name}
                      </h3>
                      <p className="text-xs font-medium text-slate-300 mt-0.5">
                        {app.job_title}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {getStatusBadge(app.status)}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{app.applied_date}</span>
                  </span>
                  {app.salary_range && (
                    <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                      <Wallet className="w-3.5 h-3.5 text-slate-500" />
                      <span>{app.salary_range}</span>
                    </span>
                  )}
                </div>

                {app.notes && (
                  <p className="text-xs text-slate-300 mt-2.5 bg-slate-800/60 border border-white/[0.06] p-2.5 rounded-xl leading-relaxed">
                    📌 {app.notes}
                  </p>
                )}

                {app.job_link && (
                  <div className="mt-3 pt-2.5 border-t border-white/[0.06]">
                    <a
                      href={app.job_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-400 hover:text-sky-300 transition"
                    >
                      <span>Buka Tautan Lowongan</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ))}

            {applications.length === 0 && (
              <div className="text-center py-12 glass-panel rounded-2xl border border-dashed border-white/10 p-6">
                <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-xs text-slate-400 font-medium">Belum ada lamaran pekerjaan tersimpan.</p>
                <button
                  onClick={() => setIsAppModalOpen(true)}
                  className="mt-3 text-xs font-bold text-sky-400 hover:text-sky-300 transition"
                >
                  + Catat Lamaran Pertama Anda
                </button>
              </div>
            )}

            <div className="pt-1 text-right">
              <Link 
                href="/applications" 
                className="group inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 transition"
              >
                <span>Buka Pelacak Lengkap (Kanban)</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

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
    </div>
  );
}
