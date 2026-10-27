# Changelog: Implementasi Modal Interaktif Ekosistem Tech Stack & Ikon Brand pada Dashboard dan Bank Proyek

**Tanggal:** 2026-10-26  
**Waktu:** 16:35 WIB  
**Branch:** `feat/frontend`  
**Nama Commit / Fitur:** `feat(frontend): implement interactive tech stack ecosystem modal with brand svg icons across dashboard and project bank` (`10-26-2026-16-35-feat-frontend-tech-stack-ecosystem-modal-and-icons`)  
**Tipe Perubahan:** `feat` (Interactive Modal Workspace, SVG Brand Tech Icons Renderer, Global & Single-Project Dual View, Dashboard & Project Bank Integration)

---

## 1. Ringkasan Perubahan (Executive Summary)

Pembaruan pada branch `feat/frontend` ini merespons kebutuhan pengguna untuk dapat mengeksplorasi seluruh **Tech Stack, Bahasa Pemrograman, Framework, Database, dan Alat Pengembang** beserta **ikon resminya (brand icons)** dalam format **Modal Interaktif** yang elegan, baik pada halaman **Dashboard** (`/`) maupun pada **Bank Proyek** (`/projects`).

Sebelumnya, teknologi hanya ditampilkan sebagai lencana (*pill*) teks statis tanpa ikon visual, dan tidak ada cara terpusat bagi pengguna untuk:
1. Melihat agregasi seluruh teknologi unik yang tersebar di berbagai portofolio proyek.
2. Memfilter teknologi berdasarkan domain/kategori (Frontend, Backend, Database, Cloud & DevOps, AI/ML, Mobile, Testing).
3. Mengetahui proyek apa saja yang menggunakan teknologi tertentu secara instan.
4. Melihat rincian arsitektur teknologi dari suatu proyek tertentu dalam modal khusus dengan ikon autentik.

Pembaruan ini mengimplementasikan:
- **Komponen Renderer Ikon Pintar ([components/tech-stack/TechIcon.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/components/tech-stack/TechIcon.tsx))**:
  - Menyediakan render SVG berkualitas tinggi dengan warna khas brand (*brand colors*) untuk 60+ teknologi populer (React, Next.js, TypeScript, JavaScript, Python, FastAPI, Django, Go/Golang, PHP, Laravel, Tailwind CSS, PostgreSQL, MySQL, Redis, Docker, Flutter, Three.js, Appwrite, dll.).
  - Mekanisme *fallback* cerdas berbasis taksonomi menggunakan ikon Lucide berkontainer gradien modern.
- **Komponen Modal Dual-Mode ([components/TechStackModal.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/components/TechStackModal.tsx))**:
  - **Mode Ekosistem Global**: Menampilkan seluruh teknologi unik, kolom pencarian *real-time*, filter kategori, kartu teknologi dengan lencana warna, penghitung jumlah proyek terkait, sub-daftar proyek yang dapat diperluas (*expandable*), dan tombol salin seluruh stack untuk CV/LinkedIn.
  - **Mode Spesifik Proyek**: Menampilkan teknologi dari proyek terpilih yang dikelompokkan rapi per kategori dengan tombol beralih cepat ke mode ekosistem global.
- **Integrasi Penuh pada Dashboard ([features/dashboard/](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/dashboard/))**:
  - Tombol aksi `[Ekosistem Tech Stack]` pada [DashboardHeroBanner](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/dashboard/components/DashboardHeroBanner.tsx).
  - Lencana interaktif `[X+ Tech]` dan link `[Modal Ikon]` pada kartu metrik Bank Proyek di [DashboardMetrics](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/dashboard/components/DashboardMetrics.tsx).
  - Tombol `[Eksplor Tech Stack]` di header dan integrasi ikon pada setiap chip proyek di [RecentProjectsCard](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/dashboard/components/RecentProjectsCard.tsx).
