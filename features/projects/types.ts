import { Project } from '@/lib/types';

export interface ProjectNotification {
  type: 'success' | 'error';
  message: string;
  details?: string;
}

export interface ProjectFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategorySelect: (cat: string) => void;
  categories: string[];
  categoryStats: Record<string, number>;
  totalProjects: number;
  filteredCount: number;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export interface ProjectCardProps {
  project: Project;
  onSelect: (p: Project) => void;
  onEdit: (p: Project, e: React.MouseEvent) => void;
  onDelete: (id: string, title: string, e: React.MouseEvent) => void;
  copiedId: string | null;
  onCopy: (p: Project, e: React.MouseEvent) => void;
}

export interface ProjectGridProps {
  projects: Project[];
  onSelect: (p: Project) => void;
  onEdit: (p: Project, e: React.MouseEvent) => void;
  onDelete: (id: string, title: string, e: React.MouseEvent) => void;
  copiedId: string | null;
  onCopy: (p: Project, e: React.MouseEvent) => void;
}

export interface ProjectTableViewProps {
  projects: Project[];
  onSelect: (p: Project) => void;
  onEdit: (p: Project, e: React.MouseEvent) => void;
  onDelete: (id: string, title: string, e: React.MouseEvent) => void;
  copiedId: string | null;
  onCopy: (p: Project, e: React.MouseEvent) => void;
}
