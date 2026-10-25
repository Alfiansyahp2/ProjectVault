import React from 'react';
import { BrainCircuit, Copy, Check } from 'lucide-react';

interface ExternalAiPromptCardProps {
  onCopyPrompt: () => void;
  copiedPrompt: boolean;
}

export const ExternalAiPromptCard: React.FC<ExternalAiPromptCardProps> = ({
  onCopyPrompt,
  copiedPrompt,
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-900 rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200">
            Prompt Khusus Lowongan Ini untuk AI Luar (Anti-Lupa)
          </h4>
        </div>
        <button
          onClick={onCopyPrompt}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition cursor-pointer"
        >
          {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copiedPrompt ? 'Prompt Disalin!' : 'Salin Mega-Prompt'}
        </button>
      </div>
      <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
        Ingin bertanya lebih lanjut ke ChatGPT/Claude/Gemini mengenai simulasi wawancara teknis atau pertanyaan HR untuk posisi ini? Salin prompt ini dan tempel di AI agar AI langsung mengetahui deskripsi lowongan DAN seluruh riwayat proyek nyata Anda!
      </p>
    </div>
  );
};