- **Integrasi Penuh pada Bank Proyek ([features/projects/](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/projects/))**:
  - Tombol metrik interaktif `[Layers: X+ Tech Stacks (Modal)]` dan tombol CTA `[Tech Stack & Ikon]` pada [ProjectStats](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/projects/components/ProjectStats.tsx).
  - Chip teknologi interaktif dengan ikon pada [ProjectCard](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/projects/components/ProjectCard.tsx) (tampilan grid) dan tombol `+{n} lainnya • Modal`.
  - Chip teknologi interaktif dengan ikon dan tombol `[Buka Modal Stack]` pada [ProjectTableView](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/projects/components/ProjectTableView.tsx) (tampilan tabel).
  - Visualisasi ikon dan tombol `[Buka di Modal Stack]` pada [ProjectDetailModal](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/components/ProjectDetailModal.tsx).

---

## 2. Rincian Modifikasi Komponen & Berkas

### A. Renderer Ikon Teknologi ([components/tech-stack/TechIcon.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/components/tech-stack/TechIcon.tsx))
- Dibuat baru sebagai *single source of truth* untuk identitas visual teknologi.
- **Fungsi `getTechMeta(rawName)`**: Mengklasifikasikan nama teknologi ke dalam 8 kategori (*Frontend, Backend, Database & Cache, DevOps & Cloud, AI & Machine Learning, Mobile, Testing & Tools, Other*) dan mengembalikan warna aksen, warna latar belakang transparan, serta warna border.
- **Dukungan SVG Autentik**:
  - **React**: Simbol atom elips cyan `#61DAFB`.
  - **Next.js**: Monogram N hitam-putih kontras tinggi.
  - **TypeScript / JavaScript**: Kartu badge resmi biru `#3178C6` dan kuning `#F7DF1E`.
  - **Python**: Logo ular ganda biru `#3776AB` dan kuning `#FFD43B`.
  - **Tailwind CSS**: Gelombang kembar cyan `#06B6D4`.
  - **Laravel**: Bentuk isometrik merah `#FF2D20`.
  - **Go (Golang)**: Logo tipografi cyan `#00ADD8`.
  - **PHP**: Oval elips indigo `#777BB4`.
  - **PostgreSQL**: Siluet gajah / simbol basis data biru `#336791`.
  - **Redis**: Lapisan tumpukan merah `#DC382D`.
  - **Docker**: Kontainer paus biru `#2496ED`.
  - **Flutter & Dart**: Sayap origami biru langit `#02569B` dan `#0175C2`.
  - **FastAPI**: Lingkaran petir hijau toska `#009688`.
  - **Three.js / WebGL**: Piramida 3D modern.
  - **Appwrite**: Monogram A merah muda `#FD366E`.
- **Ukuran Fleksibel**: Menyediakan preset ukuran `xs` (12px), `sm` (14px), `md` (18px), `lg` (22px), dan `xl` (28px) serta opsi tanpa bingkai latar belakang (*inline bare icon*).

### B. Modal Interaktif Ekosistem ([components/TechStackModal.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/components/TechStackModal.tsx))
- Dibuat baru menggunakan `createPortal(..., document.body)` dengan level elevasi `z-[110]` dan latar blur gelap (`bg-black/85 backdrop-blur-md`).
- **Mode Dual-View**:
  1. **Mode Seluruh Ekosistem (`viewMode === 'all'`)**:
     - Agregasi dinamis seluruh teknologi unik dari `projects` tanpa duplikasi.
     - Bilah pencarian teks bebas (*fuzzy filter*) untuk mencari nama teknologi atau proyek terkait.
     - Tab filter kategori horizontal (*Semua, Frontend, Backend, Database, Cloud, AI, Mobile, Testing*) lengkap dengan indikator jumlah item.
     - Kartu grid teknologi dengan `TechIcon` ukuran `lg`, lencana kategori berwarna, dan tombol *Lihat Proyek*.
     - Sub-list proyek interaktif saat kartu diperluas (*expanded*), memungkinkan pengguna mengklik proyek untuk langsung membuka detailnya.
     - Tombol *Salin Semua Stack* ke clipboard dengan konfirmasi centang hijau (*Tersalin!*).
  2. **Mode Proyek Spesifik (`viewMode === 'project'`)**:
     - Banner info ringkas proyek (kategori, tanggal, judul, peran pengembang).
     - Pengelompokan teknologi proyek ke dalam section kategori terstruktur.
     - Tombol *Salin Stack* untuk keperluan CV.
     - Tombol *Eksplor Semua Ekosistem* untuk berpindah ke tampilan komprehensif.

