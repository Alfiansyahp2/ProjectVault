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
    id: "sevima-data-glossary",
    title: "SEVIMA Data Glossary \u2014 Higher Education Analytics & Standardized Metrics Engine",
    role: "Data Engineer / Backend Analytics Engineer",
    category: "Projek di SEVIMA",
    technologies: ["PHP", "PostgreSQL", "Composer Package", "PHPUnit", "Design Patterns (Facade, Interface)", "Higher Ed IKU Analytics", "Data Governance & Semantics", "PDDIKTI Neo Feeder Standard"],
    description: "Pustaka inti (core enterprise library) dan mesin kalkulasi metriks perguruan tinggi untuk standardisasi data analitik lintas produk ekosistem SEVIMA (SIAKAD Cloud, Karirlink, Tracer Study, dan Profeeder). Mengimplementasikan pola desain Facade dan Interface untuk menghitung Indikator Kinerja Utama (IKU 1-8 Kemendikbud), rasio rasional akademik, rekapitulasi kepegawaian dosen/tendik, dan menyajikan modul analisis interaktif 'Rapor PT'.",
    achievements: "\u2022 Merancang arsitektur kamus data (data glossary) terstandarisasi untuk 10+ domain perguruan tinggi (Akademik, IKU, Kepegawaian, PMB, MBKM, Tracer Study, Akreditasi).\n\u2022 Mengembangkan puluhan query agregasi analitik PostgreSQL teroptimasi untuk menghitung metrik agregat nasional (jumlah, rerata, min/max, dan tren).\n\u2022 Menyediakan modul visualisasi 'Rapor PT' dan interactive playground untuk validasi kepatuhan metriks data kampus sebelum disajikan ke pimpinan universitas.\n\u2022 Mengimplementasikan pengujian otomatis berbasis PHPUnit serta dokumentasi integrasi Composer terpadu.",
    repo_url: "git@gitlab.sevima.com:sevima-platform/data-glosarium.git",
    demo_url: "",
    date: "2026",
    createdAt: new Date().toISOString(),
  },
  {
    id: "sevima-karirlink",
    title: "SEVIMA Karirlink \u2014 Enterprise Career Center, Alumni Tracer Study & SaaS Platform",
    role: "Full Stack Software Engineer & SaaS Developer",
    category: "Projek di SEVIMA",
    technologies: ["Laravel 10", "Next.js", "React", "TypeScript", "Laravel Lumen", "PHP 8.2", "PostgreSQL / MySQL", "Laravel Passport (OAuth2)", "Tailwind CSS", "Chart.js", "Firebase JWT", "Maatwebsite Excel", "Snappy PDF & jsPDF", "Sentry APM", "Vite"],
    description: "Ekosistem pusat karir universitas, job portal enterprise, dan analitik tracer study terpadu yang menghubungkan ratusan perguruan tinggi mitra SEVIMA, puluhan ribu mahasiswa lulusan, dan ribuan perusahaan mitra di Indonesia. Arsitektur sistem terdiri dari 3 modul terintegrasi: Core Backend MVC (Laravel 10 & Passport OAuth2) untuk manajemen lowongan kerja, CMS perguruan tinggi (sinkronisasi Kode PT Kemendikbud) dan Applicant Tracking System (ATS); Microservice SaaS API (Lumen & JWT) untuk pemrosesan kuesioner skala tinggi dan ekspor data multi-ribu baris; serta Frontend Modern (Next.js & TypeScript) untuk dashboard analitik IKU 1 alumni, visualisasi Chart.js, dan generator laporan akreditasi PDF.",
    achievements: "\u2022 Mengintegrasikan 3 modul arsitektur (Core Backend Laravel, SaaS Lumen Microservice, dan Frontend Next.js) ke dalam ekosistem pelacakan karir terpadu untuk ratusan kampus di Indonesia.\n\u2022 Mengembangkan fitur standardisasi Kode PT pada CMS Perguruan Tinggi (FOX-358) dan pengurutan kronologis kuesioner dinamis (FOX-428) untuk akurasi data pelaporan akreditasi BAN-PT.\n\u2022 Membangun dashboard analitik visual (dashboard.tsx) berbasis Chart.js untuk memantau indikator IKU 1 (keselarasan karir & waktu tunggu kerja lulusan) dengan ekspor laporan eksekutif PDF instan.\n\u2022 Menerapkan optimasi ekspor tabular multi-ribu baris menggunakan Maatwebsite Excel, autentikasi stateless JWT, dan monitoring error real-time dengan Sentry.",
    repo_url: "https://gitlab.sevima.com/karirlink/karirlink",
    demo_url: "https://karirlink.id",
    date: "2026",
    createdAt: new Date().toISOString(),
  },
  {
    id: "sevima-maukuliah-portal",
    title: "SEVIMA Maukuliah \u2014 Higher Education Discovery Portal & Lead Generation Engine",
    role: "Full Stack Web Engineer",
    category: "Projek di SEVIMA",
    technologies: ["Laravel 10", "Livewire", "Algolia Scout", "PostgreSQL / MySQL", "Tailwind CSS", "Laravel Sanctum", "Intervention Image", "Redis"],
    description: "Platform pencarian universitas, jurusan, dan pendaftaran kuliah daring terbesar di Indonesia oleh SEVIMA yang melayani jutaan calon mahasiswa dan ratusan kampus mitra. Dilengkapi pencarian cerdas berbasis Algolia, interaktivitas real-time Livewire dengan rate limiting, sistem manajemen prospek pendaftar kampus (*lead management*), serta dashboard analitik afiliator kampus.",
    achievements: "\u2022 Mengembangkan komponen interaktif dinamis Livewire dengan proteksi rate-limiting untuk pengalaman pencarian kampus yang mulus dan aman dari bot.\n\u2022 Mengoptimalkan manajemen prospek calon mahasiswa (FOX-809) dan modul pelaporan performa affiliasi kampus (FOX-757).\n\u2022 Mengintegrasikan full-text search engine Algolia Scout untuk pencarian instan ribuan program studi dan profil universitas seluruh Indonesia.\n\u2022 Menerapkan optimasi media dan kompresi gambar dinamis menggunakan Intervention Image untuk performa loading web yang cepat.",
    repo_url: "git@gitlab.sevima.com:maukuliah/maukuliah.git",
    demo_url: "https://maukuliah.id",
    date: "2026",
    createdAt: new Date().toISOString(),
  },
  {
    id: "sevima-parent-connect",
    title: "SEVIMA Parent-Connect & PPDB \u2014 Multi-Tenant School Information System & Foundation Portal",
    role: "Full Stack Engineer (Golang & Next.js)",
    category: "Projek di SEVIMA",
    technologies: ["Go (Golang)", "Next.js 16 (App Router)", "React 19", "TypeScript", "Echo v4", "Hexagonal Architecture (Ports & Adapters)", "PostgreSQL", "pgvector", "Redis", "Material-UI (MUI v7)", "Tailwind CSS v4", "Redux Toolkit", "TanStack Table v8", "Docker & Docker Compose", "Edge Middleware (RBAC)"],
    description: "Ekosistem digital terpadu Sistem Informasi Sekolah (SIS) dan Penerimaan Peserta Didik Baru (PPDB) multi-tenant berskala enterprise untuk yayasan dan lembaga pendidikan di ekosistem SEVIMA. Platform ini mengintegrasikan Backend Go berkinerja tinggi (berarsitektur heksagonal Ports & Adapters) dengan Frontend Modern Next.js 16 (React 19 & Material-UI v7). Mencakup isolasi data multi-tenant antar-sekolah di bawah naungan yayasan, alur pendaftaran PPDB siswa baru, manajemen akademik terpusat, portal buku penghubung orang tua real-time, otorisasi RBAC 4 persona di level edge middleware, caching Redis, dan kesiapan pencarian semantik pgvector.",
    achievements: "\u2022 Mengembangkan platform EdTech full-stack enterprise memadukan Backend Go Hexagonal Architecture dan Frontend Next.js 16 App Router untuk yayasan sekolah.\n\u2022 Merancang arsitektur multi-tenancy aman di level database PostgreSQL dan otorisasi RBAC terproteksi di Next.js Edge Middleware untuk 4 persona (Sys-Admin, Tenant, Guru, Orang Tua).\n\u2022 Mengimplementasikan 20+ sub-domain modular (PPDB, Akademik, LMS, Rombel, Keuangan, Buku Penghubung) dengan domain layer murni bebas framework (Clean Architecture).\n\u2022 Mengoptimalkan performa query transaksi tinggi menggunakan Redis caching, integrasi pgvector untuk pencarian data akademik cerdas, dan containerization Docker Compose.",
    repo_url: "",
    demo_url: "",
    date: "2026",
    createdAt: new Date().toISOString(),
  },
  {
    id: "flowforge-automation-engine",
    title: "FlowForge \u2014 Distributed Workflow Orchestration & DAG Automation Engine",
    role: "Senior Software Engineer & System Architect",
    category: "My Produk",
    technologies: ["Laravel 12", "PHP 8.3+", "PostgreSQL", "Redis", "React Flow", "TypeScript", "Tailwind CSS", "Laravel Reverb (WebSockets)", "Pest Testing", "Docker"],
    description: "Platform orkestrasi alur kerja multi-tenant canggih yang terinspirasi dari Zapier, n8n, dan GitHub Actions. Pengguna dapat mendesain alur otomasi visual berbasis Directed Acyclic Graph (DAG) interaktif, mengeksekusi node pemrosesan paralel asynchronous melalui Redis queue, memantau log eksekusi secara real-time via WebSocket Laravel Reverb, dan mengelola alur kerja versi bertingkat dengan isolasi multi-tenant yang ketat.",
    achievements: "\u2022 Merancang arsitektur Workflow Engine modular dengan Strategy Pattern dan Dependency Injection untuk eksekusi fleksibel berbagai tipe node (Trigger, HTTP Request, Transformasi Data, Branching Kondisional).\n\u2022 Mengintegrasikan frontend visual canvas interaktif berbasis React Flow dan custom hooks (useSchedules, useWorkflowRuns) untuk kemudahan manipulasi DAG.\n\u2022 Menerapkan monitoring eksekusi real-time berbasis WebSocket dengan Laravel Reverb dan sistem background queue Redis yang tangguh.\n\u2022 Menjamin keandalan sistem dengan rangkaian pengujian otomatis end-to-end dan unit testing menggunakan framework Pest.",
    repo_url: "https://github.com/Alfiansyahp2/flowforge-app",
    demo_url: "",
    date: "2026",
    createdAt: new Date().toISOString(),
  },
  {
    id: "joura-ecosystem-platform",
    title: "Joura Technology Ecosystem \u2014 Premium Corporate Portal & Interactive Scrollytelling Platform",
    role: "Founder, Lead System Architect & Creative Technologist",
    category: "My Produk",
    technologies: ["Next.js 16 (App Router)", "React 19", "Anime.js 4.5", "GSAP", "Tailwind CSS v4", "Motion", "Appwrite Cloud", "Cloudflare Turnstile", "TypeScript", "3D Perspective Grid"],
    description: "Portal korporat resmi dan platform teknologi induk untuk Joura (joura.id) \u2014 entitas penyedia solusi SaaS, perangkat pintar IoT, dan mesin konversi web modern. Dibangun dengan arsitektur scrollytelling interaktif berkelas dunia yang menampilkan persistent Floating HUD header, Anime.js global scroll scrubber indicator, 3D perspective grid canvas, modal formulir inquiry pemesanan multi-layanan berproteksi Turnstile, dan showcase produk ekosistem terpadu (RevuTap, JouraLanding, JouraResto, dan JouraCard).",
    achievements: "\u2022 Merancang dan membangun platform induk perusahaan teknologi Joura (joura.id) dengan arsitektur scrollytelling interaktif dan 3D perspective grid canvas.\n\u2022 Mengembangkan persistent Floating HUD header dan Anime.js scroll scrubber yang melacak progres gulir pengguna secara mulus tanpa mengunci scroll browser.\n\u2022 Mengintegrasikan ekosistem multi-produk digital dan hardware IoT (RevuTap NFC Google Review, JouraLanding, JouraResto, JouraCard) dalam satu katalog interaktif terpadu.\n\u2022 Menerapkan autentikasi form inquiry pemesanan terproteksi Cloudflare Turnstile dengan persistensi database cloud Appwrite.",
    repo_url: "https://github.com/Alfiansyahp2/joura.id.git",
    demo_url: "https://joura.id",
    date: "2026",
    createdAt: new Date().toISOString(),
  },
  {
    id: "jouralanding-conversion-engine",
    title: "JouraLanding \u2014 High-Performance Sales Conversion Engine & 3D Web Experience",
    role: "Product Lead & Creative Frontend Engineer",
    category: "My Produk",
    technologies: ["Next.js 16.4 (App Router)", "Tailwind CSS v4", "Three.js", "Anime.js 4.5", "Motion", "Zod", "WebGL", "esbuild", "TypeScript", "Direct WhatsApp Funnel"],
    description: "Produk mesin landing page performa tinggi dari ekosistem teknologi Joura (joura.id) yang dirancang khusus sebagai mesin konversi penjualan siap pakai untuk UMKM dan brand digital. Mengatasi masalah website lambat (loading sub-detik dengan PageSpeed 95+), mengintegrasikan alur direct-to-WhatsApp otomatis, pelacakan analitik presisi (Meta Pixel & GA4), serah terima kilat 3 hari kerja, serta dilengkapi modul 3D Creative Lab WebGL canvas berbasis Three.js.",
    achievements: "\u2022 Membangun arsitektur landing page modern berbasis Next.js 16.4 App Router dengan skor PageSpeed 95+ dan waktu muat sub-detik untuk meminimalkan bounce rate iklan digital.\n\u2022 Mengembangkan modul interaktif 3D Creative Lab berbasis Three.js dan Anime.js v4.5 dengan kontrol kamera responsif tanpa mengunci scroll browser.\n\u2022 Mengintegrasikan alur direct-to-WhatsApp sales funnel otomatis dengan parameter pesan dinamis dan tracking analitik Meta Pixel serta Google Analytics 4.\n\u2022 Menyusun dokumentasi arsitektur Clean Docs lengkap mencakup panduan clean architecture, backlog produk berprioritas, dan standar rekayasa rilis.",
    repo_url: "https://github.com/Alfiansyahp2/landing-joura.git",
    demo_url: "https://landing.joura.id",
    date: "2026",
    createdAt: new Date().toISOString(),
  },
  {
    id: "mybookshelf-3d-library",
    title: "MyBookshelf \u2014 Modern 3D Personal Library & Reading Management Platform",
    role: "Creator & Full Stack Web Engineer",
    category: "My Produk",
    technologies: ["Laravel 12", "PHP 8.2", "React 19", "TypeScript", "Tailwind CSS", "Vite", "Zustand", "TanStack Query", "Framer Motion", "Anime.js", "@dnd-kit", "Recharts", "PostgreSQL", "Laravel Sanctum"],
    description: "Platform manajemen perpustakaan pribadi modern dengan visualisasi rak buku 3D interaktif yang hidup. Memungkinkan pengguna mengelola koleksi buku (custom shelves & wishlist), mencatat sesi membaca aktif dengan built-in reading timer, mengelola keuangan dan anggaran belanja buku secara menyeluruh (budget tracking & expense logging), serta kustomisasi visual rak buku fisik (tanaman hias, kucing pixel art, buku beranimasi, efek partikel celestial/meteor 60fps).",
    achievements: "\u2022 Mengembangkan sistem visualisasi 3D Bookshelf interaktif berbasis drag-and-drop (@dnd-kit) dengan rendering tulang buku perspektif realistis dan animasi celestial meteor 60fps.\n\u2022 Membangun modul manajemen keuangan buku (accounting system) terintegrasi untuk melacak budget bulanan, pengeluaran pembelian buku, dan visualisasi grafik Recharts.\n\u2022 Mengimplementasikan Reading Session Timer real-time dengan pelacakan durasi membaca harian, histori buku, serta sistem pencapaian (gamification & achievements).\n\u2022 Merancang arsitektur decoupled modern: Backend RESTful API Laravel 12 (Sanctum Auth) dipadukan dengan Frontend React 19 SPA (Zustand state management, TanStack Query caching, & Tailwind CSS).",
    repo_url: "https://github.com/Alfiansyahp2/mybookshelf",
    demo_url: "",
    date: "2026",
    createdAt: new Date().toISOString(),
  },
  {
    id: "revutap-nfc-guard",
    title: "RevuTap by Joura \u2014 Smart NFC & QR Google Review Booster + Premium Guard",
    role: "Lead Full Stack & Hardware IoT Engineer",
    category: "My Produk",
    technologies: ["Next.js (App Router)", "Prisma ORM", "PostgreSQL", "Appwrite", "Tailwind CSS v4", "GSAP", "Anime.js", "Motion", "html5-qrcode", "Cloudflare Turnstile", "Recharts", "jsPDF", "SheetJS (xlsx)"],
    description: "Produk perangkat pintar (IoT) dan platform SaaS peningkat ulasan Google Maps dari ekosistem teknologi Joura (joura.id) berbasis kartu fisik NFC Tap dan scan QR Code. Dilengkapi fitur Smart Feedback Router (Premium Guard) yang otomatis mengarahkan rating bintang 4-5 ke review publik Google Maps dan rating 1-3 ke form komplain privat internal toko untuk melindungi reputasi bintang 5, showcase 3D Card Deck interaktif, pabrik batch token generator massal (500 token/batch), serta ekspor laporan multi-format Excel, CSV, dan PDF siap cetak.",
    achievements: "\u2022 Mengembangkan platform terintegrasi kartu fisik NFC Tap dan QR Code untuk melipatgandakan ulasan positif Google Maps tanpa instalasi aplikasi pihak ketiga.\n\u2022 Merancang Smart Rating Router (Premium Feedback Guard): rating bintang 4-5 otomatis dialihkan ke ulasan publik Google Maps, sedangkan bintang 1-3 ditampung di panel komplain privat internal untuk melindungi reputasi bintang 5 bisnis.\n\u2022 Membangun visualisasi 3D Card Deck interaktif di dasbor merchant dengan swipe gestures, card dealing animation, dan rotasi perspektif 3D menggunakan CSS 3D/Motion.\n\u2022 Mengembangkan Batch Token Generator otomatis berkapasitas hingga 500 token/batch dengan kredensial penamaan UUID khusus (xxxxxxxx-revu-xxxx-xxxx-xxxxxxxxxxxx) siap cetak pabrik kartu fisik dan ekspor laporan Excel/PDF.",
    repo_url: "https://github.com/Alfiansyahp2/reviewmap-app.git",
    demo_url: "",
    date: "2026",
    createdAt: new Date().toISOString(),
  },
  {
    id: "django-modern-erp",
    title: "Modern ERP System \u2014 Modular Monolith Enterprise Platform",
    role: "Backend & Enterprise System Architect",
    category: "Freelance",
    technologies: ["Python 3.10+", "Django", "Django REST Framework (DRF)", "PostgreSQL", "JWT Authentication (Simple JWT)", "React.js", "Vite", "Ant Design (antd)", "Axios", "RBAC"],
    description: "Sistem Enterprise Resource Planning (ERP) web modern berarsitektur Modular Monolith yang dirancang untuk kebutuhan operasional perusahaan terpadu. Mengintegrasikan backend Python Django REST Framework berkeamanan tinggi dengan frontend interaktif React Vite dan Ant Design. Sistem mencakup modul HR & Payroll, Finance & Accounting (double-entry bookkeeping), Inventory & Warehouse (valuasi FIFO & multi-UOM), Purchasing (alur PR ke PO), Sales & CRM, serta otorisasi Role-Based Access Control (RBAC) 4 persona adaptif.",
    achievements: "\u2022 Merancang arsitektur Modular Monolith tingkat enterprise memisahkan domain modul bisnis (HR & Payroll, Finance, Inventory, Purchasing, Sales) dalam satu repositori terorganisir.\n\u2022 Mengimplementasikan sistem Role-Based Access Control (RBAC) granular dengan 4 persona dinamis (Super Admin, C-Level Executive, HR Manager, dan Employee Self-Service).\n\u2022 Mengintegrasikan autentikasi stateless berbasis token JWT (Simple JWT) dengan verifikasi middleware di frontend React Vite dan hashing password algoritma PBKDF2.\n\u2022 Membangun sistem transaksi terpadu: pergerakan stok multi-UOM dengan valuasi FIFO, pencatatan jurnal akuntansi double-entry, serta alur approval Purchase Request (PR) ke Purchase Order (PO).",
    repo_url: "",
    demo_url: "",
    date: "2026",
    createdAt: new Date().toISOString(),
  },
  {
    id: "pantau-antrian-qms",
    title: "Pantau Antrian \u2014 Real-Time Queue Management System & Multi-Branch Hub",
    role: "Full Stack Engineer & System Architect",
    category: "Freelance",
    technologies: ["Next.js 15 (App Router)", "React 19", "Appwrite", "Tailwind CSS", "Framer Motion", "@hello-pangea/dnd", "jsPDF", "SheetJS (xlsx)", "TypeScript"],
    description: "Platform antrean kendaraan modern berbasis web yang dirancang untuk memvisualisasikan dan mengelola alur operasional bengkel, car wash, dan auto-detailing secara real-time. Memadukan halaman publik pelacakan tanpa login, dasbor kontrol Kanban interaktif Drag-and-Drop dengan alokasi slot fisik mekanik (workstation), serta pusat komando Super Admin multi-cabang lengkap dengan kemampuan impersonasi rahasia (Login As) dan analitik kapasitas cabang.",
    achievements: "\u2022 Merancang dan membangun platform antrean kendaraan multi-tenant real-time untuk bengkel dan car wash dengan isolasi data antar cabang.\n\u2022 Mengembangkan Kanban Board interaktif Drag-and-Drop (@hello-pangea/dnd) untuk alur kerja bengkel (Antrean Masuk, Workshop, Selesai) lengkap dengan penugasan slot fisik mekanik (workstation).\n\u2022 Membangun Pusat Komando Super Admin dengan pemantauan analitik kapasitas cabang, generator slug URL instan, dan otorisasi rahasia Impersonation (Login As) langsung ke cabang.\n\u2022 Menyediakan antarmuka publik responsif bagi pelanggan untuk memantau status pengerjaan secara transparan tanpa perlu instalasi aplikasi atau login.",
    repo_url: "https://github.com/Alfiansyahp2/queue-management-system.git",
    demo_url: "",
    date: "2026",
    createdAt: new Date().toISOString(),
  },
  {
    id: "presensi-gps-geofencing",
    title: "Presensi App \u2014 Multi-Tenant GPS & Geofencing Attendance System",
    role: "Full Stack Mobile & Backend Engineer",
    category: "Freelance",
    technologies: ["Flutter 3.6+", "Dart", "Laravel 10", "PHP 8.1", "MySQL", "OpenStreetMap", "Haversine Formula", "Geolocator", "Laravel Sanctum", "Provider", "Multi-Tenancy"],
    description: "Sistem presensi siswa dan kehadiran sekolah berbasis mobile (Flutter) dan backend API (Laravel 10) yang menggunakan validasi lokasi presisi tinggi melalui GPS dan Geofencing. Siswa hanya dapat melakukan check-in/check-out kehadiran jika berada dalam radius 50 meter dari koordinat gerbang sekolah berdasarkan kalkulasi algoritma Haversine formula. Dilengkapi dengan peta interaktif OpenStreetMap, verifikasi foto kehadiran (selfie), arsitektur multi-tenant multi-sekolah, mode gelap (dark mode), serta riwayat log kehadiran real-time.",
    achievements: "\u2022 Mengimplementasikan validasi kehadiran berbasis GPS Geofencing radius 50 meter menggunakan algoritma Haversine dan visualisasi peta interaktif OpenStreetMap pada Flutter.\n\u2022 Merancang arsitektur multi-tenant berbasis sekolah (schools table, dynamic attendance rules, multi-school isolation) pada Backend RESTful Laravel 10.\n\u2022 Membangun alur presensi 2-button (Check-in/Check-out) dengan verifikasi foto kamera dan penentuan status kehadiran otomatis (Hadir Tepat Waktu, Terlambat, dsb).\n\u2022 Menerapkan arsitektur monorepo terstruktur lengkap dengan dokumentasi teknis komprehensif, autentikasi stateless Sanctum, dan state management Provider.",
    repo_url: "https://github.com/Alfiansyahp2/presensi-app",
    demo_url: "",
    date: "2026",
    createdAt: new Date().toISOString(),
  },
  {
    id: "agentic-ai-scraper",
    title: "Agentic AI University Data Scraper & Pipeline",
    role: "AI & Data Engineer / Web Scraping Specialist",
    category: "Research & Thesis",
    technologies: ["Python", "Google Gemini 2.5 Flash", "Playwright", "BeautifulSoup4", "PostgreSQL", "Pandas", "JSON Schema Validation", "Rate Limiting"],
    description: "Sistem ekstraksi data terdistribusi multi-entitas yang memanfaatkan model LLM (Google Gemini 2.5 Flash) untuk menavigasi struktur situs web universitas di Indonesia secara dinamis tanpa perlu menulis selector HTML/XPath manual untuk setiap situs. Mengotomatisasi penarikan informasi kampus, program studi, biaya kuliah (UKT/SPP), jalur pendaftaran, dan prospek kerja ke database PostgreSQL serta file master Excel.",
    achievements: "\u2022 Mengeliminasi kebutuhan hardcoded selector untuk puluhan situs universitas berbeda dengan navigasi cerdas Gemini AI.\n\u2022 Mengintegrasikan 6 modul scraper independen ke dalam layer transaksi database PostgreSQL terpusat (shared/db.py).\n\u2022 Dilengkapi mekanisme state recovery (resume capability) dan proteksi rate-limiting untuk keandalan ekstraksi data volume tinggi tanpa blocking.",
    repo_url: "https://github.com/Alfiansyahp2/Agentic-Ai-Scraper.git",
    demo_url: "",
    date: "2026",
    createdAt: new Date().toISOString(),
  },
  {
    id: "heartchoice-dss-ahp",
    title: "HeartChoice \u2014 Clinical Dietary Decision Support System (DSS) using AHP & Consistency Ratio",
    role: "Research & Full Stack Developer",
    category: "Research & Thesis",
    technologies: ["Laravel 10", "PHP 8.1", "MySQL", "Analytic Hierarchy Process (AHP)", "Consistency Ratio (CR)", "Pairwise Comparison Matrix", "Vite", "Blade & Tailwind CSS", "Maatwebsite Excel", "Clinical Dietary Nutrition"],
    description: "Sistem Pendukung Keputusan (SPK / Decision Support System) klinis berbasis web untuk rekomendasi pemilihan menu makanan sehat penderita penyakit jantung (kardiovaskular) menggunakan metode Analytic Hierarchy Process (AHP). Menganalisis kriteria nutrisi kritis (Lemak, Natrium, Kalori/Energi, Karbohidrat) dan preferensi waktu makan melalui matriks perbandingan berpasangan. Dilengkapi mesin validasi matematis Consistency Ratio (CR \u2264 0.1) untuk mendeteksi inkonsistensi preferensi pengguna, simulasi bobot interaktif, serta validasi menu rekomendasi oleh ahli gizi klinis.",
    achievements: "\u2022 Mengembangkan engine komputasi AHP lengkap dari kalkulasi pairwise comparison matrix, normalisasi bobot, perkiraan eigenvalue (\u03bb_max), hingga validasi otomatis Consistency Ratio (CR \u2264 0.1).\n\u2022 Merancang sistem pendukung keputusan rekomendasi makanan berdasarkan kriteria klinis (Lemak, Natrium, Kalori, Karbohidrat) yang dikelompokkan berdasarkan waktu makan (pagi, siang, malam).\n\u2022 Membangun modul simulasi AHP interaktif (SimulasiAhpPairwise, SimulasiAhpNormalisasi) untuk memfasilitasi pengujian skenario klinis dan analisis sensitivitas kriteria.\n\u2022 Mengintegrasikan sistem validasi rekomendasi menu bersama ahli gizi medis (ValidasiRekomendasiController), manajemen pantangan makanan (pengecualian makanan), serta ekspor rekapitulasi data.",
    repo_url: "https://github.com/Alfiansyahp2/heartchoice",
    demo_url: "",
    date: "2025",
    createdAt: new Date().toISOString(),
  },
  {
    id: "jmc-hr-system",
    title: "HR Management System \u2014 JMC Technical Test Enterprise Platform",
    role: "Full Stack Engineer (Middle-Senior)",
    category: "Test",
    technologies: ["Node.js", "Express.js (REST API)", "Nuxt.js / Vue.js", "MariaDB / MySQL", "Docker", "JWT Authentication", "PRD / ERD Documentation"],
    description: "Sistem Enterprise Human Resource Management yang dikembangkan untuk penilaian teknis programmer tingkat Middle-Senior di PT JMC Indonesia. Mengadopsi arsitektur multi-tier bersih dengan pemisahan tanggung jawab yang tegas: Core Backend REST API (Node.js & Express), Frontend User Interface modern (Nuxt.js / Vue.js), dan Warehouse Database MariaDB terpusat yang dilengkapi script seeder data uji otomatis, diagram perancangan ERD, serta dokumen spesifikasi kebutuhan produk (PRD).",
    achievements: "\u2022 Merancang arsitektur multi-tier memisahkan backend REST API (Express.js), frontend UI (Nuxt.js/Vue.js), dan warehouse database MariaDB terpusat.\n\u2022 Mengembangkan skema basis data kepegawaian relasional lengkap dengan script migrasi SQL, seeder terstruktur, dan pemodelan relasi ERD komprehensif.\n\u2022 Menyusun dokumentasi arsitektur perangkat lunak lengkap mencakup Product Requirements Document (PRD), ERD diagram, dan panduan konfigurasi deployment.",
    repo_url: "https://github.com/Alfiansyahp2/jmc-technical-test-alfiansyah-pradinata-putra.git",
    demo_url: "",
    date: "2026",
    createdAt: new Date().toISOString(),
  },
  {
    id: "properindo-enviro-portal",
    title: "Sistem Informasi Terpadu \u2014 PT Properindo Enviro Tech (HRIS & Job Monitoring)",
    role: "Full Stack Web Developer",
    category: "Test",
    technologies: ["Next.js 14 (App Router)", "TypeScript", "PostgreSQL 16", "Prisma ORM", "Tailwind CSS", "Recharts", "SheetJS (xlsx)", "Zod", "React Hook Form"],
    description: "Sistem Informasi Terpadu korporat yang memadukan dua subsistem inti: Sistem Informasi Data Karyawan (HRIS) dan Sistem Monitoring Pekerjaan Internal ke dalam satu portal web modern. Dikembangkan dengan Next.js 14 App Router, PostgreSQL 16, dan Prisma ORM. Dilengkapi dashboard analitik distribusi departemen dengan visualisasi grafik Recharts, pencarian instan, pelacak riwayat perubahan data (audit log tracker), mode monitoring ganda (Table View & Kanban Board View), sistem notifikasi pekerjaan mendekati batas waktu (deadline warning), serta ekspor laporan spreadsheet XLSX dan CSV instan.",
    achievements: "\u2022 Mengembangkan portal web enterprise terpadu yang memadukan modul HRIS Karyawan dan Sistem Monitoring Pekerjaan Internal dalam satu dashboard modern.\n\u2022 Merancang skema relasional PostgreSQL dengan Prisma ORM, verifikasi validasi skema bertipe aman (type-safe) via Zod, dan script database seeder otomatis.\n\u2022 Membangun dashboard analitik interaktif berbasis Recharts untuk visualisasi metrik distribusi departemen dan status pengerjaan tugas harian tim.\n\u2022 Menyediakan mode visualisasi ganda (Table View & Kanban Board View) dengan sistem peringatan otomatis untuk pekerjaan mendekati deadline (\u2264 3 hari) dan ekspor laporan tabular multi-format XLSX/CSV.",
    repo_url: "https://github.com/Alfiansyahp2/properindo_enviro_tech_alfiansyah_pradinata_putra.git",
    demo_url: "",
    date: "2026",
    createdAt: new Date().toISOString(),
  },
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
