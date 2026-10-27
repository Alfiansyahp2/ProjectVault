'use client';

import React from 'react';

interface MatchScoreGaugeProps {
  score: number;
}

export function getScoreTheme(val: number) {
  if (val >= 80) {
    return {
      stroke: '#10b981', // emerald-500
      text: 'text-emerald-400',
      bg: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    };
  }
  if (val >= 65) {
    return {
      stroke: '#6366f1', // indigo-500
      text: 'text-indigo-400',
      bg: 'bg-indigo-950/40 border-indigo-500/30 text-indigo-300',
      badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    };
  }
  if (val >= 45) {
    return {
      stroke: '#f59e0b', // amber-500
      text: 'text-amber-400',
      bg: 'bg-amber-950/40 border-amber-500/30 text-amber-300',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    };
  }
  return {
    stroke: '#f43f5e', // rose-500
    text: 'text-rose-400',
    bg: 'bg-rose-950/40 border-rose-500/30 text-rose-300',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  };
}

export const MatchScoreGauge: React.FC<MatchScoreGaugeProps> = ({ score }) => {
  const theme = getScoreTheme(score);
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center gap-3 shrink-0 self-start sm:self-center bg-slate-950/60 p-3 rounded-2xl border border-white/[0.08]">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg className="w-20 h-20 -rotate-90 transform" viewBox="0 0 96 96">
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-800"
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
          <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">Cocok</span>
        </div>
      </div>
    </div>
  );
};
