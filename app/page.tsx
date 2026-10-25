import { Metadata } from 'next';
import { DashboardView } from '@/features/dashboard';

export const metadata: Metadata = {
  title: 'Dasbor Utama | ProjectVault AI Tracker',
  description: 'Solusi Anti-Lupa Konteks AI, Vault Portofolio Proyek, dan Pelacak Lamaran Kerja Terintegrasi.',
};

export default function DashboardPage() {
  return <DashboardView />;
}
