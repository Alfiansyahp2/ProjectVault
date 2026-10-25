'use client';

import { useState, useMemo } from 'react';
import { Project } from '@/lib/types';
import { parseAchievements } from '../utils';

export function useProjectFilters(projects: Project[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        p.title.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.achievements && p.achievements.toLowerCase().includes(q)) ||
        p.technologies.some(t => t.toLowerCase().includes(q))
      );

      const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [projects, searchQuery, selectedCategory]);

  // Aggregate category counts
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach(p => {
      const cat = p.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [projects]);

  const categories = useMemo(() => {
    const PREDEFINED_ORDER = ['Projek di SEVIMA', 'My Produk', 'Freelance', 'Research & Thesis', 'Test'];
    const keys = Object.keys(categoryStats);
    const ordered = PREDEFINED_ORDER.filter(c => keys.includes(c));
    const others = keys.filter(c => !PREDEFINED_ORDER.includes(c));
    return ['ALL', ...ordered, ...others];
  }, [categoryStats]);

  // Metrics summary
  const totalTech = useMemo(() => {
    const all = new Set<string>();
    projects.forEach(p => p.technologies.forEach(t => all.add(t.toLowerCase().trim())));
    return all.size;
  }, [projects]);

  const totalAchievements = useMemo(() => {
    return projects.reduce((acc, p) => acc + parseAchievements(p.achievements).length, 0);
  }, [projects]);

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    viewMode,
    setViewMode,
    filteredProjects,
    categoryStats,
    categories,
    totalTech,
    totalAchievements
  };
}
