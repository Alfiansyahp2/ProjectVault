import { Metadata } from 'next';
import { ProjectsView } from '@/features/projects';

export const metadata: Metadata = {
  title: 'Bank Proyek & Portofolio | ProjectVault AI',
  description: 'Katalog rekam jejak arsitektur sistem, peran, tech stack, dan capaian terukur siap pakai.',
};

export default function ProjectsPage() {
  return <ProjectsView />;
}
