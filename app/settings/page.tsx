import { Metadata } from 'next';
import { SettingsView } from '@/features/settings';

export const metadata: Metadata = {
  title: 'Pengaturan & Koneksi Cloud | ProjectVault AI',
  description: 'Kelola profil pelamar, integrasi backend Appwrite Cloud, dan cadangkan data portofolio.',
};

export default function SettingsPage() {
  return <SettingsView />;
}
