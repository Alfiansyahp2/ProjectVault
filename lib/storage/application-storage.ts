import { JobApplication } from '@/lib/types';
import { INITIAL_APPLICATIONS } from '@/data/seeds/applications.seed';
import { STORAGE_KEYS } from './keys';
import {
  getAppwriteConfig,
  fetchApplicationsFromAppwrite,
  saveApplicationToAppwrite,
  deleteApplicationFromAppwrite
} from '@/lib/appwrite';

export async function getApplications(): Promise<JobApplication[]> {
  const config = getAppwriteConfig();
  if (config.isEnabled) {
    const remote = await fetchApplicationsFromAppwrite();
    if (remote !== null) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(remote));
      }
      return remote;
    }
  }

  // Local storage fallback
  if (typeof window === 'undefined') return INITIAL_APPLICATIONS;
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    if (saved) {
      return JSON.parse(saved);
    } else {
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(INITIAL_APPLICATIONS));
      return INITIAL_APPLICATIONS;
    }
  } catch (e) {
    console.error('Error reading applications from local storage:', e);
    return INITIAL_APPLICATIONS;
  }
}

export async function saveApplication(appItem: JobApplication): Promise<JobApplication> {
  const originalId = appItem.id;
  const updatedApp = {
    ...appItem,
    id: appItem.id || `local_app_${Date.now()}`,
    createdAt: appItem.createdAt || new Date().toISOString(),
  };

  const config = getAppwriteConfig();
  if (config.isEnabled) {
    const remoteId = await saveApplicationToAppwrite(updatedApp);
    if (remoteId) {
      updatedApp.id = remoteId;
    }
  }

  // Update local storage
  if (typeof window !== 'undefined') {
    const current = await getApplications();
    const index = current.findIndex(a => a.id === updatedApp.id || (originalId && a.id === originalId));
    if (index >= 0) {
      current[index] = updatedApp;
    } else {
      current.unshift(updatedApp);
    }
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(current));
  }

  return updatedApp;
}

export async function deleteApplication(id: string): Promise<void> {
  const config = getAppwriteConfig();
  if (config.isEnabled) {
    await deleteApplicationFromAppwrite(id);
  }

  if (typeof window !== 'undefined') {
    const current = await getApplications();
    const filtered = current.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(filtered));
  }
}
