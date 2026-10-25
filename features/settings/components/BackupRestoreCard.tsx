import React from 'react';
import { ShieldCheck, Download, Upload } from 'lucide-react';

interface BackupRestoreCardProps {
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BackupRestoreCard: React.FC<BackupRestoreCardProps> = ({
  onExport,
  onImport,
}) => {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <ShieldCheck className="w-5 h-5 text-emerald-600" />
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            Cadangan Data (<em>Backup &amp; Restore JSON</em>)
          </h2>
          <p className="text-xs text-zinc-500">
            Unduh seluruh isi bank proyek dan riwayat lamaran Anda dalam bentuk file JSON agar tidak pernah hilang.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={onExport}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-xs font-bold transition cursor-pointer"
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
            onChange={onImport}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};
