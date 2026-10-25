'use client';

import { useState, useMemo } from 'react';
import { JobApplication } from '@/lib/types';
import { calculateDaysAgo } from '@/lib/utils';

export function useApplicationFilters(applications: JobApplication[], totalPdfFiles: number = 91) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedPortal, setSelectedPortal] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'company_asc' | 'followup_due'>('date_desc');
  const [onlyFollowUpDue, setOnlyFollowUpDue] = useState<boolean>(false);
  const [onlyHasCoverLetter, setOnlyHasCoverLetter] = useState<boolean>(false);

  // Metrics
  const uniqueCompanies = useMemo(() => new Set(applications.map(a => a.company_name)).size, [applications]);
  
  const portalCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach(a => {
      const p = a.source_portal || 'Direct';
      counts[p] = (counts[p] || 0) + 1;
    });
    return counts;
  }, [applications]);

  const topPortal = useMemo(() => {
    let top = 'Jobstreet';
    let max = 0;
    Object.entries(portalCounts).forEach(([k, v]) => {
      if (v > max) {
        max = v;
        top = k;
      }
    });
    return top;
  }, [portalCounts]);

  const uniquePortals = useMemo(() => Object.keys(portalCounts), [portalCounts]);

  const followUpDueCount = useMemo(() => {
    return applications.filter(a => {
      if (a.status !== 'applied') return false;
      return calculateDaysAgo(a.applied_date) >= 7;
    }).length;
  }, [applications]);

  const parsedProgressPercent = useMemo(() => {
    if (totalPdfFiles <= 0) return 100;
    return Math.min(100, Math.round((applications.length / totalPdfFiles) * 100));
  }, [applications.length, totalPdfFiles]);

  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCompany = (app.company_name || '').toLowerCase().includes(q);
        const matchTitle = (app.job_title || '').toLowerCase().includes(q);
        const matchNotes = (app.notes || '').toLowerCase().includes(q);
        const matchSkills = (app.key_skills || []).some(s => s.toLowerCase().includes(q));
        const matchCover = (app.cover_letter || '').toLowerCase().includes(q);
        if (!matchCompany && !matchTitle && !matchNotes && !matchSkills && !matchCover) return false;
      }

      // 2. Portal Filter
      if (selectedPortal !== 'all') {
        const portalVal = (app.source_portal || 'Direct').toLowerCase();
        if (selectedPortal.toLowerCase() === 'direct / job portal') {
          if (!portalVal.includes('direct') && !portalVal.includes('portal')) return false;
        } else if (!portalVal.includes(selectedPortal.toLowerCase())) {
          return false;
        }
      }

      // 3. Follow-up Due Only
      if (onlyFollowUpDue) {
        const isFollowUpDue = app.status === 'applied' && calculateDaysAgo(app.applied_date) >= 7;
        if (!isFollowUpDue) return false;
      }

      // 4. Has Cover Letter Only
      if (onlyHasCoverLetter) {
        if (!app.cover_letter || !app.cover_letter.trim()) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.applied_date).getTime() - new Date(a.applied_date).getTime();
      }
      if (sortBy === 'date_asc') {
        return new Date(a.applied_date).getTime() - new Date(b.applied_date).getTime();
      }
      if (sortBy === 'company_asc') {
        return (a.company_name || '').localeCompare(b.company_name || '');
      }
      if (sortBy === 'followup_due') {
        const daysA = a.status === 'applied' ? calculateDaysAgo(a.applied_date) : -1;
        const daysB = b.status === 'applied' ? calculateDaysAgo(b.applied_date) : -1;
        return daysB - daysA;
      }
      return 0;
    });
  }, [applications, searchQuery, selectedPortal, onlyFollowUpDue, onlyHasCoverLetter, sortBy]);

  const resetFilters = () => {
    setSelectedPortal('all');
    setOnlyFollowUpDue(false);
    setOnlyHasCoverLetter(false);
    setSearchQuery('');
  };

  const isFilteringActive = Boolean(searchQuery || selectedPortal !== 'all' || onlyFollowUpDue || onlyHasCoverLetter);

  return {
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    selectedPortal,
    setSelectedPortal,
    sortBy,
    setSortBy,
    onlyFollowUpDue,
    setOnlyFollowUpDue,
    onlyHasCoverLetter,
    setOnlyHasCoverLetter,
    uniqueCompanies,
    portalCounts,
    uniquePortals,
    topPortal,
    followUpDueCount,
    parsedProgressPercent,
    filteredApps,
    resetFilters,
    isFilteringActive,
  };
}
