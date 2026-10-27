'use client';

import React, { useState } from 'react';
import { CheckCircle2, Flame, Sparkles, ExternalLink, Award, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { AnalysisResult } from '@/lib/types';
import { MatchScoreGauge, getScoreTheme } from './MatchScoreGauge';

interface SkillsMatchBreakdownProps {
  result: AnalysisResult;
}

export const SkillsMatchBreakdown: React.FC<SkillsMatchBreakdownProps> = ({ result }) => {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const score = result.overall_match_percentage;
  const theme = getScoreTheme(score);

  const categorized = result.categorized_skills || {};
  const categoryKeys = Object.keys(categorized);

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 border border-white/[0.08] shadow-2xl space-y-6">
      {/* Executive Match Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-white/[0.08] pb-5">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${theme.badge}`}>
              {result.match_tier || (score >= 80 ? 'Sangat Cocok' : score >= 65 ? 'Peluang Kuat' : 'Potensial')}
            </span>
            <span className="text-xs text-slate-400">Analisis NLP Berbasis Portofolio Nyata</span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
            {result.job_title}
          </h3>
          <p className="text-xs text-slate-400">
            Perusahaan: <span className="font-semibold text-slate-200">{result.company_name}</span>
          </p>
          {result.match_summary && (
            <p className="text-xs text-slate-300 pt-1 leading-relaxed">
              {result.match_summary}
            </p>
          )}
        </div>

        {/* Circular Animated Gauge Component */}
        <MatchScoreGauge score={score} />
      </div>

      {/* Detected Skills Breakdown & Skill Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Covered Skills */}
        <div className="p-4 rounded-xl bg-slate-950/50 border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Keahlian Terdeteksi di Lowongan:
            </span>
            <span className="text-[11px] font-semibold text-emerald-400">
              {result.detected_skills.length} Skill
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {result.detected_skills.map((skill, i) => {
              const isGap = result.skill_gaps.includes(skill);
              return (
                <span
                  key={i}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition ${
                    isGap
                      ? 'bg-slate-900 text-slate-500 border border-white/5 line-through'
                      : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {skill}
                </span>
              );
            })}
            {result.detected_skills.length === 0 && (
              <span className="text-xs text-slate-400">Tidak ada teknologi spesifik yang terdeteksi.</span>
            )}
          </div>
        </div>

        {/* Skill Gaps */}
        <div className="p-4 rounded-xl bg-slate-950/50 border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              Skill Gap (Perlu Penguatan):
            </span>
            <span className="text-[11px] font-semibold text-amber-400">
              {result.skill_gaps.length} Skill
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {result.skill_gaps.map((skill, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30"
              >
                {skill}
              </span>
            ))}
            {result.skill_gaps.length === 0 && (
              <span className="text-xs text-emerald-400 font-medium">
                Luar biasa! Portofolio Anda mencakup seluruh keahlian teknis yang diminta!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Categorized Skills (Accordion) */}
      {categoryKeys.length > 0 && (
        <div className="rounded-xl border border-white/[0.08] overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="w-full px-4 py-2.5 bg-slate-950/60 flex items-center justify-between text-xs font-bold text-slate-200 hover:bg-slate-900 transition cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Taksonomi Domain Keahlian ({categoryKeys.length} Kategori)
            </span>
            {showAllCategories ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showAllCategories && (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/90 border-t border-white/[0.08]">
              {categoryKeys.map(cat => (
                <div key={cat} className="space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    {cat}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {categorized[cat].map((s, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-900 border border-white/[0.06] text-slate-300"
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
        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-blue-950/30 to-indigo-950/40 border border-indigo-500/25 space-y-2.5">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Strategi Interview &amp; Poin Bicara (Talking Points):
          </div>
          <div className="space-y-2">
            {result.interview_tips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-indigo-100/90 leading-relaxed">
                <span className="w-4 h-4 rounded-full bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
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
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-indigo-400" />
            Proyek Portofolio Paling Relevan Sebagai Bukti:
          </h4>
          <span className="text-[11px] text-slate-500">
            Diurutkan berdasarkan skor relevansi
          </span>
        </div>

        <div className="space-y-2.5">
          {result.matched_projects.slice(0, 3).map((mp, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl border border-white/[0.08] bg-slate-950/60 hover:border-white/20 transition space-y-2"
            >
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
                  <span className="inline-block text-[11px] px-2 py-0.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold">
                    Skor {mp.match_score}%
                  </span>
                </div>
              </div>

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
          ))}
        </div>
      </div>
    </div>
  );
};
