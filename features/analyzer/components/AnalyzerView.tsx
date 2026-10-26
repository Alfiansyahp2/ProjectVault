'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, FileSearch } from 'lucide-react';
import { Project, AnalysisResult, JobApplication } from '@/lib/types';
import { getProjects, getUserProfile, saveApplication } from '@/lib/storage';
import { JobAnalyzerFormData } from '../types';
import { JobInputCard } from './JobInputCard';
import { SkillsMatchBreakdown } from './SkillsMatchBreakdown';
import { CoverLetterGeneratorCard } from './CoverLetterGeneratorCard';
import { ExternalAiPromptCard } from './ExternalAiPromptCard';

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
      id: `app_${Date.now()}`,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 text-white rounded-2xl shadow-md shadow-blue-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              Mesin Analisis Python &amp; Pembuat Surat Lamaran
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Tempel deskripsi lowongan. Python akan menghitung skor kecocokan dengan {projects.length} proyek Anda dan merakit surat lamaran berbasis bukti.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Left, Results Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Input Form (5 Cols) */}
        <JobInputCard
          formData={formData}
          setFormData={setFormData}
          onAnalyze={handleAnalyze}
          loading={loading}
          errorMsg={errorMsg}
        />

        {/* Right: Results View (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!result && !loading && (
            <div className="bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
                <FileSearch className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                Menunggu Input Lowongan
              </h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
                Pilih salah satu preset lowongan cepat di sebelah kiri atau tempel deskripsi lowongan kerja impian Anda. Mesin Python akan mencocokkan kriteria dengan seluruh riwayat proyek Anda.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center space-y-4">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-sm font-bold text-zinc-900 dark:text-white">
                Mesin Python sedang menganalisis kriteria...
              </div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                Mengekstrak taksonomi keahlian teknis, mengukur kecocokan multi-faktor portofolio, dan merakit surat lamaran berbasis bukti.
              </p>
            </div>
          )}

          {result && (
            <>
              <SkillsMatchBreakdown result={result} />
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
              <ExternalAiPromptCard
                onCopyPrompt={handleCopyPrompt}
                copiedPrompt={copiedPrompt}
                promptText={result.ai_prompt_context}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
