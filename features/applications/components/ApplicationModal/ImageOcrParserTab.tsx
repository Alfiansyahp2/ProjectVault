import React, { useRef, useState, useEffect } from 'react';
import { Image, RefreshCw, Upload, Clipboard, CheckCircle, Sparkles } from 'lucide-react';

interface ImageOcrParserTabProps {
  isParsing: boolean;
  ocrProgress?: number | null;
  ocrStatus?: string | null;
  onImageOcrParse: (fileOrBlob: File | Blob) => void;
}

export const ImageOcrParserTab: React.FC<ImageOcrParserTabProps> = ({
  isParsing,
  ocrProgress,
  ocrStatus,
  onImageOcrParse,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clipboard paste listener (Ctrl+V) for images
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const blob = items[i].getAsFile();
          if (blob) {
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
            onImageOcrParse(blob);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [onImageOcrParse]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
        onImageOcrParse(file);
      }
    }
  };

  const handleSelectFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
      onImageOcrParse(file);
    }
  };

  const handlePasteFromClipboardButton = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            setPreviewUrl(URL.createObjectURL(blob));
            onImageOcrParse(blob);
            return;
          }
        }
      }
    } catch {
      // Fallback hint
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Drag & Drop or Paste Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-5 text-center transition-all ${
          isDragging
            ? 'border-sky-400 bg-sky-500/15 scale-[1.01]'
            : 'border-white/15 hover:border-sky-500/40 bg-white/[0.02] hover:bg-white/[0.04]'
        } ${isParsing ? 'pointer-events-none opacity-80' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/jpg"
          className="hidden"
          onChange={e => {
            if (e.target.files && e.target.files.length > 0) {
              handleSelectFile(e.target.files[0]);
            }
          }}
        />

        <div className="flex flex-col items-center justify-center space-y-1.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center shadow-md shadow-sky-500/10">
            {isParsing ? (
              <RefreshCw className="w-5 h-5 animate-spin text-sky-400" />
            ) : (
              <Image className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-white">
              {isParsing ? 'Mengekstrak Teks Gambar...' : 'Tarik Tangkapan Layar / Gambar ke Sini'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              atau <span className="text-sky-400 font-semibold underline underline-offset-2">pilih file gambar</span> (.png, .jpg, .webp)
            </p>
          </div>
        </div>
      </div>

      {/* OCR Status and Progress Bar */}
      {isParsing && typeof ocrProgress === 'number' && (
        <div className="bg-slate-900/80 border border-sky-500/30 rounded-2xl p-3 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-sky-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-spin" />
              {ocrStatus || 'Memproses OCR...'}
            </span>
            <span className="font-mono text-sky-400 font-bold">{ocrProgress}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-400 to-indigo-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(5, ocrProgress))}%` }}
            />
          </div>
        </div>
      )}

      {/* Quick Paste Clipboard Button */}
      <div className="bg-slate-900/60 border border-white/[0.08] rounded-2xl p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
            <Clipboard className="w-3.5 h-3.5 text-amber-400" />
            <span>Tempel Cepat Screenshot</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Ctrl + V</span>
        </div>

        <button
          type="button"
          disabled={isParsing}
          onClick={handlePasteFromClipboardButton}
          className="w-full flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-200 transition cursor-pointer active:scale-98"
        >
          <Clipboard className="w-3.5 h-3.5 text-sky-400" />
          <span>Tempel Tangkapan Layar dari Clipboard</span>
        </button>
      </div>
    </div>
  );
};
