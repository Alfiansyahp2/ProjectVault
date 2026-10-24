# Changelog: Bank Proyek & Portofolio UI/UX Redesign & Usability Enhancement

**Tanggal:** 2026-10-24  
**Waktu:** 20:53 WIB  
**Branch:** `feat/frontend`  
**Nama Commit / Fitur:** `feat(frontend): redesign bank proyek portfolio ui/ux with interactive detail modal, grid-list switcher, and structured metrics` (`10-24-2026-20-53-feat-projects-portfolio-ux-redesign`)  
**Tipe Perubahan:** `feat` (UI/UX Usability Enhancement, Responsive Layout & Component Architecture)

---

## 1. Ringkasan Perubahan (Executive Summary)

Pembaruan ini menyelesaikan sejumlah kendala keterbacaan (*readability*) dan kenyamanan penggunaan (*usability*) pada halaman **Bank Proyek & Portofolio** (`/projects`), mengubah tampilan katalog kartu yang sebelumnya padat dan terpotong menjadi antarmuka modern yang nyaman, fleksibel, dan siap pakai untuk kebutuhan kurasi portofolio maupun persiapan wawancara kerja teknis:

1. **Resolusi Judul Proyek Terpotong (*Non-Truncated Responsive Titles*):**
   - **Sebelum:** Judul proyek panjang terpotong menjadi titik-titik (`line-clamp-1`), misalnya: *Agentic AI University Data...*, *FlowForge — Distributed...*, dan *SEVIMA Karirlink — Enterpris...*, sehingga pengguna tidak dapat membaca nama lengkap proyek.
   - **Sesudah:** Judul kini diperbolehkan membungkus secara natural hingga 2 baris (`line-clamp-2`) dengan tipografi tebal responsif (`text-base sm:text-lg font-bold`), jarak baris rapat (`leading-snug`), serta efek transisi warna saat kursor diarahkan (*hover color accent*).

2. **Strukturasi Rapi Poin Capaian & Dampak Terukur (*Structured Metrics & KPI Parsing*):**
   - **Sebelum:** Poin-poin capaian menumpuk dalam satu paragraf teks hijau pekat (*wall of text*) dengan pemisah titik `•` horizontal yang melelahkan mata.
   - **Sesudah:** Teks capaian diparsing secara pintar menjadi *bullet points* individual. Pada kartu ringkasan, ditampilkan 2 poin utama terpenting berikon centang emerald ([`CheckCircle2`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/app/projects/page.tsx)) dan badge ringkas `+X capaian lainnya` yang dapat diakses penuh melalui modal detail.

3. **Tech Stack Chips Proporsional (+X Lainnya):**
   - **Sebelum:** Proyek dengan belasan teknologi (seperti Karirlink dengan 15 tech tags) meluap hingga 4 baris, membuat kartu menjadi sangat tinggi dan tidak simetris.
   - **Sesudah:** Menampilkan 5 teknologi kunci teratas dan mengemas sisanya dalam chip interaktif elegan `+N lainnya`.

4. **Interactive Category Filter Pills Sekali Klik (*Single-Click Category Tabs*):**
   - **Sebelum:** Kategori disaring menggunakan dropdown `<select>` kecil yang kaku.
   - **Sesudah:** Disediakan filter bar dengan pill/tabs horizontal interaktif bertanda jumlah proyek (contoh: `Semua (6)`, `Machine Learning & AI (1)`, `Workflow Orchestration (1)`, dll.). Pengguna dapat berpindah kategori cukup dengan satu klik.

5. **Mode Tampilan Ganda: Grid View vs List / Wide View:**
   - Menambahkan tombol switcher mode tampilan di control bar:
     - **Grid Mode:** Kartu visual modern 3-kolom yang seimbang dan responsif.
     - **List Mode:** Tata letak baris horizontal lebar (komprehensif). Kolom kiri untuk ikhtisar & link, kolom tengah untuk penjabaran lengkap dampak terukur, dan kolom kanan untuk seluruh tech stack & tombol aksi. Sangat nyaman untuk membaca detail arsitektur di layar laptop atau desktop.

