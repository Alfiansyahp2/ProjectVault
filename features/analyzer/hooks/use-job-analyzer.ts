'use client';

import { useState, useEffect, useCallback } from 'react';
import { Project, AnalysisResult, JobApplication } from '@/lib/types';
import { getProjects, getUserProfile, saveApplication } from '@/lib/storage';
import { JobAnalyzerFormData, StudioTab } from '../types';

const INITIAL_FORM: JobAnalyzerFormData = {
  companyName: '',
  jobTitle: '',
  jobDescription: '',
  tone: 'profesional',
  language: 'id',
};

export function useJobAnalyzer() {
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

  return {
    projects,
    profileName,
    formData,
    setFormData,
    loading,
    isRegeneratingTone,
    result,
    errorMsg,
    coverLetterText,
    setCoverLetterText,
    copiedLetter,
    copiedPrompt,
    savedSuccess,
    activeTab,
    setActiveTab,
    handleAnalyze,
    handleToneChange,
    handleLanguageChange,
    handleCopyCoverLetter,
    handleDownloadCoverLetter,
    handleCopyPrompt,
    handleSaveToApplications,
  };
}
