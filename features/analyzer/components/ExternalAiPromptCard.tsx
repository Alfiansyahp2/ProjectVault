'use client';

import React, { useState } from 'react';
import { BrainCircuit, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

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
    <div className="glass-card rounded-2xl p-5 border border-indigo-500/25 bg-gradient-to-r from-indigo-950/30 via-slate-900/60 to-blue-950/30 shadow-2xl space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              Mega-Prompt Khusus Lowongan Ini untuk AI Luar (Anti-Halusinasi)
            </h4>
            <p className="text-[11px] text-slate-400">
              Optimal untuk ChatGPT, Claude 3.7, DeepSeek, atau Gemini
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          {promptText && (
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 text-slate-300 text-xs font-semibold hover:bg-white/[0.08] hover:text-white transition cursor-pointer"
            >
              {showPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{showPreview ? 'Tutup' : 'Lihat Isi'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onCopyPrompt}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-sm transition cursor-pointer"
          >
            {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedPrompt ? 'Prompt Disalin!' : 'Salin Mega-Prompt'}
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        Ingin simulasi tanya-jawab wawancara teknis atau memoles poin CV untuk posisi ini? Salin prompt ini dan tempelkan ke AI eksternal. Prompt ini mengunci AI agar hanya merujuk bukti proyek nyata di portofolio Anda dan tidak mengarang pengalaman fiktif.
      </p>

      {/* Expandable Preview */}
      {showPreview && promptText && (
        <div className="pt-2">
          <pre className="p-3.5 rounded-xl bg-slate-950/90 border border-white/10 text-[11px] font-mono text-slate-200 max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {promptText}
          </pre>
        </div>
      )}
    </div>
  );
};