### C. Pembaruan Halaman Dashboard ([features/dashboard/](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/dashboard/))
- **[features/dashboard/components/DashboardView.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/dashboard/components/DashboardView.tsx)**:
  - Menambahkan state `isTechModalOpen` dan `selectedProjectForTech`.
  - Menghitung `totalTech` secara dinamis dari seluruh proyek menggunakan `useMemo`.
  - Menambahkan handler `handleOpenTechModal` untuk membuka modal dalam mode global maupun mode proyek.
  - Merender komponen `<TechStackModal>` di root dashboard.
- **[features/dashboard/components/DashboardHeroBanner.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/dashboard/components/DashboardHeroBanner.tsx)**:
  - Menambahkan tombol aksi `[Ekosistem Tech Stack]` berdampingan dengan tombol *Salin Konteks AI*.
- **[features/dashboard/components/DashboardMetrics.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/dashboard/components/DashboardMetrics.tsx)**:
  - Menerima prop `totalTech` dan `onOpenTechStackModal`.
  - Menambahkan badge tombol `[X+ Tech]` di samping angka total portofolio dan link `[Modal Ikon]` di baris footer kartu.
- **[features/dashboard/components/RecentProjectsCard.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/dashboard/components/RecentProjectsCard.tsx)**:
  - Menambahkan tombol `[Eksplor Tech Stack]` pada header kartu.
  - Memasukkan komponen `TechIcon` mini (`size="xs"`) pada setiap tag teknologi proyek.
  - Menjadikan tag teknologi dan lencana `+{n} lainnya` sebagai tombol interaktif untuk membuka modal proyek.
  - Menambahkan tautan tombol `[Modal Tech Stack & Ikon]` pada footer kartu.

### D. Pembaruan Halaman Bank Proyek ([features/projects/](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/projects/))
- **[features/projects/types.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/projects/types.ts)**:
  - Menambahkan properti `onOpenTechModal?: (p: Project) => void` pada interface `ProjectCardProps`, `ProjectGridProps`, dan `ProjectTableViewProps`.
- **[features/projects/components/ProjectStats.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/projects/components/ProjectStats.tsx)**:
  - Mengubah metrik `[Layers: {totalTech}+ Tech Stacks]` menjadi tombol interaktif dengan efek hover dan lencana `Modal`.
  - Menambahkan tombol CTA `[Tech Stack & Ikon]` berikon `Cpu` pada jajaran tombol header atas.
- **[features/projects/components/ProjectCard.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/projects/components/ProjectCard.tsx)**:
  - Mengintegrasikan `TechIcon` pada deretan tag teknologi kartu proyek.
  - Menjadikan tag dan lencana `+{remainingTech} lainnya • Modal` dapat diklik secara independen tanpa memicu pemilihan kartu utama (`e.stopPropagation()`).
- **[features/projects/components/ProjectGrid.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/projects/components/ProjectGrid.tsx)**:
  - Meneruskan prop `onOpenTechModal` ke setiap `ProjectCard`.
- **[features/projects/components/ProjectTableView.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/projects/components/ProjectTableView.tsx)**:
  - Menambahkan `TechIcon` pada kolom teknologi dalam tampilan tabel.
  - Menambahkan tombol `[Buka Modal Stack]` pada setiap baris proyek.
- **[features/projects/components/ProjectsView.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/projects/components/ProjectsView.tsx)**:
  - Mengelola state `isTechModalOpen` dan `selectedProjectForTech`.
  - Menyambungkan callback `onOpenTechModal` ke `ProjectStats`, `ProjectGrid`, `ProjectTableView`, dan `ProjectDetailModal`.
  - Merender `<TechStackModal>` di root halaman bank proyek.
- **[components/ProjectDetailModal.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/components/ProjectDetailModal.tsx)**:
  - Menambahkan prop `onOpenTechModal`.
  - Merender `TechIcon` mini pada setiap tag teknologi di bagian "Teknologi & Tech Stack".
  - Menambahkan tombol aksi `[Buka di Modal Stack]` pada header bagian teknologi.

