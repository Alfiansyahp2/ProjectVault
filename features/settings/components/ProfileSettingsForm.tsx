import React from 'react';
import { User, Save } from 'lucide-react';
import { UserProfile } from '@/lib/types';

interface ProfileSettingsFormProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onSave: (e: React.FormEvent) => void;
}

export const ProfileSettingsForm: React.FC<ProfileSettingsFormProps> = ({
  profile,
  setProfile,
  onSave,
}) => {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <User className="w-5 h-5 text-blue-600" />
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">
          Profil &amp; Identitas Pelamar
        </h2>
      </div>

      <form onSubmit={onSave} className="space-y-4">
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
          className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Save className="w-4 h-4" /> Simpan Profil
        </button>
      </form>
    </div>
  );
};
