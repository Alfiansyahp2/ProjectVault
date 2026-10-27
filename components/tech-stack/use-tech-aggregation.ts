import { useMemo } from 'react';
import { Project } from '@/lib/types';
import { getTechMeta, TechCategory, TechMeta } from './tech-taxonomy';

export interface AggregatedTechItem {
  name: string;
  meta: TechMeta;
  projects: Project[];
}

export const CATEGORIES: { label: string; value: 'ALL' | TechCategory }[] = [
  { label: 'Semua', value: 'ALL' },
  { label: 'Frontend', value: 'Frontend' },
  { label: 'Backend', value: 'Backend' },
  { label: 'Database & Cache', value: 'Database & Cache' },
  { label: 'DevOps & Cloud', value: 'DevOps & Cloud' },
  { label: 'AI & Data', value: 'AI & Machine Learning' },
  { label: 'Mobile', value: 'Mobile' },
  { label: 'Testing & Tools', value: 'Testing & Tools' },
];

export function useTechAggregation(
  projects: Project[],
  currentProject: Project | null,
  searchQuery: string,
  selectedCategory: 'ALL' | TechCategory
) {
  // Aggregate all unique technologies across all projects with project references
  const aggregatedTech = useMemo(() => {
    const map = new Map<string, AggregatedTechItem>();

    projects.forEach((proj) => {
      (proj.technologies || []).forEach((rawTech) => {
        const clean = rawTech.trim();
        if (!clean) return;
        const key = clean.toLowerCase();
        if (!map.has(key)) {
          map.set(key, {
            name: clean,
            meta: getTechMeta(clean),
            projects: [],
          });
        }
        const entry = map.get(key)!;
        if (!entry.projects.some((p) => p.id === proj.id)) {
          entry.projects.push(proj);
        }
      });
    });

    return Array.from(map.values()).sort((a, b) => {
      if (b.projects.length !== a.projects.length) {
        return b.projects.length - a.projects.length;
      }
      return a.name.localeCompare(b.name);
    });
  }, [projects]);

  // Grouped technologies for the currently selected project
  const projectTechGrouped = useMemo(() => {
    if (!currentProject) return [];
    const groups: { category: TechCategory; technologies: string[] }[] = [];
    const catMap = new Map<TechCategory, string[]>();

    (currentProject.technologies || []).forEach((t) => {
      const meta = getTechMeta(t);
      if (!catMap.has(meta.category)) {
        catMap.set(meta.category, []);
      }
      catMap.get(meta.category)!.push(t);
    });

    catMap.forEach((technologies, category) => {
      groups.push({ category, technologies });
    });

    return groups.sort((a, b) => b.technologies.length - a.technologies.length);
  }, [currentProject]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: aggregatedTech.length };
    aggregatedTech.forEach((t) => {
      counts[t.meta.category] = (counts[t.meta.category] || 0) + 1;
    });
    return counts;
  }, [aggregatedTech]);

  // Filtered tech list based on search and category
  const filteredTech = useMemo(() => {
    return aggregatedTech.filter((t) => {
      const matchCat =
        selectedCategory === 'ALL' || t.meta.category === selectedCategory;
      const matchSearch =
        searchQuery.trim() === '' ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.meta.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [aggregatedTech, selectedCategory, searchQuery]);

  return {
    aggregatedTech,
    projectTechGrouped,
    categoryCounts,
    filteredTech,
  };
}