---

## 3. Rincian Berkas yang Dibuat & Dimodifikasi

| Berkas | Aksi | Ringkasan Modifikasi |
| :--- | :--- | :--- |
| [components/tech-stack/TechIcon.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/components/tech-stack/TechIcon.tsx) | **Baru** | Komponen SVG brand icon renderer untuk 60+ teknologi dengan fallback taksonomi Lucide. |
| [components/TechStackModal.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/components/TechStackModal.tsx) | **Baru** | Modal dual-mode untuk katalog ekosistem teknologi global dan rincian teknologi per-proyek. |
| [features/dashboard/components/DashboardView.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/dashboard/components/DashboardView.tsx) | Edit | State modal, kalkulasi `totalTech`, dan render `TechStackModal`. |
| [features/dashboard/components/DashboardHeroBanner.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/dashboard/components/DashboardHeroBanner.tsx) | Edit | Tombol trigger `[Ekosistem Tech Stack]` pada hero banner. |
| [features/dashboard/components/DashboardMetrics.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/dashboard/components/DashboardMetrics.tsx) | Edit | Badge `[X+ Tech]` dan trigger modal pada metrik Bank Proyek. |
| [features/dashboard/components/RecentProjectsCard.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/dashboard/components/RecentProjectsCard.tsx) | Edit | Tombol header `[Eksplor Tech Stack]`, tag dengan `TechIcon`, dan trigger modal proyek. |
| [features/projects/types.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/projects/types.ts) | Edit | Menambahkan `onOpenTechModal` ke antarmuka props komponen proyek. |
| [features/projects/components/ProjectStats.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/projects/components/ProjectStats.tsx) | Edit | Metrik tombol `Tech Stacks (Modal)` dan tombol CTA `[Tech Stack & Ikon]`. |
| [features/projects/components/ProjectCard.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/projects/components/ProjectCard.tsx) | Edit | Tag teknologi dengan `TechIcon` dan trigger modal `+{n} lainnya • Modal`. |
| [features/projects/components/ProjectGrid.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/projects/components/ProjectGrid.tsx) | Edit | Meneruskan prop `onOpenTechModal` ke `ProjectCard`. |
| [features/projects/components/ProjectTableView.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/projects/components/ProjectTableView.tsx) | Edit | Tag teknologi dengan `TechIcon` dan tombol `[Buka Modal Stack]`. |
| [features/projects/components/ProjectsView.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/projects/components/ProjectsView.tsx) | Edit | State modal, integrasi handler, dan render `TechStackModal`. |
| [components/ProjectDetailModal.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/components/ProjectDetailModal.tsx) | Edit | Render `TechIcon` pada tag teknologi dan tombol `[Buka di Modal Stack]`. |

---

## 4. Hasil Pengujian & Verifikasi

1. **Uji Kompilasi & Build Produksi (`npm run build`)**:
   - Berhasil 100% tanpa error TypeScript maupun lint (`Exit Code: 0`).
   - Rute statis `/`, `/projects`, `/applications`, `/analyzer`, dan `/settings` berhasil digenerasi tanpa kendala.
2. **Uji Fungsionalitas Modal**:
   - Berhasil membuka modal dari berbagai titik masuk:
     - Dashboard Hero Banner (`Ekosistem Tech Stack`).
     - Dashboard Metrics (`[X+ Tech]` & `[Modal Ikon]`).
     - Dashboard Recent Projects (`[Eksplor Tech Stack]` dan chip teknologi).
     - Bank Proyek Header (`Tech Stacks (Modal)` & `[Tech Stack & Ikon]`).
     - Bank Proyek Cards (Chip teknologi & `+{n} lainnya • Modal`).
     - Bank Proyek Table View (`[Buka Modal Stack]`).
     - Modal Detail Proyek (`[Buka di Modal Stack]`).
   - Pencarian real-time (misal: "python") sukses memfilter kartu teknologi yang relevan.
   - Pergantian mode antara "Proyek Ini" dan "Semua Ekosistem" berjalan mulus tanpa reload halaman.
   - Fitur salin ke clipboard berfungsi dengan feedback toast centang hijau.
