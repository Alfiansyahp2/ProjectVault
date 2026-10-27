'use client';

import React from 'react';
import { Sparkles, FileSearch, BarChart3, FileText, BrainCircuit, LayoutList } from 'lucide-react';
import { useJobAnalyzer } from '../hooks/use-job-analyzer';
import { JobInputCard } from './JobInputCard';
import { SkillsMatchBreakdown } from './SkillsMatchBreakdown';
import { CoverLetterGeneratorCard } from './CoverLetterGeneratorCard';
import { ExternalAiPromptCard } from './ExternalAiPromptCard';

export const AnalyzerView: React.FC = () => {
  const {
    projects,
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
  } = useJobAnalyzer();

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
