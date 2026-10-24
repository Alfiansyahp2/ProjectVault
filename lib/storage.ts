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
    id: 'agentic-ai-scraper',
    title: 'Agentic AI University Data Scraper & Pipeline',
    role: 'AI & Data Engineer / Web Scraping Specialist',
    category: 'Machine Learning / AI & Data Pipeline',
    technologies: ['Python', 'Google Gemini 2.5 Flash', 'Playwright', 'BeautifulSoup4', 'PostgreSQL', 'Pandas', 'JSON Schema Validation', 'Rate Limiting'],
    description: 'Sistem ekstraksi data terdistribusi multi-entitas yang memanfaatkan model LLM (Google Gemini 2.5 Flash) untuk menavigasi struktur situs web universitas di Indonesia secara dinamis tanpa perlu selector HTML/XPath manual. Mengotomatisasi penarikan informasi kampus, program studi, UKT/SPP, jalur pendaftaran, dan prospek kerja ke PostgreSQL serta master Excel.',
    achievements: '• Mengeliminasi kebutuhan hardcoded selector untuk puluhan situs universitas berbeda dengan navigasi cerdas Gemini AI.\n• Mengintegrasikan 6 modul scraper independen ke dalam layer transaksi database PostgreSQL terpusat.\n• Dilengkapi mekanisme state recovery (resume capability) dan proteksi rate-limiting untuk keandalan ekstraksi volume tinggi tanpa blocking.',
    repo_url: 'https://github.com/Alfiansyahp2/Agentic-Ai-Scraper.git',
    demo_url: '',
    date: '2026',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'flowforge-automation-engine',
    title: 'FlowForge — Distributed Workflow Orchestration & DAG Automation Engine',
    role: 'Senior Software Engineer & System Architect',
    category: 'Workflow Orchestration & Distributed Systems',
    technologies: ['Laravel 12', 'PHP 8.3+', 'PostgreSQL', 'Redis', 'React Flow', 'TypeScript', 'Tailwind CSS', 'Laravel Reverb', 'Pest Testing', 'Docker'],
    description: 'Platform orkestrasi alur kerja multi-tenant canggih yang terinspirasi dari Zapier dan n8n. Pengguna dapat mendesain alur otomasi visual berbasis Directed Acyclic Graph (DAG) interaktif, mengeksekusi node pemrosesan paralel asynchronous melalui Redis queue, memantau log real-time via WebSocket Laravel Reverb, dan mengelola alur kerja versi bertingkat.',
    achievements: '• Merancang arsitektur Workflow Engine modular dengan Strategy Pattern dan Dependency Injection untuk eksekusi fleksibel berbagai node.\n• Mengintegrasikan frontend visual canvas interaktif berbasis React Flow dan custom hooks untuk kemudahan manipulasi DAG.\n• Menerapkan monitoring eksekusi real-time berbasis WebSocket dengan Laravel Reverb dan sistem background queue Redis yang tangguh.\n• Menjamin keandalan sistem dengan rangkaian pengujian otomatis end-to-end dan unit testing menggunakan Pest.',
    repo_url: 'https://github.com/Alfiansyahp2/flowforge-app',
    demo_url: '',
    date: '2026',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sevima-data-glossary',
    title: 'SEVIMA Data Glossary — Higher Education Analytics & Standardized Metrics Engine',
    role: 'Data Engineer / Backend Analytics Engineer',
    category: 'Data Engineering / Enterprise Library & BI',
    technologies: ['PHP', 'PostgreSQL', 'Composer Package', 'PHPUnit', 'Design Patterns (Facade, Interface)', 'Higher Ed IKU Analytics', 'Data Governance & Semantics', 'PDDIKTI Neo Feeder Standard'],
    description: 'Pustaka inti (core enterprise library) dan mesin kalkulasi metriks perguruan tinggi untuk standardisasi data analitik lintas produk ekosistem SEVIMA (SIAKAD Cloud, Karirlink, Tracer Study, dan Profeeder). Mengimplementasikan Facade dan Interface untuk menghitung IKU 1-8 Kemendikbud, rasio rasional akademik, dan menyajikan modul analisis interaktif Rapor PT.',
    achievements: '• Merancang arsitektur kamus data (data glossary) terstandarisasi untuk 10+ domain perguruan tinggi.\n• Mengembangkan puluhan query agregasi analitik PostgreSQL teroptimasi untuk menghitung metrik agregat nasional (rerata, min/max, dan tren).\n• Menyediakan modul visualisasi Rapor PT dan interactive playground untuk validasi kepatuhan metriks data kampus.\n• Mengimplementasikan pengujian otomatis berbasis PHPUnit serta dokumentasi integrasi Composer terpadu.',
    repo_url: 'https://gitlab.sevima.com/sevima-platform/data-glosarium',
    demo_url: '',
    date: '2026',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sevima-karirlink',
    title: 'SEVIMA Karirlink — Enterprise Career Center, Alumni Tracer Study & SaaS Platform',
    role: 'Full Stack Software Engineer & SaaS Developer',
    category: 'Full Stack Enterprise Platform & Alumni Analytics',
    technologies: ['Laravel 10', 'Next.js', 'React', 'TypeScript', 'Laravel Lumen', 'PHP 8.2', 'PostgreSQL / MySQL', 'Laravel Passport', 'Tailwind CSS', 'Chart.js', 'Firebase JWT', 'Maatwebsite Excel', 'Snappy PDF', 'Sentry APM', 'Vite'],
    description: 'Ekosistem pusat karir universitas, job portal enterprise, dan analitik tracer study terpadu yang menghubungkan ratusan perguruan tinggi mitra SEVIMA, puluhan ribu mahasiswa lulusan, dan ribuan perusahaan mitra di Indonesia. Terdiri dari Core Backend MVC Laravel 10, Microservice SaaS API Lumen, dan Frontend Modern Next.js TypeScript.',
    achievements: '• Mengintegrasikan 3 modul arsitektur (Core Backend Laravel, SaaS Lumen Microservice, dan Frontend Next.js) ke dalam ekosistem terpadu untuk ratusan kampus.\n• Mengembangkan fitur standardisasi Kode PT pada CMS Perguruan Tinggi (FOX-358) dan pengurutan dinamis kuesioner tracer study (FOX-428) untuk akreditasi BAN-PT.\n• Membangun dashboard analitik visual berbasis Chart.js untuk memantau indikator IKU 1 alumni dengan ekspor laporan eksekutif PDF instan.\n• Menerapkan optimasi ekspor tabular multi-ribu baris menggunakan Maatwebsite Excel, autentikasi stateless JWT, dan monitoring error real-time dengan Sentry.',
    repo_url: 'https://gitlab.sevima.com/karirlink/karirlink',
    demo_url: 'https://karirlink.id',
    date: '2026',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sevima-maukuliah-portal',
    title: 'SEVIMA Maukuliah — Higher Education Discovery Portal & Lead Generation Engine',
    role: 'Full Stack Web Engineer',
    category: 'Enterprise Web Portal & Search Platform',
    technologies: ['Laravel 10', 'Livewire', 'Algolia Scout', 'PostgreSQL / MySQL', 'Tailwind CSS', 'Laravel Sanctum', 'Intervention Image', 'Redis'],
    description: 'Platform pencarian universitas, jurusan, dan pendaftaran kuliah daring terbesar di Indonesia oleh SEVIMA yang melayani jutaan calon mahasiswa dan ratusan kampus mitra. Dilengkapi pencarian cerdas Algolia, interaktivitas real-time Livewire, manajemen prospek pendaftar kampus (lead management), serta dashboard analitik afiliator.',
    achievements: '• Mengembangkan komponen interaktif dinamis Livewire dengan proteksi rate-limiting untuk pengalaman pencarian kampus yang mulus dan aman.\n• Mengoptimalkan manajemen prospek calon mahasiswa (FOX-809) dan modul pelaporan performa affiliasi kampus (FOX-757).\n• Mengintegrasikan full-text search engine Algolia Scout untuk pencarian instan ribuan program studi dan profil universitas seluruh Indonesia.\n• Menerapkan optimasi media dan kompresi gambar dinamis menggunakan Intervention Image untuk performa loading web yang cepat.',
    repo_url: 'https://gitlab.sevima.com/maukuliah/maukuliah',
    demo_url: 'https://maukuliah.id',
    date: '2026',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sevima-parent-connect',
    title: 'SEVIMA Parent-Connect & PPDB — Multi-Tenant School Information System & Foundation Portal',
    role: 'Full Stack Engineer (Golang & Next.js)',
    category: 'Full Stack Enterprise Platform & EdTech Architecture',
    technologies: ['Go (Golang)', 'Next.js 16 (App Router)', 'React 19', 'TypeScript', 'Echo v4', 'Hexagonal Architecture', 'PostgreSQL', 'pgvector', 'Redis', 'Material-UI (MUI v7)', 'Tailwind CSS v4', 'Redux Toolkit', 'TanStack Table v8', 'Docker', 'Edge Middleware (RBAC)'],
    description: 'Ekosistem digital terpadu Sistem Informasi Sekolah (SIS) dan PPDB multi-tenant berskala enterprise untuk yayasan dan lembaga pendidikan di ekosistem SEVIMA. Platform ini mengintegrasikan Backend Go berkinerja tinggi (berarsitektur heksagonal Ports & Adapters) dengan Frontend Modern Next.js 16 (React 19 & Material-UI v7).',
    achievements: '• Mengembangkan platform EdTech full-stack enterprise memadukan Backend Go Hexagonal Architecture dan Frontend Next.js 16 App Router untuk yayasan sekolah.\n• Merancang arsitektur multi-tenancy aman di level database PostgreSQL dan otorisasi RBAC terproteksi di Next.js Edge Middleware untuk 4 persona.\n• Mengimplementasikan 20+ sub-domain modular (PPDB, Akademik, LMS, Rombel, Keuangan, Buku Penghubung) dengan Clean Architecture murni bebas framework.\n• Mengoptimalkan performa transaksi tinggi menggunakan Redis caching, integrasi pgvector untuk pencarian akademik cerdas, dan containerization Docker Compose.',
    repo_url: '',
    demo_url: '',
    date: '2026',
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
