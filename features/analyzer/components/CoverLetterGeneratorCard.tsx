import React from 'react';
import { FileText, Copy, Check, Save } from 'lucide-react';

interface CoverLetterGeneratorCardProps {
  coverLetterText: string;
  setCoverLetterText: (text: string) => void;
  onCopy: () => void;
  onSaveToApplications: () => void;
  copiedLetter: boolean;
  savedSuccess: boolean;
}

export const CoverLetterGeneratorCard: React.FC<CoverLetterGeneratorCardProps> = ({
  coverLetterText,
  setCoverLetterText,
  onCopy,
  onSaveToApplications,
  copiedLetter,
  savedSuccess,
}) => {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
            Draf Surat Lamaran Terarah (<em>Tailored Cover Letter</em>)
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCopy}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer"
          >
            {copiedLetter ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedLetter ? 'Tersalin!' : 'Salin Surat'}
          </button>
          <button
            onClick={onSaveToApplications}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition cursor-pointer"
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
  );
};
