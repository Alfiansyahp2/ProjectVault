'use client';

import React from 'react';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface ApplicationsIngestionBannerProps {
  unparsedCount: number;
  isBatchParsing: boolean;
  isSyncing: boolean;
  onBatchParse: (batchSize: number | 'all') => void;
  syncNotification: {
    type: 'success' | 'error';
    message: string;
    details?: string;
  } | null;
}

export const ApplicationsIngestionBanner: React.FC<ApplicationsIngestionBannerProps> = ({
  unparsedCount,
  isBatchParsing,
  isSyncing,
  onBatchParse,
  syncNotification,
}) => {
  return (
    <>
      {/* Smart Ingestion & Batch Control Banner */}
      {unparsedCount > 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-900/60 border border-amber-500/25 p-4 sm:p-4.5 backdrop-blur-md shadow-lg shadow-amber-500/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm font-bold text-amber-100">
                    {unparsedCount} Berkas Resume PDF Siap Di-parse
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Antrean Folder
                  </span>
                </div>
                <p className="text-[11px] text-amber-300/80 mt-0.5">
                  Ditemukan di folder <code className="font-mono text-amber-200 bg-black/20 px-1 py-0.5 rounded">data/resume</code>. Anda dapat memasukkannya secara bertahap 5 berkas per klik.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onBatchParse(5)}
                disabled={isBatchParsing || isSyncing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition shadow-md shadow-amber-500/20 disabled:opacity-50 active:scale-95 cursor-pointer"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isBatchParsing ? 'animate-spin' : ''}`} />
                <span>{isBatchParsing ? 'Memproses 5...' : `Parse 5 Berkas Baru (${unparsedCount} tersisa)`}</span>
              </button>
              <button
                onClick={() => onBatchParse('all')}
                disabled={isBatchParsing || isSyncing}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-amber-200 border border-amber-500/30 transition disabled:opacity-50 cursor-pointer"
                title="Parse seluruh berkas yang tersisa sekaligus"
              >
                Parse Semua ({unparsedCount})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sync Toast Notification Banner */}
      {syncNotification && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all animate-in fade-in slide-in-from-top-2 shadow-lg ${
          syncNotification.type === 'success'
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 shadow-emerald-500/10'
            : 'bg-rose-950/40 border-rose-500/40 text-rose-200 shadow-rose-500/10'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              syncNotification.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {syncNotification.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold">{syncNotification.message}</p>
              {syncNotification.details && (
                <p className="text-[11px] text-emerald-300/80 mt-0.5 leading-relaxed">{syncNotification.details}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
