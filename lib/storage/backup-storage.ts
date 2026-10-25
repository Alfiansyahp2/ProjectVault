import { STORAGE_KEYS } from './keys';
import { getUserProfile } from './profile-storage';

export function exportAllDataAsJSON(): string {
  if (typeof window === 'undefined') return '{}';
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    profile: getUserProfile(),
    projects: JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]'),
    applications: JSON.parse(localStorage.getItem(STORAGE_KEYS.APPLICATIONS) || '[]'),
  };
  return JSON.stringify(data, null, 2);
}

export function importAllDataFromJSON(jsonString: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const data = JSON.parse(jsonString);
    if (data.projects) localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(data.projects));
    if (data.applications) localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(data.applications));
    if (data.profile) localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data.profile));
    return true;
  } catch (e) {
    console.error('Import failed:', e);
    return false;
  }
}
