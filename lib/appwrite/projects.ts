import { ID, Query } from 'appwrite';
import { Project } from '../types';
import { getAppwriteClient } from './client';
import { isValidAppwriteId } from './validation';

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
