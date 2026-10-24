import { Project, JobApplication, UserProfile } from './types';
import {
  getAppwriteConfig,
  fetchProjectsFromAppwrite,
  saveProjectToAppwrite,
  deleteProjectFromAppwrite,
  fetchApplicationsFromAppwrite,
  saveApplicationToAppwrite,
  deleteApplicationFromAppwrite
} from './appwrite';

const STORAGE_KEYS = {
  PROJECTS: 'tracker_projects_data',
  APPLICATIONS: 'tracker_applications_data',
  PROFILE: 'tracker_user_profile',
};

// Realistic initial sample data to make first load engaging
const INITIAL_PROJECTS: Project[] = [
  {
    id: 'sample_proj_1',
    title: 'E-Commerce Management Dashboard',
    role: 'Fullstack Developer',
    category: 'Web Application',
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Prisma'],
    description: 'Aplikasi manajemen inventaris dan analitik penjualan real-time dengan visualisasi data interaktif.',
    achievements: 'Meningkatkan efisiensi pelacakan stok sebesar 35% dan memproses lebih dari 10.000 transaksi bulanan.',
    repo_url: 'https://github.com/example/ecommerce-dashboard',
    demo_url: 'https://ecommerce-demo.vercel.app',
    date: '2024',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample_proj_2',
    title: 'Automated Job & Project Tracker with AI Analysis',
    role: 'Fullstack & AI Engineer',
    category: 'Fullstack & Machine Learning',
    technologies: ['Next.js', 'Python', 'FastAPI', 'Appwrite', 'Tailwind CSS', 'Vercel'],
    description: 'Sistem cerdas pelacak lamaran kerja, bank portofolio proyek, dan pencocokan syarat lowongan berbasis semantic keyword.',
    achievements: 'Mengotomatisasi 90% waktu pembuatan draf surat lamaran terarah dan mencegah lupa riwayat proyek.',
    repo_url: 'https://github.com/example/tracker_job',
    demo_url: 'https://tracker-job.vercel.app',
    date: '2025',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample_proj_3',
    title: 'Customer Churn Prediction Pipeline',
    role: 'Data Analyst / ML Engineer',
    category: 'Data Science',
    technologies: ['Python', 'Pandas', 'Scikit-Learn', 'FastAPI', 'Docker'],
    description: 'Pipeline data dan model machine learning untuk memprediksi pelanggan berisiko berhenti berlangganan pada layanan SaaS.',
    achievements: 'Mencapai akurasi model 88% dan membantu tim retensi mempertahankan 15% klien aktif.',
    repo_url: 'https://github.com/example/churn-ml',
    date: '2024',
    createdAt: new Date().toISOString(),
  }
];

const INITIAL_APPLICATIONS: JobApplication[] = [
  {
    id: 'sample_app_1',
    company_name: 'Tech Nusantara Inovasi',
    job_title: 'Fullstack Web Developer',
    status: 'interview',
    applied_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    job_link: 'https://linkedin.com/jobs/view/123456',
    salary_range: 'Rp 10.000.000 - Rp 14.000.000',
    notes: 'Sudah lolos screening CV, jadwal technical interview hari Rabu jam 14:00.',
    job_description: 'Mencari Fullstack Developer dengan keahlian Next.js, TypeScript, Tailwind, dan integrasi REST API backend Python/Node.js.',
    cover_letter: 'Surat lamaran telah dikirim dengan melampirkan portofolio E-Commerce Dashboard.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample_app_2',
    company_name: 'Solusi Data Cerdas',
    job_title: 'Software & Data Engineer',
    status: 'applied',
    applied_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    job_link: 'https://jobstreet.co.id/job/789012',
    salary_range: 'Rp 12.000.000 - Rp 16.000.000',
    notes: 'Sudah 8 hari tanpa kabar, perlu di-follow up lewat email rekruter.',
    job_description: 'Membangun pipeline data, integrasi API dengan FastAPI, dan dashboard web interaktif.',
    createdAt: new Date().toISOString(),
  }
];

const DEFAULT_PROFILE: UserProfile = {
  name: 'Kandidat Profesional',
  headline: 'Fullstack & Software Engineer',
  bio: 'Spesialis dalam pengembangan aplikasi web modern (Next.js/React), backend Python, dan solusi otomasi data.',
};

// Profile operations
export function getUserProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_PROFILE;
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }
}

// Projects operations
export async function getProjects(): Promise<Project[]> {
  const config = getAppwriteConfig();
  if (config.isEnabled) {
    const remote = await fetchProjectsFromAppwrite();
    if (remote && remote.length > 0) return remote;
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
    console.error(e);
    return INITIAL_PROJECTS;
  }
}

export async function saveProject(project: Project): Promise<Project> {
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
    const index = current.findIndex(p => p.id === updatedProject.id);
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

// Applications operations
export async function getApplications(): Promise<JobApplication[]> {
  const config = getAppwriteConfig();
  if (config.isEnabled) {
    const remote = await fetchApplicationsFromAppwrite();
    if (remote && remote.length > 0) return remote;
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
    console.error(e);
    return INITIAL_APPLICATIONS;
  }
}

export async function saveApplication(appItem: JobApplication): Promise<JobApplication> {
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
    const index = current.findIndex(a => a.id === updatedApp.id);
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

// Backup & Export JSON
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
    console.error('Import failed', e);
    return false;
  }
}
