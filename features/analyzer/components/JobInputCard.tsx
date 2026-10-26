'use client';

import React, { useState } from 'react';
import { Briefcase, Sparkles, AlertCircle, ClipboardPaste, RotateCcw, Zap } from 'lucide-react';
import { JobAnalyzerFormData } from '../types';
import { SAMPLE_JOB_PRESETS, TONE_OPTIONS, LANGUAGE_OPTIONS } from '../constants';

interface JobInputCardProps {
  formData: JobAnalyzerFormData;
  setFormData: React.Dispatch<React.SetStateAction<JobAnalyzerFormData>>;
  onAnalyze: (e: React.FormEvent) => void;
  loading: boolean;
  errorMsg: string;
}

export const JobInputCard: React.FC<JobInputCardProps> = ({
  formData,
  setFormData,
  onAnalyze,
  loading,
  errorMsg,
}) => {
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const updateField = <K extends keyof JobAnalyzerFormData>(field: K, value: JobAnalyzerFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyPreset = (preset: typeof SAMPLE_JOB_PRESETS[0]) => {
    setActivePresetId(preset.id);
    setFormData(preset.data);
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        updateField('jobDescription', text);
      }
    } catch {
      // Ignore clipboard permission errors silently
    }
  };

  const handleResetForm = () => {
    setActivePresetId(null);
    setFormData({
      jobTitle: '',
      companyName: '',
      jobDescription: '',
      tone: 'profesional',
      language: 'id',
    });
  };

  const charCount = formData.jobDescription.length;
  const wordCount = formData.jobDescription.trim() ? formData.jobDescription.trim().split(/\s+/).length : 0;

  return (
    <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
      {/* Header and Quick Actions */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-blue-600" />
          Informasi Lowongan Pekerjaan
        </h2>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePasteClipboard}
            title="Tempel teks dari Clipboard"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tempel</span>
          </button>
          <button
            type="button"
            onClick={handleResetForm}
            title="Bersihkan isi form"
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Preset Quick Chips */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1 font-semibold text-zinc-700 dark:text-zinc-300">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Preset Lowongan Cepat (Uji 1-Klik):
          </span>
          <span className="text-[11px] text-zinc-400">Pilih untuk auto-fill</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {SAMPLE_JOB_PRESETS.map(preset => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`p-2 rounded-xl text-left border text-xs transition cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-semibold shadow-sm'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800/80'
                }`}
              >
                <span className="text-base shrink-0">{preset.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{preset.label}</div>
                  <span className="text-[10px] text-zinc-400 block truncate">{preset.badge}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={onAnalyze} className="space-y-4 pt-1">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Posisi / Judul Pekerjaan *
          </label>
          <input
            type="text"
            required
            value={formData.jobTitle}
            onChange={e => updateField('jobTitle', e.target.value)}
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
            value={formData.companyName}
            onChange={e => updateField('companyName', e.target.value)}
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
              value={formData.language}
              onChange={e => updateField('language', e.target.value as 'id' | 'en')}
              className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            >
              {LANGUAGE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.flag} {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Gaya Bahasa (<em>Tone</em>)
            </label>
            <select
              value={formData.tone}
              onChange={e => updateField('tone', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            >
              {TONE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Teks Deskripsi &amp; Kriteria Lowongan *
            </label>
            <span className="text-[11px] text-zinc-400">
              {charCount > 0 ? `${charCount} karakter • ~${wordCount} kata` : 'Diperlukan'}
            </span>
          </div>
          <textarea
            required
            rows={8}
            value={formData.jobDescription}
            onChange={e => updateField('jobDescription', e.target.value)}
            placeholder="Salin seluruh teks lowongan kerja dari LinkedIn, JobStreet, atau website karir perusahaan ke sini..."
            className="w-full p-3 text-xs font-mono rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
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
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-800 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Menganalisis dengan Mesin Python...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Jalankan Analisis &amp; Buat Surat Lamaran
            </>
          )}
        </button>
      </form>
    </div>
  );
};
