'use client';

import React, { useState } from 'react';
import { CheckCircle2, Flame, Sparkles, HelpCircle, ExternalLink, Award, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { AnalysisResult } from '@/lib/types';

interface SkillsMatchBreakdownProps {
  result: AnalysisResult;
}

export const SkillsMatchBreakdown: React.FC<SkillsMatchBreakdownProps> = ({ result }) => {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const score = result.overall_match_percentage;

  // Determine color theme based on score
  const getTheme = (val: number) => {
    if (val >= 80) {
      return {
        stroke: '#10b981', // emerald-500
        text: 'text-emerald-500 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
        badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
      };
    }
    if (val >= 65) {
      return {
        stroke: '#3b82f6', // blue-500
        text: 'text-blue-500 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
        badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300',
      };
    }
    if (val >= 45) {
      return {
        stroke: '#f59e0b', // amber-500
        text: 'text-amber-500 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
        badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
      };
    }
    return {
      stroke: '#f43f5e', // rose-500
      text: 'text-rose-500 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
      badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300',
    };
  };

  const theme = getTheme(score);

  // Circular gauge values (radius = 38, circumference = 2 * PI * 38 ≈ 238.76)
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const categorized = result.categorized_skills || {};
  const categoryKeys = Object.keys(categorized);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Executive Match Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-zinc-100 dark:border-zinc-800 pb-5">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${theme.badge}`}>
              {result.match_tier || (score >= 80 ? 'Sangat Cocok' : score >= 65 ? 'Peluang Kuat' : 'Potensial')}
            </span>
            <span className="text-xs text-zinc-400">Analisis NLP Berbasis Proyek Nyata</span>
          </div>
          <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
            {result.job_title}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Perusahaan: <span className="font-semibold text-zinc-700 dark:text-zinc-200">{result.company_name}</span>
          </p>
          {result.match_summary && (
            <p className="text-xs text-zinc-600 dark:text-zinc-300 pt-1 leading-relaxed">
              {result.match_summary}
            </p>
          )}
        </div>

        {/* Circular Animated Gauge */}
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-center bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-2xl border border-zinc-200/60 dark:border-zinc-800">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-20 h-20 -rotate-90 transform" viewBox="0 0 96 96">
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                className="text-zinc-200 dark:text-zinc-800"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke={theme.stroke}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-xl font-black ${theme.text}`}>{score}%</span>
              <span className="text-[9px] uppercase tracking-wider font-semibold text-zinc-400">Cocok</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detected Skills Breakdown & Skill Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Covered Skills */}
        <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Keahlian Terdeteksi di Lowongan:
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              {result.detected_skills.length} Skill
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {result.detected_skills.map((skill, i) => {
              const isGap = result.skill_gaps.includes(skill);
              return (
                <span
                  key={i}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                    isGap
                      ? 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 line-through'
                      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800'
                  }`}
                >
                  {skill}
                </span>
              );
            })}
            {result.detected_skills.length === 0 && (
              <span className="text-xs text-zinc-400">Tidak ada spesifikasi teknis khusus yang terdeteksi.</span>
            )}
          </div>
        </div>

        {/* Skill Gaps */}
        <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" />
              Skill Gap (Perlu Penguatan):
            </span>
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              {result.skill_gaps.length} Skill
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
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
                Luar biasa! Portofolio Anda mencakup seluruh keahlian teknis yang diminta!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Categorized Skills (Accordion / Toggleable) */}
      {categoryKeys.length > 0 && (
        <div className="rounded-xl border border-zinc-200/70 dark:border-zinc-800 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Taksonomi Domain Keahlian Lowongan ({categoryKeys.length} Kategori)
            </span>
            {showAllCategories ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAllCategories && (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white dark:bg-zinc-950 border-t border-zinc-200/70 dark:border-zinc-800">
              {categoryKeys.map(cat => (
                <div key={cat} className="space-y-1">
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                    {cat}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {categorized[cat].map((s, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Strategic Interview Talking Points */}
      {result.interview_tips && result.interview_tips.length > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50/70 to-blue-50/70 dark:from-indigo-950/30 dark:to-blue-950/30 border border-indigo-200/70 dark:border-indigo-900/50 space-y-2.5">
          <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Strategi Interview &amp; Poin Bicara (Talking Points):
          </div>
          <div className="space-y-2">
            {result.interview_tips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-indigo-950 dark:text-indigo-200/90 leading-relaxed">
                <span className="w-4 h-4 rounded-full bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p>{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Matched Projects */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-blue-600" />
            Proyek Portofolio Paling Relevan Sebagai Bukti:
          </h4>
          <span className="text-[11px] text-zinc-400">
            Diurutkan berdasarkan skor relevansi
          </span>
        </div>

        <div className="space-y-2.5">
          {result.matched_projects.slice(0, 3).map((mp, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-950/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2 flex-wrap">
                    <span>{i + 1}. {mp.project.title}</span>
                    {mp.project.role && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium">
                        {mp.project.role}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                    {mp.project.description}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-block text-[11px] px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 font-bold">
                    Skor {mp.match_score}%
                  </span>
                </div>
              </div>

              {/* Matched Stack Pills & Reason */}
              <div className="pt-1 border-t border-zinc-200/50 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">Alasan Relevansi:</span> {mp.relevance_reason}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {mp.project.repo_url && (
                    <a
                      href={mp.project.repo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                    >
                      Repo <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                  {mp.project.demo_url && (
                    <a
                      href={mp.project.demo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                    >
                      Demo <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
