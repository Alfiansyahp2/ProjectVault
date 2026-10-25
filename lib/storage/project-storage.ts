import { Project } from '@/lib/types';
import { INITIAL_PROJECTS } from '@/data/seeds/projects.seed';
import { STORAGE_KEYS } from './keys';
import {
  getAppwriteConfig,
  fetchProjectsFromAppwrite,
  saveProjectToAppwrite,
  deleteProjectFromAppwrite
} from '@/lib/appwrite';

export async function getProjects(): Promise<Project[]> {
  const config = getAppwriteConfig();
  if (config.isEnabled) {
    const remote = await fetchProjectsFromAppwrite();
    if (remote !== null) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(remote));
      }
      return remote;
    }
  }

  // Local storage fallback
  if (typeof window === 'undefined') return INITIAL_PROJECTS;
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (saved) {
      return JSON.parse(saved);
    } else {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_PROJECTS));
      return INITIAL_PROJECTS;
    }
  } catch (e) {
    console.error('Error reading projects from local storage:', e);
    return INITIAL_PROJECTS;
  }
}

export async function saveProject(project: Project): Promise<Project> {
  const originalId = project.id;
  const updatedProject = {
    ...project,
    id: project.id || `local_proj_${Date.now()}`,
    createdAt: project.createdAt || new Date().toISOString(),
  };

  const config = getAppwriteConfig();
  if (config.isEnabled) {
    const remoteId = await saveProjectToAppwrite(updatedProject);
    if (remoteId) {
      updatedProject.id = remoteId;
    }
  }

  // Always update local storage as reliable local cache
  if (typeof window !== 'undefined') {
    const current = await getProjects();
    const index = current.findIndex(p => p.id === updatedProject.id || (originalId && p.id === originalId));
    if (index >= 0) {
      current[index] = updatedProject;
    } else {
      current.unshift(updatedProject);
    }
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(current));
  }

  return updatedProject;
}

export async function deleteProject(id: string): Promise<void> {
  const config = getAppwriteConfig();
  if (config.isEnabled) {
    await deleteProjectFromAppwrite(id);
  }

  if (typeof window !== 'undefined') {
    const current = await getProjects();
    const filtered = current.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));
  }
}
