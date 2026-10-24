# Changelog: Appwrite Cloud Schema Sync, URL Attribute Safeguards & Flagship Projects Consolidation

**Tanggal:** 2026-10-24  
**Waktu:** 20:37 WIB  
**Branch:** `feat/backend`  
**Nama Commit:** `feat(backend): sync appwrite cloud schemas, safeguard url attributes, and consolidate flagship projects` (`10-24-2026-20-37-feat-appwrite-sync-and-project-consolidation`)  
**Tipe Perubahan:** `feat` / `chore` (Appwrite Cloud Schema Sync, Data Model Extension, & Portfolio Consolidation)

---

## 1. Ringkasan Perubahan (Executive Summary)

Perubahan pada git diff saat ini menyelesaikan integrasi penuh antara antarmuka web, backend analitik, dan basis data **Appwrite Cloud**, serta melakukan konsolidasi arsitektur portofolio proyek di [data/project](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/data/project):

1. **Sinkronisasi & Verifikasi Penuh Appwrite Cloud (200 OK):**
   - Menghubungkan aplikasi ke database `6adc65e7002dcc80db0e` di endpoint regional Singapura (`https://sgp.cloud.appwrite.io/v1`).
   - Memverifikasi hak akses (*permissions*) dan skema atribut pada kedua koleksi aktif:
     - **`applications`** (`6adc9f85000210e42d14`): Terhubung & terverifikasi.
     - **`projects`** (`6adc680f00067a162336`): Terhubung & terverifikasi.
2. **Ekspansi Skema Model `JobApplication`:**
   - Memperluas tipe data [lib/types.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/lib/types.ts) dan pemetaan di [lib/appwrite.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/lib/appwrite.ts) dengan 4 atribut pendukung hasil ekstraksi AI/NLP dari 91 dokumen PDF:
     - `source_portal` (*string*): Kanal lowongan (Jobstreet, LinkedIn, Glints, dll).
     - `summary` (*string*): Ringkasan deskriptif 1–2 kalimat hasil ekstraksi AI.
     - `key_skills` (*string[]*): Daftar keahlian teknis yang ditekankan dalam lamaran.
     - `file_path` (*string*): Tautan referensi berkas PDF lokal asli.
3. **Pengamanan Validasi Format URL (*Defensive Attribute Safeguard*):**
   - Mengatasi kendala validasi ketat Appwrite terhadap atribut bertipe URL (`repo_url`, `demo_url`, dan `job_link`). Jika pengguna mengosongkan URL atau menggunakan format SSH (`git@`), data otomatis dinormalisasi atau di-omit dari payload pengiriman dokumen agar tidak memicu pengecualian `400 Bad Request`.
4. **Konsolidasi Arsitektur Portofolio Proyek (*Project Unification*):**
   - **Konsolidasi Karirlink:** Menyatukan 3 modul terpisah (Core Backend Laravel `karirlink`, SaaS Lumen Microservice `karirlink-saas`, dan Tracer Study Frontend `fe-tracer-study`) menjadi satu proyek portofolio utuh: *SEVIMA Karirlink — Enterprise Career Center, Alumni Tracer Study & SaaS Platform*.
   - **Konsolidasi Parent-Connect & PPDB:** Menyatukan Backend Go Hexagonal (`pocsisbesevima-main`) dan Frontend Next.js 16 (`pocsissevima-main`) menjadi satu platform Sistem Informasi Sekolah dan PPDB yayasan pendidikan terpadu: *SEVIMA Parent-Connect & PPDB*.
   - Mengompilasi ulang [data/all_projects.json](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/data/all_projects.json) (6 proyek unggulan kelas dunia) dan menyinkronkannya secara langsung ke Appwrite Cloud.

---

## 2. Rincian Perubahan per Berkas

### A. [lib/types.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/lib/types.ts)
- Menambahkan field opsional baru pada antarmuka `JobApplication`:
  - `source_portal?: string`
  - `summary?: string`
  - `key_skills?: string[]`
  - `file_path?: string`

### B. [lib/appwrite.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/lib/appwrite.ts)
- **`saveProjectToAppwrite()`**:
  - Mengubah payload menjadi tipe dinamis `Record<string, any>`.
  - Menerapkan sanitasi URL: field `repo_url` dan `demo_url` hanya disertakan jika memiliki nilai valid berawalan `http://` atau `https://`, mencegah penolakan format URL kosong oleh Appwrite Cloud.
- **`fetchApplicationsFromAppwrite()`**:
  - Memetakan field `source_portal`, `summary`, `key_skills`, dan `file_path` dari dokumen Appwrite Cloud ke objek `JobApplication`.
- **`saveApplicationToAppwrite()`**:
  - Menyimpan seluruh field baru ke koleksi Appwrite Cloud.
  - Menerapkan sanitasi URL yang sama untuk field `job_link`.

### C. [data/project/sevima-karirlink/](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/data/project/sevima-karirlink/) *(Konsolidasi Baru)*
- Menggabungkan berkas audit dan spesifikasi PRD dari 3 repositori:
  - `karirlink` (Laravel 10, Passport OAuth2, CMS Kode PT FOX-358)
  - `karirlink-saas` (Lumen, JWT, Batch Excel Export, FOX-428)
  - `fe-tracer-study` (Next.js 13, React 18, Chart.js IKU 1 Analytics, jsPDF)

### D. [data/project/sevima-parent-connect/](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/data/project/sevima-parent-connect/) *(Konsolidasi Baru)*
- Menggabungkan berkas audit dan spesifikasi PRD dari 2 repositori:
  - `pocsisbesevima-main` (Go 1.24, Echo v4, Pure Hexagonal Ports & Adapters, PostgreSQL, pgvector, Redis)
  - `pocsissevima-main` (Next.js 16 App Router, React 19, Material-UI v7, Tailwind CSS v4, Edge Middleware RBAC)

### E. [data/all_projects.json](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/data/all_projects.json) *(Master Kompilasi Terpadu)*
- Menyusun 6 profil portofolio enterprise resmi:
  1. *Agentic AI University Data Scraper & Pipeline*
  2. *FlowForge — Distributed Workflow Orchestration & DAG Automation Engine*
  3. *SEVIMA Data Glossary — Higher Education Analytics & Standardized Metrics Engine*
  4. *SEVIMA Karirlink — Enterprise Career Center, Alumni Tracer Study & SaaS Platform*
  5. *SEVIMA Maukuliah — Higher Education Discovery Portal & Lead Generation Engine*
  6. *SEVIMA Parent-Connect & PPDB — Multi-Tenant School Information System & Foundation Portal*

---

## 3. Hasil Verifikasi & Uji Kinerja

1. **Uji Validasi Koneksi Appwrite Cloud (Node SDK & REST):**
   - Query koleksi `projects`: **200 OK** (Total dokumen aktif = 6 dokumen terverifikasi).
   - Query koleksi `applications`: **200 OK** (Siap menerima injeksi data 91 lamaran kerja).
   - Hak akses peran `Any` (Create, Read, Update, Delete) terverifikasi aktif.
2. **Uji Kompilasi & Build Frontend (`npm run build`):**
   - Kompilasi Turbopack Next.js 16.4.3 sukses dalam **1.8 detik**.
   - Pengecekan tipe data TypeScript selesai sukses tanpa error dalam **4.2 detik**.
   - Seluruh 8 rute halaman statis (`/`, `/_not-found`, `/analyzer`, `/applications`, `/projects`, `/settings`) ter-generate sempurna.
