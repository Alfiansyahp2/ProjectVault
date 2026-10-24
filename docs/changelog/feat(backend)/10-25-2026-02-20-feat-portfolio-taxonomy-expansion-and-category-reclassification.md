# Changelog: Portfolio Taxonomy Expansion, Category Reclassification & Multi-Project Ecosystem Sync

**Tanggal:** 2026-10-25  
**Waktu:** 02:20 WIB  
**Branch:** `feat/backend`  
**Nama Commit:** `feat(backend): expand portfolio taxonomy, reclassify categories, and sync 16 projects to appwrite cloud` (`10-25-2026-02-20-feat-portfolio-taxonomy-expansion-and-category-reclassification`)  
**Tipe Perubahan:** `feat` / `refactor` (Data Architecture, Category Taxonomy, Appwrite Cloud Synchronization & UI/UX Filter Enhancement)

---

## 1. Ringkasan Perubahan (Executive Summary)

Perubahan pada *git diff* dan repositori saat ini memperluas arsitektur bank data proyek ([ProjectVault](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/data/project/project.md)) secara masif dari 6 proyek menjadi **16 proyek portofolio kelas dunia**. Seluruh proyek diklasifikasikan ke dalam **5 Kategori Standar**:

1. **`Projek di SEVIMA` (4 Proyek):** Portofolio sistem berskala enterprise di lingkungan ekosistem SEVIMA.
2. **`My Produk` (5 Proyek):** Produk piranti lunak mandiri dan ekosistem komersial (`Joura`, `RevuTap`, `JouraLanding`, `FlowForge`, `MyBookshelf`).
3. **`Freelance` (3 Proyek):** Proyek klien profesional (`Presensi App GPS`, `Pantau Antrian QMS`, `Modern ERP`).
4. **`Research & Thesis` (2 Proyek):** Rekam jejak penelitian, algoritma komputasi keputusan klinis, dan arsitektur AI reasoning (`Agentic AI Scraper`, `HeartChoice DSS AHP`).
5. **`Test` (2 Proyek):** Penilaian kompetensi teknis programmer Middle-Senior (`Properindo Enviro Tech`, `JMC Indonesia`).

Perubahan ini juga menstandarisasi validasi format URL pada backend, menambahkan kategori `Research & Thesis` pada modal input dan pill filter interaktif, serta menyinkronkan 16 dokumen proyek secara real-time ke **Appwrite Cloud** (`6adc680f00067a162336`).

---

## 2. Rincian Perubahan per Berkas

### A. [lib/storage.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/lib/storage.ts)
- **Ekspansi Master Data `INITIAL_PROJECTS`:**
  - Menambah dan menata ulang 16 proyek portofolio dengan atribut lengkap (`id`, `title`, `role`, `category`, `technologies`, `description`, `achievements`, `repo_url`, `demo_url`, `date`, `createdAt`).
  - Mengonfigurasi ulang kategori proyek:
    - Reklasifikasi `Agentic AI University Data Scraper & Pipeline` dari `Projek di SEVIMA` ke `Research & Thesis`.
    - Penambahan `HeartChoice — Clinical Dietary Decision Support System (DSS) using AHP` ke `Research & Thesis`.
    - Penambahan `MyBookshelf — Modern 3D Personal Library Platform` ke `My Produk`.
    - Penambahan `Presensi App — Multi-Tenant GPS & Geofencing Attendance System` ke `Freelance`.
  - **Sanitasi URL Standar:** Mengubah seluruh URL git format SSH (`git@...`) menjadi protokol HTTPS (`https://...`) untuk mematuhi schema validator Appwrite Cloud.

### B. [components/ProjectModal.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/components/ProjectModal.tsx)
- Menambahkan opsi `<option value="Research & Thesis">Research & Thesis</option>` pada elemen `<select>` kategori proyek.
- Menstandarkan 5 kategori pilihan baku (`Projek di SEVIMA`, `My Produk`, `Freelance`, `Research & Thesis`, `Test`, `Lainnya`).

### C. [app/projects/page.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/app/projects/page.tsx)
- **Urutan Baku Tab Filter Kategori (`PREDEFINED_ORDER`):**
  - Mengunci urutan tampilan pill filter di antarmuka web:
    `Semua Kategori (16)` → `Projek di SEVIMA (4)` → `My Produk (5)` → `Freelance (3)` → `Research & Thesis (2)` → `Test (2)`.
