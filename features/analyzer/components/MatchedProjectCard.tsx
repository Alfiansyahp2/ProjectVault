'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { MatchedProject } from '@/lib/types';

interface MatchedProjectCardProps {
  matchedProject: MatchedProject;
  index: number;
}

export const MatchedProjectCard: React.FC<MatchedProjectCardProps> = ({ matchedProject: mp, index: i }) => {
  const bd = mp.score_breakdown;

  return (
    <div className="p-3.5 rounded-xl border border-white/[0.08] bg-slate-950/60 hover:border-white/20 transition space-y-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-bold text-sm text-white flex items-center gap-2 flex-wrap">
            <span>{i + 1}. {mp.project.title}</span>
            {mp.project.role && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-white/10 text-slate-300 font-medium">
                {mp.project.role}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 mt-1 line-clamp-2">
            {mp.project.description}
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="inline-block text-[11px] px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold">
            Skor {mp.match_score}%
          </span>
        </div>
      </div>

      {/* AHP-SAW Multi-criteria Breakdown */}
      {bd && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 border-t border-white/[0.04]">
          <div className="px-2 py-1 rounded bg-slate-900/80 border border-white/5 text-[10px]">
            <span className="text-slate-400 block">Stack (37%)</span>
            <span className="font-bold text-indigo-300">{Math.round(bd.tech_stack)}%</span>
          </div>
          <div className="px-2 py-1 rounded bg-slate-900/80 border border-white/5 text-[10px]">
            <span className="text-slate-400 block">Konteks (28%)</span>
            <span className="font-bold text-blue-300">{Math.round(bd.description)}%</span>
          </div>
          <div className="px-2 py-1 rounded bg-slate-900/80 border border-white/5 text-[10px]">
            <span className="text-slate-400 block">Role (20%)</span>
            <span className="font-bold text-emerald-300">{Math.round(bd.role_domain)}%</span>
          </div>
          <div className="px-2 py-1 rounded bg-slate-900/80 border border-white/5 text-[10px]">
            <span className="text-slate-400 block">Bukti (15%)</span>
            <span className="font-bold text-amber-300">{Math.round(bd.complexity)}%</span>
          </div>
        </div>
      )}

      {/* Matched Stack Pills & Reason */}
      <div className="pt-1.5 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="text-[11px] text-slate-400 flex items-center gap-1 flex-wrap">
          <span className="font-medium text-slate-300">Alasan Relevansi:</span> {mp.relevance_reason}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {mp.project.repo_url && (
            <a
              href={mp.project.repo_url}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-0.5"
            >
              Repo <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
          {mp.project.demo_url && (
            <a
              href={mp.project.demo_url}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-0.5"
            >
              Demo <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

