'use client';

import React from 'react';
import { FileText, Copy, Check, Save, Download, RefreshCw, Languages, Sparkles } from 'lucide-react';
import { TONE_OPTIONS, LANGUAGE_OPTIONS } from '../constants';

interface CoverLetterGeneratorCardProps {
  coverLetterText: string;
  setCoverLetterText: (text: string) => void;
  onCopy: () => void;
  onSaveToApplications: () => void;
  onDownload: () => void;
  onToneChange: (tone: string) => void;
  onLanguageChange: (lang: 'id' | 'en') => void;
  currentTone: string;
  currentLanguage: 'id' | 'en';
  isRegeneratingTone: boolean;
  copiedLetter: boolean;
  savedSuccess: boolean;
  companyName: string;
  jobTitle: string;
}

export const CoverLetterGeneratorCard: React.FC<CoverLetterGeneratorCardProps> = ({
  coverLetterText,
  setCoverLetterText,
  onCopy,
  onSaveToApplications,
  onDownload,
  onToneChange,
  onLanguageChange,
  currentTone,
  currentLanguage,
  isRegeneratingTone,
  copiedLetter,
  savedSuccess,
  companyName,
  jobTitle,
}) => {
  const wordCount = coverLetterText.trim() ? coverLetterText.trim().split(/\s+/).length : 0;
  const charCount = coverLetterText.length;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              Draf Surat Lamaran Terarah (<em>Tailored Cover Letter</em>)
            </h3>
            <p className="text-[11px] text-zinc-400">
              {wordCount} kata • {charCount} karakter • Berbasis bukti proyek Anda
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={onCopy}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer"
          >
            {copiedLetter ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedLetter ? 'Tersalin!' : 'Salin Surat'}
          </button>

          <button
            type="button"
            onClick={onDownload}
            title="Unduh sebagai file .txt"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Unduh</span>
          </button>

          <button
            type="button"
            onClick={onSaveToApplications}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-sm transition cursor-pointer ${
              savedSuccess
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {savedSuccess ? 'Tersimpan ke Pelacak!' : 'Simpan ke Pelacak'}
          </button>
        </div>
      </div>

      {/* Interactive Quick Re-tone & Language Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800">
        {/* Tone Selector Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-semibold text-zinc-400 px-1 shrink-0">
            Gaya:
          </span>
          {TONE_OPTIONS.map(opt => {
            const isActive = currentTone === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                disabled={isRegeneratingTone}
                onClick={() => onToneChange(opt.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-700'
                }`}
              >
                {opt.label.split(' ')[0]}
              </button>
            );
          })}
        </div>

        {/* Language Switcher */}
        <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
          <Languages className="w-3.5 h-3.5 text-zinc-400" />
          {LANGUAGE_OPTIONS.map(lang => {
            const isActive = currentLanguage === lang.value;
            return (
              <button
                key={lang.value}
                type="button"
                disabled={isRegeneratingTone}
                onClick={() => onLanguageChange(lang.value as 'id' | 'en')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {lang.flag} {lang.value.toUpperCase()}
              </button>
            );
          })}
          {isRegeneratingTone && (
            <RefreshCw className="w-3.5 h-3.5 text-indigo-500 animate-spin ml-1" />
          )}
        </div>
      </div>

      {/* Editable Cover Letter Textarea */}
      <div className="relative">
        <textarea
          rows={14}
          value={coverLetterText}
          onChange={e => setCoverLetterText(e.target.value)}
          placeholder="Draf surat lamaran akan muncul di sini..."
          className="w-full p-4 font-sans text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 leading-relaxed outline-none focus:ring-2 focus:ring-indigo-500 font-normal"
        />
        {isRegeneratingTone && (
          <div className="absolute inset-0 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xs rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Menyesuaikan gaya bahasa surat...
          </div>
        )}
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <span>
            Lamaran untuk <strong>{jobTitle || 'posisi ini'}</strong> di <strong>{companyName || 'Perusahaan'}</strong> berhasil dicatat ke menu <strong>Pelacak Lamaran</strong> beserta riwayat surat ini!
          </span>
        </div>
      )}
    </div>
  );
};
