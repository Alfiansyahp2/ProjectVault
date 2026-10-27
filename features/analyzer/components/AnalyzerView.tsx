'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, FileSearch, BarChart3, FileText, BrainCircuit, LayoutList } from 'lucide-react';
import { Project, AnalysisResult, JobApplication } from '@/lib/types';
import { getProjects, getUserProfile, saveApplication } from '@/lib/storage';
import { JobAnalyzerFormData } from '../types';
import { JobInputCard } from './JobInputCard';
import { SkillsMatchBreakdown } from './SkillsMatchBreakdown';
import { CoverLetterGeneratorCard } from './CoverLetterGeneratorCard';
import { ExternalAiPromptCard } from './ExternalAiPromptCard';

type StudioTab = 'all' | 'match' | 'cover_letter' | 'prompt';

const INITIAL_FORM: JobAnalyzerFormData = {
  companyName: '',
  jobTitle: '',
  jobDescription: '',
  tone: 'profesional',
  language: 'id',
};

export const AnalyzerView: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [profileName, setProfileName] = useState('Kandidat');

  const [formData, setFormData] = useState<JobAnalyzerFormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [isRegeneratingTone, setIsRegeneratingTone] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [coverLetterText, setCoverLetterText] = useState('');
  const [copiedLetter, setCopiedLetter] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<StudioTab>('all');

  useEffect(() => {
    const load = async () => {
      const p = await getProjects();
      const prof = getUserProfile();
      setProjects(p);
      if (prof.name) setProfileName(prof.name);
    };
    load();
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSavedSuccess(false);

    if (!formData.jobDescription.trim()) {
      setErrorMsg('Harap tempel deskripsi lowongan pekerjaan.');
      return;
    }

    if (!formData.jobTitle.trim()) {
      setErrorMsg('Harap isi posisi pekerjaan yang dilamar.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        job_title: formData.jobTitle.trim(),
        company_name: formData.companyName.trim() || 'Perusahaan',
        job_description: formData.jobDescription.trim(),
        projects: projects,
        applicant_name: profileName,
        tone: formData.tone,
        language: formData.language,
      };

      const res = await fetch('/api/py/analyze-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Gagal memproses analisis dengan mesin Python.');
      }

      const data: AnalysisResult = await res.json();
      setResult(data);
      setCoverLetterText(data.cover_letter_draft);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Terjadi kesalahan saat memanggil API Python.');
    } finally {
      setLoading(false);
    }
  };

  const handleToneChange = async (newTone: string) => {
    setFormData(prev => ({ ...prev, tone: newTone }));
    if (!result) return;

    setIsRegeneratingTone(true);
    try {
      const res = await fetch('/api/py/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicant_name: profileName,
          job_title: formData.jobTitle.trim() || result.job_title,
          company_name: formData.companyName.trim() || result.company_name,
          top_projects: result.matched_projects.slice(0, 3),
          detected_skills: result.detected_skills,
          tone: newTone,
          language: formData.language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCoverLetterText(data.cover_letter);
      }
    } catch (e) {
      console.error('Failed to change tone:', e);
    } finally {
      setIsRegeneratingTone(false);
    }
  };

  const handleLanguageChange = async (newLang: 'id' | 'en') => {
    setFormData(prev => ({ ...prev, language: newLang }));
    if (!result) return;

    setIsRegeneratingTone(true);
    try {
      const res = await fetch('/api/py/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicant_name: profileName,
          job_title: formData.jobTitle.trim() || result.job_title,
          company_name: formData.companyName.trim() || result.company_name,
          top_projects: result.matched_projects.slice(0, 3),
          detected_skills: result.detected_skills,
          tone: formData.tone,
          language: newLang,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCoverLetterText(data.cover_letter);
      }
    } catch (e) {
      console.error('Failed to change language:', e);
    } finally {
      setIsRegeneratingTone(false);
    }
  };

  const handleCopyCoverLetter = () => {
    navigator.clipboard.writeText(coverLetterText);
    setCopiedLetter(true);
    setTimeout(() => setCopiedLetter(false), 2000);
  };

  const handleDownloadCoverLetter = () => {
    if (!coverLetterText) return;
    const blob = new Blob([coverLetterText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeCompany = (formData.companyName.trim() || result?.company_name || 'Perusahaan').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeJob = (formData.jobTitle.trim() || result?.job_title || 'Posisi').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.href = url;
    link.download = `Surat_Lamaran_${safeCompany}_${safeJob}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyPrompt = () => {
    if (result?.ai_prompt_context) {
      navigator.clipboard.writeText(result.ai_prompt_context);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

  const handleSaveToApplications = async () => {
    const finalCompany = formData.companyName.trim() || result?.company_name || 'Perusahaan';
    const finalTitle = formData.jobTitle.trim() || result?.job_title;

    if (!finalCompany || !finalTitle) {
      alert('Nama perusahaan dan judul pekerjaan harus diisi.');
      return;
    }

    const newApp: JobApplication = {
      id: `local_app_${Date.now()}`,
      company_name: finalCompany,
      job_title: finalTitle,
      status: 'applied',
      applied_date: new Date().toISOString().split('T')[0],
      job_description: formData.jobDescription,
      cover_letter: coverLetterText,
      notes: `Dianalisis dengan mesin Python (Skor: ${result?.overall_match_percentage || 0}% | ${result?.match_tier || 'Cocok'})`,
      matched_project_ids: result?.matched_projects.map(m => m.project.id) || [],
    };

    await saveApplication(newApp);
    setSavedSuccess(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      {/* Page Header */}
      <div className="pb-2">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-tr from-indigo-600 via-blue-600 to-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Mesin Analisis Python &amp; Pembuat Surat Lamaran
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Tempel deskripsi lowongan kerja. Python akan menghitung skor kecocokan dengan {projects.length} portofolio Anda dan merakit surat lamaran berbasis bukti.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Left, Results Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left: Input Form (5 Cols) - Sticky on Desktop */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 z-10">
          <JobInputCard
            formData={formData}
            setFormData={setFormData}
            onAnalyze={handleAnalyze}
            loading={loading}
            errorMsg={errorMsg}
          />
        </div>

        {/* Right: Results View (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Empty State */}
          {!result && !loading && (
            <div className="glass-card rounded-2xl p-10 sm:p-14 border border-white/[0.08] text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
                <FileSearch className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Menunggu Input Lowongan
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                  Pilih salah satu preset lowongan cepat di sebelah kiri atau tempel deskripsi lowongan kerja impian Anda. Mesin Python akan mencocokkan kriteria dengan seluruh riwayat proyek Anda.
                </p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="glass-card rounded-2xl p-12 border border-white/[0.08] text-center space-y-4 shadow-xl">
              <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-sm sm:text-base font-bold text-white">
                Mesin Python sedang menganalisis kriteria...
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Mengekstrak taksonomi keahlian teknis, mengukur kecocokan multi-faktor portofolio, dan merakit surat lamaran berbasis bukti.
              </p>
            </div>
          )}

          {/* Results State */}
          {result && (
            <div className="space-y-5">
              {/* Studio View Tabs for Ergonomic Comfort */}
              <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-950/70 border border-white/[0.08] overflow-x-auto shadow-sm">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                    activeTab === 'all'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <LayoutList className="w-3.5 h-3.5" />
                  <span>Semua Bagian</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('match')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                    activeTab === 'match'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Kecocokan &amp; Bukti ({result.overall_match_percentage}%)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('cover_letter')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                    activeTab === 'cover_letter'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Surat Lamaran</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('prompt')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                    activeTab === 'prompt'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <BrainCircuit className="w-3.5 h-3.5" />
                  <span>Mega-Prompt AI</span>
                </button>
              </div>

              {/* Tab Contents */}
              {(activeTab === 'all' || activeTab === 'match') && (
                <SkillsMatchBreakdown result={result} />
              )}

              {(activeTab === 'all' || activeTab === 'cover_letter') && (
                <CoverLetterGeneratorCard
                  coverLetterText={coverLetterText}
                  setCoverLetterText={setCoverLetterText}
                  onCopy={handleCopyCoverLetter}
                  onDownload={handleDownloadCoverLetter}
                  onSaveToApplications={handleSaveToApplications}
                  onToneChange={handleToneChange}
                  onLanguageChange={handleLanguageChange}
                  currentTone={formData.tone}
                  currentLanguage={formData.language}
                  isRegeneratingTone={isRegeneratingTone}
                  copiedLetter={copiedLetter}
                  savedSuccess={savedSuccess}
                  companyName={formData.companyName || result.company_name}
                  jobTitle={formData.jobTitle || result.job_title}
                />
              )}

              {(activeTab === 'all' || activeTab === 'prompt') && (
                <ExternalAiPromptCard
                  onCopyPrompt={handleCopyPrompt}
                  copiedPrompt={copiedPrompt}
                  promptText={result.ai_prompt_context}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
