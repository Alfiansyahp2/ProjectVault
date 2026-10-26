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

/**
 * Validates if an ID conforms to Appwrite Document UID constraints:
 * - Must be at most 36 characters
 * - Valid chars: a-z, A-Z, 0-9, period (.), hyphen (-), underscore (_)
 * - Cannot start with a leading period, hyphen, or underscore
 * - Excludes client-side local IDs ('local_', 'temp_') and mock application slugs ('app_surat_')
 */
export function isValidAppwriteId(id?: string | null): boolean {
  if (!id || typeof id !== 'string') return false;
  const trimmed = id.trim();
  if (trimmed.length < 1 || trimmed.length > 36) return false;
  if (trimmed.startsWith('local_') || trimmed.startsWith('temp_') || trimmed.startsWith('app_surat_')) return false;
  return /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(trimmed);
}

// Appwrite operations
export async function fetchProjectsFromAppwrite(): Promise<Project[] | null> {
  const aw = getAppwriteClient();
  if (!aw) return null;

  try {
    const res = await aw.databases.listDocuments(
      aw.config.databaseId,
      aw.config.projectsCollectionId,
      [Query.limit(100)]
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
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.info(`[Appwrite] Fallback: Koleksi '${aw.config.projectsCollectionId}' belum tersedia di Cloud (${errorMsg}). Menggunakan Local Storage.`);
    return null;
  }
}

export async function saveProjectToAppwrite(project: Project): Promise<string | null> {
  const aw = getAppwriteClient();
  if (!aw) return null;

  const data: Record<string, any> = {
    title: (project.title || '').slice(0, 255),
    role: (project.role || 'Developer').slice(0, 255),
    category: (project.category || 'General').slice(0, 255),
    technologies: Array.isArray(project.technologies) ? project.technologies : [],
    description: (project.description || '').slice(0, 5000),
    achievements: (project.achievements || '').slice(0, 5000),
    date: (project.date || '').slice(0, 50),
  };

  if (project.repo_url && (project.repo_url.startsWith('http://') || project.repo_url.startsWith('https://'))) {
    data.repo_url = project.repo_url.trim().slice(0, 1000);
  }
  if (project.demo_url && (project.demo_url.startsWith('http://') || project.demo_url.startsWith('https://'))) {
    data.demo_url = project.demo_url.trim().slice(0, 1000);
  }

  try {
    if (isValidAppwriteId(project.id)) {
      try {
        await aw.databases.updateDocument(
          aw.config.databaseId,
          aw.config.projectsCollectionId,
          project.id,
          data
        );
        return project.id;
      } catch (updateErr: any) {
        // Document not found on remote (404), fall back to create
        if (updateErr?.code === 404 || updateErr?.status === 404) {
          const doc = await aw.databases.createDocument(
            aw.config.databaseId,
            aw.config.projectsCollectionId,
            ID.unique(),
            data
          );
          return doc.$id;
        }
        throw updateErr;
      }
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
  if (!aw || !isValidAppwriteId(id)) return false;

  try {
    await aw.databases.deleteDocument(
      aw.config.databaseId,
      aw.config.projectsCollectionId,
      id
    );
    return true;
  } catch (err: any) {
    if (err?.code === 404 || err?.status === 404) {
      return true;
    }
    console.error('Appwrite delete project error:', err);
    return false;
  }
}

export async function fetchApplicationsFromAppwrite(): Promise<JobApplication[] | null> {
  const aw = getAppwriteClient();
  if (!aw) return null;

  try {
    let allDocuments: any[] = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const res = await aw.databases.listDocuments(
        aw.config.databaseId,
        aw.config.applicationsCollectionId,
        [Query.limit(limit), Query.offset(offset)]
      );

      allDocuments = allDocuments.concat(res.documents);
      if (res.documents.length < limit || allDocuments.length >= res.total) {
        break;
      }
      offset += res.documents.length;
    }

    // Deduplicate by file_path or normalized company + job title
    const seen = new Set<string>();
    const uniqueDocs: any[] = [];

    for (const doc of allDocuments) {
      const fp = (doc.file_path || '').trim().toLowerCase();
      const comp = (doc.company_name || '').trim().toLowerCase();
      const jt = (doc.job_title || '').trim().toLowerCase();
      const key = fp || `${comp}::${jt}`;

      if (!seen.has(key)) {
        seen.add(key);
        uniqueDocs.push(doc);
      }
    }

    return uniqueDocs.map(doc => ({
      id: doc.$id,
      company_name: doc.company_name || '',
      job_title: doc.job_title || '',
      status: doc.status || 'applied',
      applied_date: doc.applied_date || new Date().toISOString().split('T')[0],
      source_portal: doc.source_portal || '',
      summary: doc.summary || '',
      key_skills: Array.isArray(doc.key_skills) ? doc.key_skills : [],
      file_path: doc.file_path || '',
      job_link: doc.job_link || '',
      salary_range: doc.salary_range || '',
      notes: doc.notes || '',
      job_description: doc.job_description || '',
      cover_letter: doc.cover_letter || '',
      matched_project_ids: doc.matched_project_ids || [],
      createdAt: doc.$createdAt,
    }));
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.info(`[Appwrite] Fallback: Koleksi '${aw.config.applicationsCollectionId}' belum tersedia di Cloud (${errorMsg}). Menggunakan Local Storage.`);
    return null;
  }
}

export async function saveApplicationToAppwrite(appItem: JobApplication): Promise<string | null> {
  const aw = getAppwriteClient();
  if (!aw) return null;

  const data: Record<string, any> = {
    company_name: (appItem.company_name || '').slice(0, 255),
    job_title: (appItem.job_title || '').slice(0, 255),
    status: appItem.status || 'applied',
    applied_date: appItem.applied_date || new Date().toISOString().split('T')[0],
    source_portal: (appItem.source_portal || '').slice(0, 255),
    summary: (appItem.summary || '').trim().slice(0, 990),
    key_skills: Array.isArray(appItem.key_skills) ? appItem.key_skills : [],
    file_path: (appItem.file_path || '').trim().slice(0, 500),
    salary_range: (appItem.salary_range || '').trim().slice(0, 255),
    notes: (appItem.notes || '').trim().slice(0, 990),
    job_description: (appItem.job_description || '').trim().slice(0, 990),
    cover_letter: (appItem.cover_letter || '').trim().slice(0, 4900),
  };

  if (appItem.job_link && (appItem.job_link.startsWith('http://') || appItem.job_link.startsWith('https://'))) {
    data.job_link = appItem.job_link.trim().slice(0, 990);
  }

  try {
    if (isValidAppwriteId(appItem.id)) {
      try {
        await aw.databases.updateDocument(
          aw.config.databaseId,
          aw.config.applicationsCollectionId,
          appItem.id,
          data
        );
        return appItem.id;
      } catch (updateErr: any) {
        // Document not found on remote (404), fall back to create
        if (updateErr?.code === 404 || updateErr?.status === 404) {
          const doc = await aw.databases.createDocument(
            aw.config.databaseId,
            aw.config.applicationsCollectionId,
            ID.unique(),
            data
          );
          return doc.$id;
        }
        throw updateErr;
      }
    } else {
      const doc = await aw.databases.createDocument(
        aw.config.databaseId,
        aw.config.applicationsCollectionId,
        ID.unique(),
        data
      );
      return doc.$id;
    }
  } catch (err: any) {
    console.warn('[Appwrite] Save application fallback to local storage:', err?.message || err);
    return null;
  }
}

export async function deleteApplicationFromAppwrite(id: string): Promise<boolean> {
  const aw = getAppwriteClient();
  if (!aw || !isValidAppwriteId(id)) return false;

  try {
    await aw.databases.deleteDocument(
      aw.config.databaseId,
      aw.config.applicationsCollectionId,
      id
    );
    return true;
  } catch (err: any) {
    if (err?.code === 404 || err?.status === 404) {
      return true;
    }
    console.error('Appwrite delete application error:', err);
    return false;
  }
}
