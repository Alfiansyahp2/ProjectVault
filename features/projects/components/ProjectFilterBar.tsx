import React from 'react';
import { Search, LayoutGrid, List, X } from 'lucide-react';
import { ProjectFilterBarProps } from '../types';

export const ProjectFilterBar: React.FC<ProjectFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategorySelect,
  categories,
  categoryStats,
  totalProjects,
  filteredCount,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="space-y-4">
      {/* Search input + View Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Cari berdasarkan nama proyek, teknologi (Python, Next.js, Go, dll), peran, atau dampak..."
            className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-white/10 bg-[#0b1220] text-white placeholder:text-slate-500 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 cursor-pointer"
              title="Hapus pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View Mode Toggle Button */}
        <div className="flex items-center gap-1 p-1 bg-[#0b1220] border border-white/10 rounded-xl shrink-0 self-end sm:self-auto">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Tampilan Grid Card"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === 'list'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Tampilan List / Baris Komprehensif"
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>
      </div>

      {/* Interactive Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((c, i) => {
          const count = c === 'ALL' ? totalProjects : (categoryStats[c] || 0);
          const isSelected = selectedCategory === c;
          return (
            <button
              key={i}
              onClick={() => onCategorySelect(c)}
              className={`whitespace-nowrap flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                  : 'bg-white/[0.04] text-slate-400 hover:text-slate-200 border border-white/[0.06] hover:bg-white/[0.08]'
              }`}
            >
              <span>{c === 'ALL' ? 'Semua Kategori' : c}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-indigo-500/30 text-indigo-200' : 'bg-white/[0.08] text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Result Indicator */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Menampilkan <strong>{filteredCount}</strong> dari {totalProjects} proyek</span>
        {searchQuery && (
          <span>Filter aktif: &ldquo;{searchQuery}&rdquo;</span>
        )}
      </div>
    </div>
  );
};
