'use client';

import React from 'react';
import { FileText, Copy, Check, Save, Download, RefreshCw, Languages } from 'lucide-react';
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
    <div className="glass-card rounded-2xl p-5 sm:p-6 border border-white/[0.08] shadow-2xl space-y-4">
      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Draf Surat Lamaran Terarah (<em>Tailored Cover Letter</em>)
            </h3>
            <p className="text-[11px] text-slate-400">
              {wordCount} kata • {charCount} karakter • Berbasis bukti riil portofolio Anda
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={onCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.06] text-slate-200 hover:bg-white/[0.12] hover:text-white transition cursor-pointer"
          >
            {copiedLetter ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedLetter ? 'Tersalin!' : 'Salin Surat'}
          </button>

          <button
            type="button"
            onClick={onDownload}
            title="Unduh draf sebagai file .txt"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.06] text-slate-200 hover:bg-white/[0.12] hover:text-white transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Unduh</span>
          </button>

          <button
            type="button"
            onClick={onSaveToApplications}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white shadow-md transition cursor-pointer ${
              savedSuccess
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
            }`}
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {savedSuccess ? 'Tersimpan ke Pelacak!' : 'Simpan ke Pelacak'}
          </button>
        </div>
      </div>

      {/* Interactive Quick Re-tone & Language Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-950/60 border border-white/[0.08]">
        {/* Tone Selector Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-semibold text-slate-400 px-1 shrink-0">
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
                className={`px-2.5 py-1 rounded-lg text-xs transition cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {opt.label.split(' ')[0]}
              </button>
            );
          })}
        </div>

        {/* Language Switcher */}
        <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
          <Languages className="w-3.5 h-3.5 text-slate-400" />
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
                    ? 'bg-white/20 text-white border border-white/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang.flag} {lang.value.toUpperCase()}
              </button>
            );
          })}
          {isRegeneratingTone && (
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin ml-1" />
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
          className="w-full p-4 font-sans text-xs sm:text-sm rounded-xl border border-white/10 bg-slate-950/80 text-slate-100 leading-relaxed outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 font-normal transition"
        />
        {isRegeneratingTone && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-indigo-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Menyesuaikan gaya bahasa surat...
          </div>
        )}
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 flex items-center justify-between">
          <span>
            Lamaran untuk <strong>{jobTitle || 'posisi ini'}</strong> di <strong>{companyName || 'Perusahaan'}</strong> berhasil dicatat ke menu <strong>Pelacak Lamaran</strong> beserta riwayat surat ini!
          </span>
        </div>
      )}
    </div>
  );
};
