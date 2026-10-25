'use client';

import React from 'react';
import { 
  Search, 
  LayoutGrid, 
  ListFilter, 
  AlertTriangle, 
  ArrowUpDown, 
  Filter, 
  FileText 
} from 'lucide-react';
import { getPortalBadge } from '@/lib/utils';

interface ApplicationsFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: 'kanban' | 'list';
  onViewModeChange: (m: 'kanban' | 'list') => void;
  sortBy: 'date_desc' | 'date_asc' | 'company_asc' | 'followup_due';
  onSortByChange: (s: any) => void;
  onlyFollowUpDue: boolean;
  onToggleFollowUp: () => void;
  onlyHasCoverLetter: boolean;
  onToggleCoverLetter: () => void;
  selectedPortal: string;
  onSelectPortal: (p: string) => void;
  portalCounts: Record<string, number>;
  uniquePortals: string[];
  totalApps: number;
  filteredCount: number;
  followUpDueCount: number;
  onResetFilters: () => void;
  isFilteringActive: boolean;
}

export const ApplicationsFilterBar: React.FC<ApplicationsFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortByChange,
  onlyFollowUpDue,
  onToggleFollowUp,
  onlyHasCoverLetter,
  onToggleCoverLetter,
  selectedPortal,
  onSelectPortal,
  portalCounts,
  uniquePortals,
  totalApps,
  filteredCount,
  followUpDueCount,
  onResetFilters,
  isFilteringActive,
}) => {
  return (
    <div className="space-y-3">
      {/* Search & Actions Bar */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3.5 space-y-3 shadow-md backdrop-blur-md">
        {/* Row 1: Search & Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari perusahaan, posisi kerja, keahlian, atau teks surat lamaran..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full bg-[#070b13] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white/[0.04] border border-white/[0.08] p-1 rounded-xl shrink-0">
              <button
                onClick={() => onViewModeChange('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewMode === 'kanban' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Tampilan Papan Kanban"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kanban</span>
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewMode === 'list' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Tampilan Tabel Data"
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tabel</span>
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative shrink-0">
              <select
                value={sortBy}
                onChange={e => onSortByChange(e.target.value)}
                className="text-xs bg-[#070b13] border border-white/[0.08] text-slate-300 font-semibold rounded-xl px-3 py-2 outline-none hover:border-white/20 transition cursor-pointer pr-7 appearance-none"
              >
                <option value="date_desc">Terbaru</option>
                <option value="date_asc">Terlama</option>
                <option value="company_asc">Nama Perusahaan (A-Z)</option>
                <option value="followup_due">Prioritas Follow-up</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Has Cover Letter Filter */}
            <button
              onClick={onToggleCoverLetter}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border shrink-0 ${
                onlyHasCoverLetter
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm'
                  : 'bg-white/[0.03] text-slate-400 border-white/[0.08] hover:text-white'
              }`}
              title="Saring lamaran yang memiliki dokumen teks surat lamaran utuh"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Arsip Surat</span>
            </button>

            {/* Follow-up Filter Chip Button */}
            <button
              onClick={onToggleFollowUp}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border shrink-0 ${
                onlyFollowUpDue
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                  : 'bg-white/[0.03] text-slate-400 border-white/[0.08] hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Butuh Follow-Up ({followUpDueCount})</span>
            </button>
          </div>
        </div>

        {/* Row 2: Portal Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3 h-3 text-indigo-400" /> Portal:
          </span>
          <button
            onClick={() => onSelectPortal('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition border ${
              selectedPortal === 'all'
                ? 'bg-white/15 text-white border-white/30 shadow-sm'
                : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:text-white'
            }`}
          >
            Semua ({totalApps})
          </button>
          {['Jobstreet', 'LinkedIn', 'Glints', 'Kalibrr', 'Instagram', 'Direct / Job Portal'].map((p) => {
            const count = portalCounts[p] || 0;
            if (count === 0 && !uniquePortals.some(up => up.toLowerCase().includes(p.toLowerCase()))) return null;
            const isSelected = selectedPortal.toLowerCase() === p.toLowerCase();
            return (
              <button
                key={p}
                onClick={() => onSelectPortal(isSelected ? 'all' : p)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition border ${
                  isSelected
                    ? 'bg-indigo-500/25 text-indigo-200 border-indigo-500/40 shadow-sm'
                    : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:text-white'
                }`}
              >
                {p} ({count})
              </button>
            );
          })}

          {isFilteringActive && (
            <button
              onClick={onResetFilters}
              className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold underline underline-offset-2 ml-auto shrink-0"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Result Indicator Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Menampilkan <strong className="text-white">{filteredCount}</strong> dari {totalApps} lamaran
        </span>
        {isFilteringActive && (
          <span className="text-[11px] text-indigo-300">
            Penyaringan aktif
          </span>
        )}
      </div>
    </div>
  );
};
