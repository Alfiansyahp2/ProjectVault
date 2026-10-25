import React from 'react';
import { Briefcase, Sparkles, AlertCircle } from 'lucide-react';
import { JobAnalyzerFormData } from '../types';

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
  const updateField = <K extends keyof JobAnalyzerFormData>(field: K, value: JobAnalyzerFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
      <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
        <Briefcase className="w-4 h-4 text-blue-600" />
        Informasi Lowongan Pekerjaan
      </h2>

      <form onSubmit={onAnalyze} className="space-y-4">
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
              <option value="id">Bahasa Indonesia</option>
              <option value="en">English (US/UK)</option>
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
              <option value="profesional">Profesional &amp; Berbobot</option>
              <option value="antusias">Antusias &amp; Enerjik</option>
              <option value="ringkas">Ringkas &amp; Padat</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Teks Deskripsi &amp; Kriteria Lowongan *
          </label>
          <textarea
            required
            rows={9}
            value={formData.jobDescription}
            onChange={e => updateField('jobDescription', e.target.value)}
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
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
