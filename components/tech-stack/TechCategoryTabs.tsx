'use client';

import React from 'react';
import { Search, Copy, Check } from 'lucide-react';
import { TechCategory } from './tech-taxonomy';
import { CATEGORIES } from './use-tech-aggregation';

interface TechCategoryTabsProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedCategory: 'ALL' | TechCategory;
  setSelectedCategory: (val: 'ALL' | TechCategory) => void;
  categoryCounts: Record<string, number>;
  filteredCount: number;
  onCopyAll: () => void;
  copiedText: boolean;
}

export const TechCategoryTabs: React.FC<TechCategoryTabsProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categoryCounts,
  filteredCount,
  onCopyAll,
  copiedText,
}) => {
  return (
    <div className="space-y-4">
      {/* Search Bar & Copy Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari teknologi, framework, atau database (misal: React, Python, Docker)..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-900/80 border border-white/[0.08] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Bersihkan
            </button>
          )}
        </div>

        <button
          onClick={onCopyAll}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/[0.08] transition shrink-0 cursor-pointer"
          title="Salin daftar teknologi yang difilter"
        >
          {copiedText ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Tersalin!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-indigo-400" />
              <span>Salin Semua ({filteredCount})</span>
            </>
          )}
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const count = categoryCounts[cat.value] || 0;
          const isActive = selectedCategory === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 flex items-center gap-1.5 transition cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20'
                  : 'bg-white/[0.04] text-slate-400 hover:text-slate-200 border border-white/[0.06]'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-white/[0.06] text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
