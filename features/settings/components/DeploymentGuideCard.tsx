import React from 'react';
import { FileCode } from 'lucide-react';

export const DeploymentGuideCard: React.FC = () => {
  return (
    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-2xl p-6 space-y-3">
      <div className="flex items-center gap-2">
        <FileCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200">
          Panduan Hosting ke Vercel &amp; Appwrite
        </h3>
      </div>
      <ol className="list-decimal list-inside text-xs text-blue-900 dark:text-blue-300 space-y-1.5 leading-relaxed">
        <li><strong>Simpan Kode ke GitHub:</strong> Lakukan commit folder ini ke repository GitHub pribadi Anda.</li>
        <li><strong>Import di Vercel:</strong> Di dashboard Vercel, pilih <em>&ldquo;New Project&rdquo;</em> dan import repositori ini. Vercel akan otomatis mengenali Next.js dan fungsi Python di folder <code>/api</code>.</li>
        <li><strong>Appwrite Cloud (Gratis):</strong> Buka <a href="https://cloud.appwrite.io" target="_blank" rel="noopener noreferrer" className="underline font-bold">cloud.appwrite.io</a>, buat Project baru, buat Database bernama <code>job_tracker_db</code>, lalu buat 2 Collections: <code>projects</code> dan <code>applications</code>. Masukkan Project ID di halaman ini atau di Environment Variables Vercel!</li>
      </ol>
    </div>
  );
};
