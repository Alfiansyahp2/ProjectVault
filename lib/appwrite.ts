import { Client, Databases, Account, ID, Query } from 'appwrite';
import { AppwriteConfig, Project, JobApplication } from './types';

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

// Appwrite operations
export async function fetchProjectsFromAppwrite(): Promise<Project[] | null> {
  const aw = getAppwriteClient();
  if (!aw) return null;

  try {
    const res = await aw.databases.listDocuments(
      aw.config.databaseId,
      aw.config.projectsCollectionId
    );
    return res.documents.map(doc => ({
      id: doc.$id,
      title: doc.title || '',
      role: doc.role || '',
      category: doc.category || '',
      technologies: Array.isArray(doc.technologies) ? doc.technologies : (doc.technologies ? doc.technologies.split(',') : []),
      description: doc.description || '',
      achievements: doc.achievements || '',
      repo_url: doc.repo_url || '',
      demo_url: doc.demo_url || '',
      date: doc.date || '',
      createdAt: doc.$createdAt,
    }));
  } catch (err) {
    console.warn('Appwrite fetch projects error:', err);
    return null;
  }
}

export async function saveProjectToAppwrite(project: Project): Promise<string | null> {
  const aw = getAppwriteClient();
  if (!aw) return null;

  const data = {
    title: project.title,
    role: project.role,
    category: project.category,
    technologies: project.technologies,
    description: project.description,
    achievements: project.achievements || '',
    repo_url: project.repo_url || '',
    demo_url: project.demo_url || '',
    date: project.date || '',
  };

  try {
    if (project.id && !project.id.startsWith('local_')) {
      await aw.databases.updateDocument(
        aw.config.databaseId,
        aw.config.projectsCollectionId,
        project.id,
        data
      );
      return project.id;
    } else {
      const doc = await aw.databases.createDocument(
        aw.config.databaseId,
        aw.config.projectsCollectionId,
        ID.unique(),
        data
      );
      return doc.$id;
    }
  } catch (err) {
    console.error('Appwrite save project error:', err);
    return null;
  }
}

export async function deleteProjectFromAppwrite(id: string): Promise<boolean> {
  const aw = getAppwriteClient();
  if (!aw || id.startsWith('local_')) return false;

  try {
    await aw.databases.deleteDocument(
      aw.config.databaseId,
      aw.config.projectsCollectionId,
      id
    );
    return true;
  } catch (err) {
    console.error('Appwrite delete project error:', err);
    return false;
  }
}

export async function fetchApplicationsFromAppwrite(): Promise<JobApplication[] | null> {
  const aw = getAppwriteClient();
  if (!aw) return null;

  try {
    const res = await aw.databases.listDocuments(
      aw.config.databaseId,
      aw.config.applicationsCollectionId
    );
    return res.documents.map(doc => ({
      id: doc.$id,
      company_name: doc.company_name || '',
      job_title: doc.job_title || '',
      status: doc.status || 'applied',
      applied_date: doc.applied_date || new Date().toISOString().split('T')[0],
      job_link: doc.job_link || '',
      salary_range: doc.salary_range || '',
      notes: doc.notes || '',
      job_description: doc.job_description || '',
      cover_letter: doc.cover_letter || '',
      matched_project_ids: doc.matched_project_ids || [],
      createdAt: doc.$createdAt,
    }));
  } catch (err) {
    console.warn('Appwrite fetch applications error:', err);
    return null;
  }
}

export async function saveApplicationToAppwrite(appItem: JobApplication): Promise<string | null> {
  const aw = getAppwriteClient();
  if (!aw) return null;

  const data = {
    company_name: appItem.company_name,
    job_title: appItem.job_title,
    status: appItem.status,
    applied_date: appItem.applied_date,
    job_link: appItem.job_link || '',
    salary_range: appItem.salary_range || '',
    notes: appItem.notes || '',
    job_description: appItem.job_description || '',
    cover_letter: appItem.cover_letter || '',
  };

  try {
    if (appItem.id && !appItem.id.startsWith('local_')) {
      await aw.databases.updateDocument(
        aw.config.databaseId,
        aw.config.applicationsCollectionId,
        appItem.id,
        data
      );
      return appItem.id;
    } else {
      const doc = await aw.databases.createDocument(
        aw.config.databaseId,
        aw.config.applicationsCollectionId,
        ID.unique(),
        data
      );
      return doc.$id;
    }
  } catch (err) {
    console.error('Appwrite save application error:', err);
    return null;
  }
}

export async function deleteApplicationFromAppwrite(id: string): Promise<boolean> {
  const aw = getAppwriteClient();
  if (!aw || id.startsWith('local_')) return false;

  try {
    await aw.databases.deleteDocument(
      aw.config.databaseId,
      aw.config.applicationsCollectionId,
      id
    );
    return true;
  } catch (err) {
    console.error('Appwrite delete application error:', err);
    return false;
  }
}
