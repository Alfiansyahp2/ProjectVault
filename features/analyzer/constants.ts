import { JobAnalyzerFormData } from './types';

export interface JobPreset {
  id: string;
  label: string;
  badge: string;
  icon: string;
  data: JobAnalyzerFormData;
}

export const SAMPLE_JOB_PRESETS: JobPreset[] = [
  {
    id: 'fullstack-nextjs',
    label: 'Fullstack Next.js & Node',
    badge: 'Populer',
    icon: '⚡',
    data: {
      jobTitle: 'Senior Fullstack Engineer',
      companyName: 'PT Inovasi Digital Nusantara',
      language: 'id',
      tone: 'profesional',
      jobDescription: `PT Inovasi Digital Nusantara sedang mencari Senior Fullstack Engineer berpengalaman untuk memimpin pengembangan platform SaaS berbasis cloud.

Tanggung Jawab:
- Mengembangkan antarmuka web modern, responsif, dan performan menggunakan React, Next.js (App Router), dan TypeScript.
- Membangun RESTful API dan GraphQL service dengan Node.js, Express/NestJS, serta mengelola basis data PostgreSQL.
- Mengimplementasikan state management dan data-fetching efisien (Zustand / TanStack React Query).
- Mengonfigurasi containerization dengan Docker dan pipeline CI/CD di GitHub Actions.
- Memastikan performa tinggi, caching dengan Redis, dan penerapan Clean Architecture serta Automated Testing (Jest/Playwright).

Kualifikasi:
- Minimal 3 tahun pengalaman sebagai Fullstack Developer.
- Menguasai TypeScript, React, Next.js, Node.js, PostgreSQL, dan Docker.
- Pemahaman mendalam tentang arsitektur microservices dan sistem terdistribusi.
- Kemampuan komunikasi yang baik dan pengalaman kerja dalam metodologi Agile/Scrum.`,
    },
  },
  {
    id: 'backend-go-py',
    label: 'Backend Golang & Python',
    badge: 'High Scale',
    icon: '🚀',
    data: {
      jobTitle: 'Backend Systems Engineer',
      companyName: 'Global Fintech Solutions',
      language: 'id',
      tone: 'teknikal',
      jobDescription: `We are seeking a Backend Systems Engineer to architect and scale our real-time transaction processing engine.

Key Responsibilities:
- Design high-throughput, low-latency microservices using Golang (Go) and Python (FastAPI).
- Optimize SQL queries and data schemas across PostgreSQL and Redis caching layers.
- Orchestrate containerized workloads on Kubernetes and AWS / GCP Cloud Run.
- Implement reliable messaging queues with Kafka / RabbitMQ and gRPC communication.
- Enforce strict observability, unit testing, and CI/CD automation.

Requirements:
- Strong command of Go, Python, PostgreSQL, Redis, Docker, and Kubernetes.
- Experience with concurrency, distributed locks, and REST/gRPC API design.
- Solid understanding of TDD and Clean Architecture.`,
    },
  },
  {
    id: 'frontend-react-ui',
    label: 'Frontend React & UI/UX',
    badge: 'Design Eng',
    icon: '🎨',
    data: {
      jobTitle: 'Lead Frontend UI Engineer',
      companyName: 'Creative Tech Studio',
      language: 'id',
      tone: 'antusias',
      jobDescription: `Creative Tech Studio mengundang Frontend UI Engineer yang passionate dalam merancang pengalaman pengguna kelas dunia.

Keahlian yang Dibutuhkan:
- Mahir dalam ekosistem React, TypeScript, Next.js, dan Tailwind CSS.
- Pemahaman mendalam tentang Web Vitals, SEO, aksesibilitas (a11y), dan animasi interaktif (Framer Motion / CSS transitions).
- Pengalaman mengintegrasikan REST API / GraphQL dan mengelola global state.
- Kolaborasi erat dengan tim Product Designer (Figma) untuk membangun Design System yang reusable dan modular.`,
    },
  },
  {
    id: 'ai-data-engineer',
    label: 'AI & Data Specialist',
    badge: 'AI & ML',
    icon: '🤖',
    data: {
      jobTitle: 'AI Solutions & Data Engineer',
      companyName: 'Nusantara AI Labs',
      language: 'id',
      tone: 'profesional',
      jobDescription: `Nusantara AI Labs membuka posisi AI Solutions Engineer untuk membangun aplikasi berbasis LLM dan data pipelines.

Kualifikasi:
- Menguasai Python, PyTorch, Pandas, NumPy, dan Scikit-learn.
- Pengalaman dalam arsitektur RAG (Retrieval-Augmented Generation), LangChain, dan Vector Database.
- Mahir mendeploy API inference dengan FastAPI dan Docker di lingkungan Google Cloud Platform (GCP) / BigQuery.
- Memiliki portfolio proyek AI yang sudah teruji dan terdokumentasi rapi.`,
    },
  },
];

export const TONE_OPTIONS = [
  { value: 'profesional', label: 'Profesional & Berbobot', desc: 'Cocok untuk korporat, BUMN, dan tech enterprise' },
  { value: 'antusias', label: 'Antusias & Berenergi', desc: 'Cocok untuk startup dinamis dan scale-up' },
  { value: 'ringkas', label: 'Ringkas & Padat', desc: 'Scannable dalam 30 detik untuk recruiter sibuk' },
  { value: 'teknikal', label: 'Teknis Mendalam', desc: 'Fokus arsitektur kode dan trade-offs sistem' },
];

export const LANGUAGE_OPTIONS = [
  { value: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
  { value: 'en', label: 'English (US/UK)', flag: '🇺🇸' },
];
