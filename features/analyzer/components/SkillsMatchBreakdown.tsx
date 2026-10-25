import React from 'react';
import { CheckCircle2, Flame } from 'lucide-react';
import { AnalysisResult } from '@/lib/types';

interface SkillsMatchBreakdownProps {
  result: AnalysisResult;
}

export const SkillsMatchBreakdown: React.FC<SkillsMatchBreakdownProps> = ({ result }) => {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
            Hasil Analisis Kecocokan Portofolio
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Untuk posisi <span className="font-semibold">{result.job_title}</span> di <span className="font-semibold">{result.company_name}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-zinc-400 block">Skor Kecocokan</span>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {result.overall_match_percentage}%
            </span>
          </div>
          <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-950/60 border-4 border-blue-500 flex items-center justify-center font-bold text-blue-600 text-sm">
            {result.overall_match_percentage}%
          </div>
        </div>
      </div>

      {/* Detected Skills vs Gap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Detected & Owned */}
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700">
          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Keahlian Terdeteksi di Lowongan:
          </span>
          <div className="flex flex-wrap gap-1">
            {result.detected_skills.map((skill, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              >
                {skill}
              </span>
            ))}
            {result.detected_skills.length === 0 && (
              <span className="text-xs text-zinc-400">Tidak ada teknologi spesifik yang terdeteksi.</span>
            )}
          </div>
        </div>

        {/* Skill Gaps */}
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700">
          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 mb-2">
            <Flame className="w-4 h-4 text-amber-500" />
            Skill Gap (Belum Ada di Proyek Anda):
          </span>
          <div className="flex flex-wrap gap-1">
            {result.skill_gaps.map((skill, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
              >
                {skill}
              </span>
            ))}
            {result.skill_gaps.length === 0 && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Luar biasa! Portofolio Anda mencakup semua skill yang diminta.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Top Matched Projects */}
      <div>
        <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
          Proyek Anda yang Paling Relevan:
        </h4>
        <div className="space-y-2">
          {result.matched_projects.slice(0, 3).map((mp, i) => (
            <div
              key={i}
              className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-start justify-between gap-3 text-xs"
            >
              <div>
                <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <span>{i + 1}. {mp.project.title}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-semibold">
                    Skor {mp.match_score}%
                  </span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                  {mp.relevance_reason}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
