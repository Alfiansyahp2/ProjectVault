import { Metadata } from 'next';
import { AnalyzerView } from '@/features/analyzer';

export const metadata: Metadata = {
  title: 'Mesin Analisis Lowongan & Cover Letter | ProjectVault AI',
  description: 'Pencocokan semantik NLP lowongan kerja dengan portofolio proyek dan perakit surat lamaran otomatis.',
};

export default function AnalyzerPage() {
  return <AnalyzerView />;
}
