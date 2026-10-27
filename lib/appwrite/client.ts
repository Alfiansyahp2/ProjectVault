import { Client, Databases, Account } from 'appwrite';
import { AppwriteConfig } from '../types';

export const DEFAULT_APPWRITE_CONFIG: AppwriteConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '',
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'job_tracker_db',
  projectsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION || 'projects',
  applicationsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_APPLICATIONS_COLLECTION || 'applications',
  isEnabled: false,
};

// Get config from localStorage or env
export function getAppwriteConfig(): AppwriteConfig {
  if (typeof window === 'undefined') {
    return DEFAULT_APPWRITE_CONFIG;
  }
  try {
    const saved = localStorage.getItem('appwrite_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_APPWRITE_CONFIG,
        ...parsed,
        isEnabled: Boolean(parsed.projectId && parsed.projectId.trim() !== '')
      };
    }
  } catch (e) {
    console.error('Failed to parse appwrite config', e);
  }
  return {
    ...DEFAULT_APPWRITE_CONFIG,
    isEnabled: Boolean(DEFAULT_APPWRITE_CONFIG.projectId && DEFAULT_APPWRITE_CONFIG.projectId.trim() !== '')
  };
}

export function saveAppwriteConfig(config: AppwriteConfig) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('appwrite_config', JSON.stringify({
      ...config,
      isEnabled: Boolean(config.projectId && config.projectId.trim() !== '')
    }));
  }
}

// Get Appwrite instances
export function getAppwriteClient() {
  const config = getAppwriteConfig();
  if (!config.projectId) return null;

  const client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId);

  const databases = new Databases(client);
  const account = new Account(client);

  return { client, databases, account, config };
}