6. **Komponen Modal Detail Lengkap ([ProjectDetailModal.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/components/ProjectDetailModal.tsx)):**
   - Pengguna kini dapat mengklik kartu proyek mana pun atau tombol *"Lihat Detail"* untuk membuka modal glassmorphic modern:
     - Judul lengkap tanpa batas potong, peran, tahun, dan badge domain.
     - Tombol cepat **"Salin untuk CV"** yang otomatis memformat nama proyek, peran, tech stack, dan seluruh poin dampak terukur siap tempel ke ATS resume atau prompt AI.
     - Penjabaran arsitektur sistem dan gambaran umum proyek.
     - Seluruh poin dampak terukur disajikan dalam kartu-kartu terpisah beraksen emerald.
     - Seluruh teknologi ditampilkan lengkap.
     - Tombol akses langsung ke Repository GitHub/GitLab dan Live Demo.

7. **Pencarian Cerdas & Feedback Real-Time:**
   - Search bar dilengkapi tombol bersihkan cepat (`X`), counter jumlah hasil pencarian secara *real-time* (*"Menampilkan X dari 6 proyek"*), serta tombol *Reset Semua Filter* ketika hasil kosong.

8. **Sinkronisasi Data Master Default Proyek:**
   - Memperbarui `INITIAL_PROJECTS` pada [lib/storage.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/lib/storage.ts) agar secara baku memuat 6 proyek unggulan hasil audit bank proyek terbaru (Agentic Scraper, FlowForge, Data Glossary, Karirlink, Maukuliah, dan Parent-Connect & PPDB).

---

## 2. Rincian Perubahan per Berkas

### A. [components/ProjectDetailModal.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/components/ProjectDetailModal.tsx) *(Berkas Baru)*
- Dibuat sebagai modal pop-up interaktif berdesain *Dark Glassmorphism*.
- Mengimplementasikan parsing regex pemisah bullet points (`\n|•|\*`).
- Menyediakan fungsionalitas clipboard generator untuk format CV dan AI prompt.
- Dilengkapi tombol aksi terpadu (Kunjungi Repository, Buka Live Demo, Edit Proyek, Hapus Proyek, Salin Format CV).

### B. [app/projects/page.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/app/projects/page.tsx) *(Perombakan Total)*
- Mengintegrasikan modal baru `ProjectDetailModal`.
- Menambahkan baris metrik ringkasan (*Total Proyek*, *Total Tech Stacks*, *Total Capaian Terukur*).
- Menghadirkan tombol switcher tampilan `Grid` ([`LayoutGrid`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/app/projects/page.tsx)) dan `List` ([`List`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/app/projects/page.tsx)).
- Menambahkan tab pill kategori dinamis berdasarkan agregasi data proyek.
- Menyesuaikan batas teks judul dari `line-clamp-1` menjadi `line-clamp-2`.
- Mengimplementasikan helper `parseAchievements` dan `getCategoryBadge` dengan penanganan tipe `string | undefined`.

### C. [lib/storage.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/lib/storage.ts) *(Penyempurnaan Master Data)*
- Mengganti dummy sample data lama dengan 6 proyek unggulan berarsitektur enterprise hasil konsolidasi:
  1. `agentic-ai-scraper`: Agentic AI University Data Scraper & Pipeline
  2. `flowforge-automation-engine`: FlowForge — Distributed Workflow Orchestration & DAG Automation Engine
  3. `sevima-data-glossary`: SEVIMA Data Glossary — Higher Education Analytics & Standardized Metrics Engine
  4. `sevima-karirlink`: SEVIMA Karirlink — Enterprise Career Center, Alumni Tracer Study & SaaS Platform
  5. `sevima-maukuliah-portal`: SEVIMA Maukuliah — Higher Education Discovery Portal & Lead Generation Engine
  6. `sevima-parent-connect`: SEVIMA Parent-Connect & PPDB — Multi-Tenant School Information System & Foundation Portal

---

## 3. Hasil Pengujian & Verifikasi Kualitas

1. **Pengujian Kompilasi Produksi Next.js (`npm run build`):**
   - Pengecekan tipe data TypeScript: **Lulus 100% tanpa error** (`Finished TypeScript in 5.7s`).
   - Kompilasi modul Next.js 16.4.3 Turbopack: **Sukses dalam 2.4s**.
   - Prerender statis rute aplikasi: **8/8 rute berhasil dibuat**, termasuk `/projects`.
2. **Kerapian Layout & Responsivitas:**
   - Kartu pada mode Grid memiliki proporsi tinggi yang seimbang.
   - Mode List berfungsi mulus menampilkan seluruh penjabaran poin capaian tanpa terpotong.
   - Modal detail dapat dibuka dan ditutup dengan animasi fade-in yang halus.
