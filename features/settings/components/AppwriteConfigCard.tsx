import React from 'react';
import { Database, CheckCircle2 } from 'lucide-react';
import { AppwriteConfig } from '@/lib/types';

interface AppwriteConfigCardProps {
  appwriteConfig: AppwriteConfig;
  setAppwriteConfig: React.Dispatch<React.SetStateAction<AppwriteConfig>>;
  onSave: (e: React.FormEvent) => void;
  onTest: () => void;
  testStatus: string | null;
}

export const AppwriteConfigCard: React.FC<AppwriteConfigCardProps> = ({
  appwriteConfig,
  setAppwriteConfig,
  onSave,
  onTest,
  testStatus,
}) => {
  return (
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

      <form onSubmit={onSave} className="space-y-3">
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
            className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition cursor-pointer"
          >
            Simpan Konfigurasi
          </button>
          <button
            type="button"
            onClick={onTest}
            className="py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            Uji Koneksi
          </button>
        </div>

        {testStatus === 'testing' && (
          <p className="text-[11px] text-zinc-500">Menghubungkan ke Appwrite...</p>
        )}
        {testStatus === 'success' && (
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Koneksi Appwrite Berhasil &amp; Terverifikasi!
          </p>
        )}
        {testStatus?.startsWith('error') && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400">
            ⚠️ {testStatus} (Aplikasi otomatis memakai mode penyimpanan lokal).
          </p>
        )}
      </form>
    </div>
  );
};
