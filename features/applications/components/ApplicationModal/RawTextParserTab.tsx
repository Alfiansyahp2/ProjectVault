import React, { useState } from 'react';
import { ClipboardPaste, RotateCcw, Sparkles, RefreshCw, AlignLeft } from 'lucide-react';

interface RawTextParserTabProps {
  isParsing: boolean;
  onRawTextParse: (text: string, sourceHint?: string) => void;
}

export const RawTextParserTab: React.FC<RawTextParserTabProps> = ({
  isParsing,
  onRawTextParse,
}) => {
  const [rawText, setRawText] = useState('');

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setRawText(text);
      }
    } catch {
      // Ignore clipboard permission errors silently
    }
  };

  const handleClear = () => {
    setRawText('');
  };

  const wordCount = rawText.trim() ? rawText.trim().split(/\s+/).length : 0;
  const charCount = rawText.length;

  return (
    <div className="space-y-3">
      {/* Header action bar */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
          <AlignLeft className="w-3.5 h-3.5 text-emerald-400" />
          <span>Salin / Tempel Teks Panjang</span>
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePasteClipboard}
            className="flex items-center gap-1 px-2 py-1 text-[11px] rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-sky-400 transition cursor-pointer"
          >
            <ClipboardPaste className="w-3 h-3" />
            <span>Tempel</span>
          </button>
          {rawText && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1 px-2 py-1 text-[11px] rounded-lg text-slate-400 hover:text-rose-400 transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Bersihkan</span>
            </button>
          )}
        </div>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={rawText}
          onChange={e => setRawText(e.target.value)}
          placeholder="Tempel teks lowongan kerja, pesan rekruter LinkedIn/WhatsApp, atau isi surat lamaran panjang di sini..."
          rows={6}
          className="w-full px-3.5 py-3 text-xs rounded-2xl border border-white/10 bg-[#070b14] text-white placeholder-slate-500 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 outline-none transition resize-none leading-relaxed"
        />
        <div className="flex items-center justify-between pt-1 px-1 text-[10px] text-slate-500">
          <span>{wordCount} kata • {charCount} karakter</span>
          <span>Dianalisis NLP Lokal</span>
        </div>
      </div>

      {/* Trigger Extract Button */}
      <button
        type="button"
        disabled={!rawText.trim() || isParsing}
        onClick={() => onRawTextParse(rawText, 'Teks Salinan Panjang')}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition shadow-md shadow-emerald-500/20 active:scale-[0.98] cursor-pointer"
      >
        {isParsing ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Menganalisis Entitas Teks...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>Ekstrak Entitas dari Teks Ini</span>
          </>
        )}
      </button>
    </div>
  );
};