- **Palet Warna Badge Tematik (`getCategoryBadge`):**
  - Menambahkan gaya visual *Rose / Pink glow* (`bg-rose-500/15 text-rose-300 border-rose-500/30`) khusus kategori `Research & Thesis`.
  - Pemetaan warna kategori:
    - `Projek di SEVIMA` → Blue
    - `My Produk` → Emerald
    - `Freelance` → Amber
    - `Research & Thesis` → Rose
    - `Test` → Purple

### D. Data Audit Lokal & Peta Proyek
- **[data/project/project.md](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/data/project/project.md):**
  - Diperbarui menjadi peta komprehensif 16 proyek terbagi dalam 5 kategori hierarkis.
- **Folder Audit Baru di `data/project/`:**
  - [data/project/mybookshelf-3d-library/](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/data/project/mybookshelf-3d-library/) (`audit.md`, `project.json`)
  - [data/project/presensi-gps-geofencing/](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/data/project/presensi-gps-geofencing/) (`audit.md`, `project.json`)
  - [data/project/heartchoice-dss-ahp/](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/data/project/heartchoice-dss-ahp/) (`audit.md`, `project.json`)
  - [data/project/agentic-ai-scraper/](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/data/project/agentic-ai-scraper/) (`audit.md`, `project.json` diperbarui ke `Research & Thesis`).
- **[data/all_projects.json](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/data/all_projects.json):**
  - Master dataset JSON terkompilasi berisi seluruh 16 proyek.

---

## 3. Matriks 16 Proyek Portofolio

| No | Nama Proyek | Kategori | Repositori / Sumber |
|:---:|:---|:---:|:---|
| 1 | **SEVIMA Parent-Connect & PPDB** | Projek di SEVIMA | `pocsisbesevima-main` (Go) + `pocsissevima-main` (Next.js) |
| 2 | **SEVIMA Data Glossary** | Projek di SEVIMA | `data-glosarium` (Laravel) |
| 3 | **SEVIMA Karirlink** | Projek di SEVIMA | `karirlink` (Laravel) + `karirlink-saas` (Lumen) + `fe-tracer-study` (Next.js) |
| 4 | **SEVIMA Maukuliah Portal** | Projek di SEVIMA | `maukuliah` (Laravel Livewire & Algolia) |
| 5 | **FlowForge Automation Engine** | My Produk | `flowforge-app` |
| 6 | **Joura Technology Ecosystem** | My Produk | `_code/joura` (Parent Brand Portal) |
| 7 | **RevuTap by Joura** | My Produk | `next_nfc` + `next_nfc_backend` |
| 8 | **JouraLanding Conversion Engine** | My Produk | `_code/product/landing` + `_code/product/cnth` |
| 9 | **MyBookshelf 3D Library** | My Produk | `C:\laragon\www\mybookshelf` |
| 10 | **Presensi App (GPS Geofencing)** | Freelance | `C:\laragon\www\presensi-app` (Flutter + Laravel 10) |
| 11 | **Pantau Antrian (QMS)** | Freelance | `_code/next` |
| 12 | **Modern ERP System** | Freelance | `_code/django/erp_project` |
| 13 | **Agentic AI Scraper & Pipeline** | Research & Thesis | `_code/sevima/tugas/2. scraping/githubcopy2` |
| 14 | **HeartChoice Clinical DSS (AHP)** | Research & Thesis | `C:\laragon\www\heartchoicefnal` |
| 15 | **HR Management System (JMC)** | Test | `_code/test_jmc` |
| 16 | **Sistem Informasi Terpadu (Properindo)** | Test | `_code/test_enviro` |

---

## 4. Hasil Verifikasi & Uji Kinerja

1. **Uji Sinkronisasi Appwrite Cloud:**
   - 16/16 dokumen proyek berhasil tersinkronisasi via REST API ke koleksi `projects` (`6adc680f00067a162336`).
   - Tidak ada kegagalan validasi struktur data atau pengecualian format URL (`200 OK`).
2. **Uji Kompilasi & Build Turbopack (`npm run build`):**
   - Kompilasi `next build` selesai sukses tanpa error:
     - Next.js 16.4.3 Turbopack.
     - Pengecekan TypeScript: 100% valid (0 error).
     - Prerender 8 rute statis: `/`, `/_not-found`, `/analyzer`, `/applications`, `/projects`, `/settings`.
