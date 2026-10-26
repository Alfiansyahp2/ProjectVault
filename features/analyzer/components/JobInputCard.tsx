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
    <div className="glass-card rounded-2xl p-5 sm:p-6 border border-white/[0.08] shadow-2xl space-y-4">
      {/* Header and Quick Actions */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            <Briefcase className="w-4 h-4" />
          </div>
          <span>Informasi Lowongan</span>
        </h2>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePasteClipboard}
            title="Tempel teks dari Clipboard"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-slate-300 hover:text-indigo-400 hover:bg-white/[0.06] transition cursor-pointer"
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tempel</span>
          </button>
          <button
            type="button"
            onClick={handleResetForm}
            title="Bersihkan isi form"
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/[0.06] transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Preset Quick Chips */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 font-semibold text-slate-200">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Preset Lowongan Cepat:
          </span>
          <span className="text-[11px] text-slate-500">Uji 1-Klik</span>
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
                    ? 'border-indigo-500/80 bg-indigo-500/20 text-white font-semibold shadow-xs ring-1 ring-indigo-500/40'
                    : 'border-white/[0.07] bg-slate-950/60 text-slate-300 hover:border-white/20 hover:bg-slate-900/80'
                }`}
              >
                <span className="text-base shrink-0">{preset.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-slate-100">{preset.label}</div>
                  <span className="text-[10px] text-slate-400 block truncate">{preset.badge}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={onAnalyze} className="space-y-3.5 pt-1">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Posisi / Judul Pekerjaan *
          </label>
          <input
            type="text"
            required
            value={formData.jobTitle}
            onChange={e => updateField('jobTitle', e.target.value)}
            placeholder="Misal: Frontend React Engineer / Data Scientist"
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-white/10 bg-slate-950/70 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Nama Perusahaan
          </label>
          <input
            type="text"
            value={formData.companyName}
            onChange={e => updateField('companyName', e.target.value)}
            placeholder="Misal: PT Inovasi Maju Bersama"
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-white/10 bg-slate-950/70 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Bahasa Surat
            </label>
            <select
              value={formData.language}
              onChange={e => updateField('language', e.target.value as 'id' | 'en')}
              className="w-full px-3 py-2 text-xs rounded-xl border border-white/10 bg-slate-950 text-white focus:border-indigo-500 outline-none cursor-pointer"
            >
              {LANGUAGE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                  {opt.flag} {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Gaya Bahasa (<em>Tone</em>)
            </label>
            <select
              value={formData.tone}
              onChange={e => updateField('tone', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-white/10 bg-slate-950 text-white focus:border-indigo-500 outline-none cursor-pointer"
            >
              {TONE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-300">
              Teks Deskripsi &amp; Kriteria Lowongan *
            </label>
            <span className="text-[11px] text-slate-400">
              {charCount > 0 ? `${charCount} karakter • ~${wordCount} kata` : 'Wajib diisi'}
            </span>
          </div>
          <textarea
            required
            rows={5}
            value={formData.jobDescription}
            onChange={e => updateField('jobDescription', e.target.value)}
            placeholder="Salin seluruh teks lowongan kerja dari LinkedIn, JobStreet, atau website karir perusahaan ke sini..."
            className="w-full p-3 text-xs font-mono rounded-xl border border-white/10 bg-slate-950/80 text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none leading-relaxed"
          />
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:from-indigo-500 hover:to-blue-600 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Menganalisis dengan Python...
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
