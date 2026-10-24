'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Database, 
  Save, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  ShieldCheck,
  FileCode
} from 'lucide-react';
import { UserProfile, AppwriteConfig } from '@/lib/types';
import { 
  getUserProfile, 
  saveUserProfile, 
  exportAllDataAsJSON, 
  importAllDataFromJSON 
} from '@/lib/storage';
import { getAppwriteConfig, saveAppwriteConfig, getAppwriteClient } from '@/lib/appwrite';

export default function SettingsPage() {
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
      // If collection not found or permission issue, explain clearly
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
              Pengaturan & Koneksi Database
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500">
              Kelola profil pribadi, integrasikan dengan backend Appwrite, dan cadangkan (*backup*) data portofolio Anda.
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
        {/* User Profile */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              Profil & Identitas Pelamar
            </h2>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                placeholder="Nama Anda"
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Headline / Spesialisasi Utama
              </label>
              <input
                type="text"
                value={profile.headline}
                onChange={e => setProfile({ ...profile, headline: e.target.value })}
                placeholder="Misal: Fullstack Developer / Data Engineer"
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Ringkasan Singkat (Bio)
              </label>
              <textarea
                rows={3}
                value={profile.bio || ''}
                onChange={e => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Ringkasan pengalaman yang akan otomatis dimasukkan saat AI menghasilkan konteks..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Simpan Profil
            </button>
          </form>
        </div>

        {/* Appwrite Database Settings */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                Koneksi Appwrite Database
              </h2>
            </div>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              appwriteConfig.projectId
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
            }`}>
              {appwriteConfig.projectId ? 'Terkonfigurasi' : 'Penyimpanan Lokal'}
            </span>
          </div>

          <p className="text-xs text-zinc-500 leading-relaxed">
            Jika kosong, aplikasi tetap berjalan normal menggunakan <strong>penyimpanan lokal browser</strong>. Masukkan Project ID Appwrite Anda untuk sinkronisasi cloud.
          </p>

          <form onSubmit={handleSaveAppwrite} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Appwrite Endpoint
              </label>
              <input
                type="text"
                value={appwriteConfig.endpoint}
                onChange={e => setAppwriteConfig({ ...appwriteConfig, endpoint: e.target.value })}
                placeholder="https://cloud.appwrite.io/v1"
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Appwrite Project ID *
              </label>
              <input
                type="text"
                value={appwriteConfig.projectId}
                onChange={e => setAppwriteConfig({ ...appwriteConfig, projectId: e.target.value })}
                placeholder="Contoh: 67bb... (Dari Appwrite Console)"
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white outline-none font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Database ID
                </label>
                <input
                  type="text"
                  value={appwriteConfig.databaseId}
                  onChange={e => setAppwriteConfig({ ...appwriteConfig, databaseId: e.target.value })}
                  placeholder="job_tracker_db"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Projects Collection ID
                </label>
                <input
                  type="text"
                  value={appwriteConfig.projectsCollectionId}
                  onChange={e => setAppwriteConfig({ ...appwriteConfig, projectsCollectionId: e.target.value })}
                  placeholder="projects"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition"
              >
                Simpan Konfigurasi
              </button>
              <button
                type="button"
                onClick={handleTestAppwrite}
                className="py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                Uji Koneksi
              </button>
            </div>

            {testStatus === 'testing' && (
              <p className="text-[11px] text-zinc-500">Menghubungkan ke Appwrite...</p>
            )}
            {testStatus === 'success' && (
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Koneksi Appwrite Berhasil & Terverifikasi!
              </p>
            )}
            {testStatus?.startsWith('error') && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400">
                ⚠️ {testStatus} (Aplikasi otomatis memakai mode penyimpanan lokal).
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Backup & Restore Data Section */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              Cadangan Data (*Backup & Restore JSON*)
            </h2>
            <p className="text-xs text-zinc-500">
              Unduh seluruh isi bank proyek dan riwayat lamaran Anda dalam bentuk file JSON agar tidak pernah hilang.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={handleExport}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-xs font-bold transition"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Ekspor Data Portofolio (.json)
          </button>

          <label className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition cursor-pointer">
            <Upload className="w-4 h-4 text-blue-600" />
            Pulihkan / Impor Data dari JSON
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Guide: How to deploy to Vercel & Appwrite */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2">
          <FileCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200">
            Panduan Hosting ke Vercel & Appwrite
          </h3>
        </div>
        <ol className="list-decimal list-inside text-xs text-blue-900 dark:text-blue-300 space-y-1.5 leading-relaxed">
          <li><strong>Simpan Kode ke GitHub:</strong> Lakukan commit folder ini ke repository GitHub pribadi Anda.</li>
          <li><strong>Import di Vercel:</strong> Di dashboard Vercel, pilih <em>"New Project"</em> dan import repositori ini. Vercel akan otomatis mengenali Next.js dan fungsi Python di folder <code>/api</code>.</li>
          <li><strong>Appwrite Cloud (Gratis):</strong> Buka <a href="https://cloud.appwrite.io" target="_blank" rel="noopener noreferrer" className="underline font-bold">cloud.appwrite.io</a>, buat Project baru, buat Database bernama <code>job_tracker_db</code>, lalu buat 2 Collections: <code>projects</code> dan <code>applications</code>. Masukkan Project ID di halaman ini atau di Environment Variables Vercel!</li>
        </ol>
      </div>
    </div>
  );
}
