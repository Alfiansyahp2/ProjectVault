'use client';

import React, { useState, useEffect } from 'react';
import { Settings, CheckCircle2 } from 'lucide-react';
import { UserProfile, AppwriteConfig } from '@/lib/types';
import { 
  getUserProfile, 
  saveUserProfile, 
  exportAllDataAsJSON, 
  importAllDataFromJSON 
} from '@/lib/storage';
import { getAppwriteConfig, saveAppwriteConfig, getAppwriteClient } from '@/lib/appwrite';
import { ProfileSettingsForm } from './ProfileSettingsForm';
import { AppwriteConfigCard } from './AppwriteConfigCard';
import { BackupRestoreCard } from './BackupRestoreCard';
import { DeploymentGuideCard } from './DeploymentGuideCard';

export const SettingsView: React.FC = () => {
  // Profile state
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    headline: '',
    bio: '',
  });

  // Appwrite state
  const [appwriteConfig, setAppwriteConfig] = useState<AppwriteConfig>({
    endpoint: 'https://cloud.appwrite.io/v1',
    projectId: '',
    databaseId: 'job_tracker_db',
    projectsCollectionId: 'projects',
    applicationsCollectionId: 'applications',
    isEnabled: false,
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);

  useEffect(() => {
    const prof = getUserProfile();
    const aw = getAppwriteConfig();
    setProfile(prof);
    setAppwriteConfig(aw);
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    saveUserProfile(profile);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSaveAppwrite = (e: React.FormEvent) => {
    e.preventDefault();
    saveAppwriteConfig(appwriteConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleTestAppwrite = async () => {
    setTestStatus('testing');
    try {
      const aw = getAppwriteClient();
      if (!aw || !appwriteConfig.projectId) {
        setTestStatus('error_empty');
        return;
      }
      // Attempt to ping or list documents
      await aw.databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.projectsCollectionId
      );
      setTestStatus('success');
    } catch (err: any) {
      console.warn('Appwrite test error:', err);
      setTestStatus(`error: ${err.message || 'Koneksi gagal atau database/collection belum dibuat.'}`);
    }
  };

  const handleExport = () => {
    const jsonStr = exportAllDataAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project_vault_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importAllDataFromJSON(content);
        if (ok) {
          alert('Data berhasil diimpor! Halaman akan dimuat ulang.');
          window.location.reload();
        } else {
          alert('Format file JSON tidak valid.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              Pengaturan &amp; Koneksi Database
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500">
              Kelola profil pribadi, integrasikan dengan backend Appwrite, dan cadangkan (<em>backup</em>) data portofolio Anda.
            </p>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Pengaturan berhasil disimpan!
        </div>
      )}

      {/* Grid: Profile & Appwrite */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ProfileSettingsForm
          profile={profile}
          setProfile={setProfile}
          onSave={handleSaveProfile}
        />
        <AppwriteConfigCard
          appwriteConfig={appwriteConfig}
          setAppwriteConfig={setAppwriteConfig}
          onSave={handleSaveAppwrite}
          onTest={handleTestAppwrite}
          testStatus={testStatus}
        />
      </div>

      {/* Backup & Restore Data Section */}
      <BackupRestoreCard
        onExport={handleExport}
        onImport={handleImport}
      />

      {/* Guide: How to deploy to Vercel & Appwrite */}
      <DeploymentGuideCard />
    </div>
  );
};
