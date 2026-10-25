'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
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

  const handleCopyCoverLetter = () => {
    navigator.clipboard.writeText(coverLetterText);
    setCopiedLetter(true);
    setTimeout(() => setCopiedLetter(false), 2000);
  };

  const handleCopyPrompt = () => {
    if (result?.ai_prompt_context) {
      navigator.clipboard.writeText(result.ai_prompt_context);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

  const handleSaveToApplications = async () => {
    if (!formData.companyName.trim() || !formData.jobTitle.trim()) {
      alert('Nama perusahaan dan judul pekerjaan harus diisi.');
      return;
    }

    const newApp: JobApplication = {
      id: `app_${Date.now()}`,
      company_name: formData.companyName.trim(),
      job_title: formData.jobTitle.trim(),
      status: 'applied',
      applied_date: new Date().toISOString().split('T')[0],
      job_description: formData.jobDescription,
      cover_letter: coverLetterText,
      notes: `Dianalisis dengan mesin Python (Skor Kecocokan: ${result?.overall_match_percentage || 0}%)`,
      matched_project_ids: result?.matched_projects.map(m => m.project.id) || [],
    };

    await saveApplication(newApp);
    setSavedSuccess(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-xl shadow-md shadow-blue-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              Mesin Analisis Python &amp; Pembuat Surat Lamaran
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500">
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
            <div className="bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl p-12 text-center">
              <Sparkles className="w-12 h-12 text-blue-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                Menunggu Input Lowongan
              </h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1">
                Isi form di sebelah kiri dan klik tombol analisis. Mesin Python akan mencocokkan kriteria dengan seluruh riwayat proyek Anda.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center space-y-4">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-sm font-bold text-zinc-900 dark:text-white">
                Mesin Python sedang memproses...
              </div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Mengekstrak kata kunci teknis, mencocokkan proyek portofolio, dan menyusun surat lamaran terbaik.
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
                onSaveToApplications={handleSaveToApplications}
                copiedLetter={copiedLetter}
                savedSuccess={savedSuccess}
              />
              <ExternalAiPromptCard
                onCopyPrompt={handleCopyPrompt}
                copiedPrompt={copiedPrompt}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
