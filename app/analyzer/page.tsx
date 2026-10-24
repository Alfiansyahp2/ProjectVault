'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Copy, 
  Check, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  FolderGit2, 
  Building2, 
  Briefcase, 
  BrainCircuit, 
  Flame,
  FileText
} from 'lucide-react';
import { Project, AnalysisResult, JobApplication } from '@/lib/types';
import { getProjects, getUserProfile, saveApplication } from '@/lib/storage';

export default function AnalyzerPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [profileName, setProfileName] = useState('Kandidat');

  // Input states
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState('profesional');
  const [language, setLanguage] = useState<'id' | 'en'>('id');

  // Analysis Result
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

    if (!jobDescription.trim()) {
      setErrorMsg('Harap tempel deskripsi lowongan pekerjaan.');
      return;
    }

    if (!jobTitle.trim()) {
      setErrorMsg('Harap isi posisi pekerjaan yang dilamar.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        job_title: jobTitle.trim(),
        company_name: companyName.trim() || 'Perusahaan',
        job_description: jobDescription.trim(),
        projects: projects,
        applicant_name: profileName,
        tone: tone,
        language: language,
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
    if (!companyName.trim() || !jobTitle.trim()) {
      alert('Nama perusahaan dan judul pekerjaan harus diisi.');
      return;
    }

    const newApp: JobApplication = {
      id: `app_${Date.now()}`,
      company_name: companyName.trim(),
      job_title: jobTitle.trim(),
      status: 'applied',
      applied_date: new Date().toISOString().split('T')[0],
      job_description: jobDescription,
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
              Mesin Analisis Python & Pembuat Surat Lamaran
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
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-600" />
            Informasi Lowongan Pekerjaan
          </h2>

          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Posisi / Judul Pekerjaan *
              </label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                placeholder="Misal: Frontend React Engineer / Data Scientist"
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Nama Perusahaan
              </label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="Misal: PT Inovasi Maju Bersama"
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Bahasa Surat
                </label>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value as 'id' | 'en')}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="id">Bahasa Indonesia</option>
                  <option value="en">English (US/UK)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Gaya Bahasa (*Tone*)
                </label>
                <select
                  value={tone}
                  onChange={e => setTone(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="profesional">Profesional & Berbobot</option>
                  <option value="antusias">Antusias & Enerjik</option>
                  <option value="ringkas">Ringkas & Padat</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Teks Deskripsi & Kriteria Lowongan *
              </label>
              <textarea
                required
                rows={9}
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Salin seluruh teks lowongan kerja dari LinkedIn, JobStreet, atau website karir perusahaan ke sini..."
                className="w-full p-3 text-xs font-mono rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Menganalisis dengan Python...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Jalankan Analisis & Buat Surat Lamaran
                </>
              )}
            </button>
          </form>
        </div>

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
              {/* Score Card & Skills Overview */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                      Hasil Analisis Kecocokan Portofolio
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Untuk posisi <span className="font-semibold">{result.job_title}</span> di <span className="font-semibold">{result.company_name}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs text-zinc-400 block">Skor Kecocokan</span>
                      <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                        {result.overall_match_percentage}%
                      </span>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-950/60 border-4 border-blue-500 flex items-center justify-center font-bold text-blue-600 text-sm">
                      {result.overall_match_percentage}%
                    </div>
                  </div>
                </div>

                {/* Detected Skills vs Gap */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Detected & Owned */}
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Keahlian Terdeteksi di Lowongan:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {result.detected_skills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        >
                          {skill}
                        </span>
                      ))}
                      {result.detected_skills.length === 0 && (
                        <span className="text-xs text-zinc-400">Tidak ada teknologi spesifik yang terdeteksi.</span>
                      )}
                    </div>
                  </div>

                  {/* Skill Gaps */}
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 mb-2">
                      <Flame className="w-4 h-4 text-amber-500" />
                      Skill Gap (Belum Ada di Proyek Anda):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {result.skill_gaps.map((skill, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                        >
                          {skill}
                        </span>
                      ))}
                      {result.skill_gaps.length === 0 && (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          Luar biasa! Portofolio Anda mencakup semua skill yang diminta.
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Top Matched Projects */}
                <div>
                  <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                    Proyek Anda yang Paling Relevan:
                  </h4>
                  <div className="space-y-2">
                    {result.matched_projects.slice(0, 3).map((mp, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-start justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            <span>{i + 1}. {mp.project.title}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-semibold">
                              Skor {mp.match_score}%
                            </span>
                          </div>
                          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                            {mp.relevance_reason}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tailored Cover Letter Card */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                      Draf Surat Lamaran Terarah (*Tailored Cover Letter*)
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyCoverLetter}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                    >
                      {copiedLetter ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedLetter ? 'Tersalin!' : 'Salin Surat'}
                    </button>
                    <button
                      onClick={handleSaveToApplications}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {savedSuccess ? 'Tersimpan!' : 'Simpan ke Pelacak'}
                    </button>
                  </div>
                </div>

                <textarea
                  rows={14}
                  value={coverLetterText}
                  onChange={e => setCoverLetterText(e.target.value)}
                  className="w-full p-4 font-sans text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 leading-relaxed outline-none focus:ring-2 focus:ring-blue-500"
                />

                {savedSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                    <span>Lamaran ini berhasil dicatat ke menu <strong>Pelacak Lamaran</strong> beserta arsip surat ini!</span>
                  </div>
                )}
              </div>

              {/* Master AI Prompt for External Chat (Anti-Lupa) */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-900 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200">
                      Prompt Khusus Lowongan Ini untuk AI Luar (Anti-Lupa)
                    </h4>
                  </div>
                  <button
                    onClick={handleCopyPrompt}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
                  >
                    {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedPrompt ? 'Prompt Disalin!' : 'Salin Mega-Prompt'}
                  </button>
                </div>
                <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                  Ingin bertanya lebih lanjut ke ChatGPT/Claude/Gemini mengenai simulasi wawancara teknis atau pertanyaan HR untuk posisi ini? Salin prompt ini dan tempel di AI agar AI langsung mengetahui deskripsi lowongan DAN seluruh riwayat proyek nyata Anda!
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
