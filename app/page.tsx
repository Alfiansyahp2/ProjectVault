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
  Building2
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
    const text = `Proyek: ${p.title} (${p.role})\nTeknologi: ${p.technologies.join(', ')}\nDeskripsi: ${p.description}${p.achievements ? `\nHasil: ${p.achievements}` : ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Follow-up calculations (applied > 7 days ago and still in 'applied' status)
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
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">Wishlist</span>;
      case 'applied':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">Terkirim</span>;
      case 'interview':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse">Wawancara</span>;
      case 'offer':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">Diterima 🎉</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">Belum Berhasil</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Solusi Anti-Lupa Konteks AI & Portofolio
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Halo, {profile.name || 'Kandidat Hebat'}! 👋
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100 max-w-2xl leading-relaxed">
            Semua riwayat proyek dan surat lamaran Anda tersimpan aman di sini. AI tidak akan lupa lagi karena Anda bisa membuat draf lamaran spesifik dan menyalin konteks lengkap dalam 1 klik.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-700 text-xs sm:text-sm font-bold shadow-md hover:bg-blue-50 transition active:scale-95"
          >
            <BrainCircuit className="w-4 h-4 text-blue-600" />
            Salin Konteks untuk AI
          </button>
          <Link
            href="/analyzer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/30 hover:bg-blue-500/40 border border-white/20 text-white text-xs sm:text-sm font-semibold backdrop-blur-md transition"
          >
            <Sparkles className="w-4 h-4" />
            Analisis Lowongan
          </Link>
        </div>
      </div>

      {/* Follow-up Alert if any */}
      {followUpNeeded.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm text-amber-800 dark:text-amber-300">
            <span className="font-semibold">Perlu Tindak Lanjut (Follow-Up):</span> Terdapat {followUpNeeded.length} lamaran pekerjaan yang sudah dikirim lebih dari 7 hari lalu tanpa kabar. 
            <span className="ml-1 font-medium">({followUpNeeded.map(f => `${f.company_name} - ${f.job_title}`).join(', ')})</span>
          </div>
          <Link 
            href="/applications" 
            className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline shrink-0"
          >
            Lihat Detail &rarr;
          </Link>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Bank Proyek Tersimpan</span>
            <FolderGit2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
              {projects.length}
            </span>
            <span className="text-xs text-zinc-500">proyek</span>
          </div>
          <Link href="/projects" className="mt-3 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            Kelola Bank Proyek <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Total Lamaran Kerja</span>
            <Briefcase className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
              {applications.length}
            </span>
            <span className="text-xs text-zinc-500">perusahaan</span>
          </div>
          <Link href="/applications" className="mt-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            Lihat Pelacak Lamaran <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Wawancara Aktif</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {interviewCount}
            </span>
            <span className="text-xs text-zinc-500">tahap wawancara</span>
          </div>
          <span className="mt-3 block text-xs text-zinc-400">
            Fokus persiapan teknis & portfolio
          </span>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Tawaran Diterima</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {offerCount}
            </span>
            <span className="text-xs text-zinc-500">penawaran kerja</span>
          </div>
          <span className="mt-3 block text-xs text-zinc-400">
            Target pencapaian karir Anda
          </span>
        </div>
      </div>

      {/* Main Sections: Recent Projects & Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Bank Proyek */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                Bank Proyek Pilihan
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsProjectModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Proyek
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {projects.slice(0, 4).map((proj) => (
              <div
                key={proj.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 hover:border-blue-400 dark:hover:border-blue-600 transition shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                      {proj.title}
                    </h3>
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-0.5">
                      {proj.role} &bull; <span className="text-zinc-500">{proj.category}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => copyProjectSummary(proj)}
                    className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs flex items-center gap-1"
                    title="Salin ringkasan proyek untuk AI/surat lamaran"
                  >
                    {copiedId === proj.id ? (
                      <span className="text-emerald-600 flex items-center gap-1 text-[11px]">
                        <Check className="w-3.5 h-3.5" /> Tersalin
                      </span>
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-2 line-clamp-2">
                  {proj.description}
                </p>

                {proj.achievements && (
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded">
                    ★ {proj.achievements}
                  </p>
                )}

                <div className="flex flex-wrap gap-1 mt-3">
                  {proj.technologies.slice(0, 5).map((t, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    >
                      {t}
                    </span>
                  ))}
                  {proj.technologies.length > 5 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] text-zinc-400">
                      +{proj.technologies.length - 5}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {projects.length === 0 && (
              <div className="text-center py-10 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 p-6">
                <FolderGit2 className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                <p className="text-xs text-zinc-500">Belum ada proyek yang dicatat.</p>
                <button
                  onClick={() => setIsProjectModalOpen(true)}
                  className="mt-3 text-xs font-semibold text-blue-600 hover:underline"
                >
                  + Tambahkan Proyek Pertama Anda
                </button>
              </div>
            )}

            <div className="pt-2 text-right">
              <Link href="/projects" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                Lihat Seluruh {projects.length} Proyek &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Pelacak Lamaran */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                Lamaran Pekerjaan Terbaru
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAppModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Catat Lamaran
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {applications.slice(0, 4).map((app) => (
              <div
                key={app.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 hover:border-indigo-400 dark:hover:border-indigo-600 transition shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                        {app.company_name}
                      </h3>
                    </div>
                    <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300 mt-0.5">
                      {app.job_title}
                    </p>
                  </div>
                  <div>
                    {getStatusBadge(app.status)}
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-4 text-[11px] text-zinc-500">
                  <span>Tanggal: {app.applied_date}</span>
                  {app.salary_range && <span>Gaji: {app.salary_range}</span>}
                </div>

                {app.notes && (
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-2 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded">
                    📌 {app.notes}
                  </p>
                )}

                {app.job_link && (
                  <div className="mt-2">
                    <a
                      href={app.job_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
                    >
                      Buka Tautan Lowongan <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ))}

            {applications.length === 0 && (
              <div className="text-center py-10 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 p-6">
                <Briefcase className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                <p className="text-xs text-zinc-500">Belum ada lamaran yang dicatat.</p>
                <button
                  onClick={() => setIsAppModalOpen(true)}
                  className="mt-3 text-xs font-semibold text-indigo-600 hover:underline"
                >
                  + Catat Lamaran Pertama Anda
                </button>
              </div>
            )}

            <div className="pt-2 text-right">
              <Link href="/applications" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                Buka Pelacak Lengkap (Kanban) &rarr;
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
