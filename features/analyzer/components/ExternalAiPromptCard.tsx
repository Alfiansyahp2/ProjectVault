'use client';

import React, { useState } from 'react';
import { BrainCircuit, Copy, Check, ChevronDown, ChevronUp, Bot, Sparkles } from 'lucide-react';

interface ExternalAiPromptCardProps {
  onCopyPrompt: () => void;
  copiedPrompt: boolean;
  promptText?: string;
}

export const ExternalAiPromptCard: React.FC<ExternalAiPromptCardProps> = ({
  onCopyPrompt,
  copiedPrompt,
  promptText = '',
}) => {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/80 dark:border-blue-900 rounded-2xl p-5 space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-sm">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-950 dark:text-blue-100">
              Mega-Prompt Khusus Lowongan Ini untuk AI Luar (Anti-Halusinasi)
            </h4>
            <p className="text-[11px] text-blue-700/80 dark:text-blue-300/80">
              Untuk digunakan di ChatGPT, Claude 3.7, DeepSeek, atau Gemini
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          {promptText && (
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-200 text-xs font-semibold hover:bg-blue-100/60 dark:hover:bg-blue-900/50 transition cursor-pointer"
            >
              {showPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{showPreview ? 'Tutup' : 'Lihat Isi'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onCopyPrompt}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-sm transition cursor-pointer"
          >
            {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedPrompt ? 'Prompt Disalin!' : 'Salin Mega-Prompt'}
          </button>
        </div>
      </div>

      <p className="text-xs text-blue-900/80 dark:text-blue-200/90 leading-relaxed">
        Ingin simulasi tanya-jawab wawancara teknis atau memoles poin CV untuk posisi ini? Salin prompt ini dan tempelkan ke AI eksternal. Prompt ini mengunci AI agar hanya merujuk bukti proyek nyata di portofolio Anda dan tidak mengarang pengalaman fiktif.
      </p>

      {/* Expandable Preview */}
      {showPreview && promptText && (
        <div className="pt-2">
          <pre className="p-3.5 rounded-xl bg-white/80 dark:bg-zinc-950/80 border border-blue-200 dark:border-blue-900/80 text-[11px] font-mono text-zinc-800 dark:text-zinc-200 max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {promptText}
          </pre>
        </div>
      )}
    </div>
  );
};
