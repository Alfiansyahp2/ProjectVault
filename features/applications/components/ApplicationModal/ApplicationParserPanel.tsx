import React, { useState } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Image as ImageIcon, 
  AlignLeft 
} from 'lucide-react';
import { ApplicationParserPanelProps } from './types';
import { PdfParserTab } from './PdfParserTab';
import { ImageOcrParserTab } from './ImageOcrParserTab';
import { RawTextParserTab } from './RawTextParserTab';
import { ParsedResultCard } from './ParsedResultCard';

type ParserTabMode = 'pdf' | 'image' | 'text';

export const ApplicationParserPanel: React.FC<ApplicationParserPanelProps> = ({
  isParsing,
  parsedResult,
  parseSuccessMsg,
  parseErrorMsg,
  ocrProgress,
  ocrStatus,
  localFiles,
  selectedLocalFile,
  setSelectedLocalFile,
  onFileUpload,
  onLocalFileParse,
  onRawTextParse,
  onImageOcrParse,
  onResetParsed,
}) => {
  const [activeTab, setActiveTab] = useState<ParserTabMode>('pdf');

  return (
    <div className="lg:col-span-5 p-5 sm:p-6 space-y-4 bg-white/[0.015] flex flex-col justify-between min-w-0 max-w-full overflow-hidden">
      <div className="space-y-4 min-w-0 max-w-full">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider truncate">
                AI Document &amp; Vision Parser
              </h3>
              <p className="text-[10px] text-slate-400 truncate">
                Ekstraksi otomatis PDF, tangkapan layar, &amp; teks panjang
              </p>
            </div>
          </div>

          {parsedResult && (
            <button
              type="button"
              onClick={onResetParsed}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition shrink-0 ml-2 cursor-pointer"
              title="Reset hasil ekstraksi"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          )}
        </div>

        {/* Notifications Banner */}
        {parseSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="truncate">{parseSuccessMsg}</span>
          </div>
        )}

        {parseErrorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="truncate">{parseErrorMsg}</span>
          </div>
        )}

        {/* Tab Segment Controls */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('pdf')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium transition cursor-pointer ${
              activeTab === 'pdf'
                ? 'bg-gradient-to-r from-indigo-500/30 to-sky-500/30 text-white border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span className="truncate">Berkas PDF</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('image')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium transition cursor-pointer ${
              activeTab === 'image'
                ? 'bg-gradient-to-r from-sky-500/30 to-indigo-500/30 text-white border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
            <span className="truncate">Gambar / OCR</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium transition cursor-pointer ${
              activeTab === 'text'
                ? 'bg-gradient-to-r from-emerald-500/30 to-sky-500/30 text-white border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate">Teks Panjang</span>
          </button>
        </div>

        {/* Active Tab Content */}
        {activeTab === 'pdf' && (
          <PdfParserTab
            isParsing={isParsing}
            localFiles={localFiles}
            selectedLocalFile={selectedLocalFile}
            setSelectedLocalFile={setSelectedLocalFile}
            onFileUpload={onFileUpload}
            onLocalFileParse={onLocalFileParse}
          />
        )}

        {activeTab === 'image' && (
          <ImageOcrParserTab
            isParsing={isParsing}
            ocrProgress={ocrProgress}
            ocrStatus={ocrStatus}
            onImageOcrParse={onImageOcrParse}
          />
        )}

        {activeTab === 'text' && (
          <RawTextParserTab
            isParsing={isParsing}
            onRawTextParse={onRawTextParse}
          />
        )}

        {/* Parsed Result Insight Card */}
        <ParsedResultCard parsedResult={parsedResult} />
      </div>

      {/* Bottom tip info */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
          <span>NLP &amp; OCR Lokal 100% Offline</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">Zero Cloud API</span>
      </div>
    </div>
  );
};
