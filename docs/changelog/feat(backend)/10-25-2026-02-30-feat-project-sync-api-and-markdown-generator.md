# Changelog: Markdown Project Scanner, Autonomous Schema Generator & Cloud Sync API

**Tanggal:** 2026-10-25  
**Waktu:** 02:30 WIB  
**Branch:** `feat/backend`  
**Nama Commit:** `feat(backend): implement project sync api and autonomous markdown schema generator` (`10-25-2026-02-30-feat-project-sync-api-and-markdown-generator`)  
**Tipe Perubahan:** `feat` / `api` (Markdown Parser, Dynamic Local Inspector, Autonomous Schema Generator & Appwrite Sync Endpoint)

---

## 1. Ringkasan Perubahan (Executive Summary)

Perubahan pada git diff saat ini menambahkan mesin otomasi cerdas berbasis API Route di Next.js untuk memindai berkas [project.md](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/data/project/project.md), mengekstrak tautan/direktori proyek baru secara dinamis, menginspeksi metadata kode sumber di disk lokal, menghasilkan skema `project.json` serta `audit.md` secara otonom, dan menyinkronkannya langsung ke basis data **Appwrite Cloud** serta antarmuka web:

1. **Endpoint API Otonom (`/api/projects/sync`):**
   - Mendukung metode `POST` untuk menjalankan *pipeline* parsing, audit otomatis, kompilasi dataset, dan pengiriman dokumen ke cloud.
   - Mendukung metode `GET` untuk memeriksa status keselarasan jumlah proyek di berkas markdown versus berkas JSON terkompilasi (`needsSync`).
2. **Mesin Deteksi & Generator Proyek Baru (*Autonomous Local Code Inspector*):**
   - Jika pengguna menambahkan proyek baru atau tautan folder di `project.md`, sistem secara cerdas memeriksa folder lokal dan mengekstrak:
     - `package.json`: Dependensi web (React, Next.js, Vue, Nuxt, Prisma, Tailwind, Zustand, Framer Motion).
     - `composer.json`: Framework PHP (Laravel 10/12, Lumen, Livewire, Sanctum).
     - `pubspec.yaml`: Aplikasi mobile Flutter & Dart.
     - `requirements.txt`: Engine Python (FastAPI, Django, Gemini AI, Playwright).
     - `.git/config`: URL remote repositori Git otomatis (dengan normalisasi format SSH ke HTTPS).
     - `README.md`: Deskripsi proyek dan poin capaian terukur (*bullet points*).
   - Menghasilkan folder [data/project/<slug>/](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/data/project/) lengkap dengan `project.json` dan `audit.md`.
3. **Penyelarasan Kategori Proyek Eksisting (*Category Synchronizer*):**
   - Mendeteksi jika pengguna memindahkan baris proyek ke seksi kategori lain di `project.md` (misal memindahkan proyek ke `Research & Thesis`), lalu otomatis memperbarui field `category` pada `project.json` dan dokumen audit.
4. **Antarmuka Interaktif Pengguna (*UI Integration*):**
   - Menambahkan tombol aksi utama **"Generate dari project.md"** di header halaman Bank Proyek (`/projects`) berhiaskan ikon `Sparkles` dan animasi loading spinner.
   - Menampilkan banner notifikasi dinamis responsif yang menginformasikan total proyek aktif, jumlah proyek baru yang berhasil di-*generate*, dan jumlah proyek yang diperbarui.
   - Memperbarui daftar card proyek di layar secara instan tanpa memerlukan *refresh* browser.

---

## 2. Rincian Perubahan per Berkas

### A. [app/api/projects/sync/route.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/app/api/projects/sync/route.ts) *(Berkas Baru)*
- **`parseProjectMarkdown(content)`**:
  - Mengurai struktur hierarkis kategori markdown (`Projek di SEVIMA`, `My Produk`, `Freelance`, `Research & Thesis`, `Test`).
  - Mengekstrak judul proyek, target slug, path direktori lokal, dan sub-bullet deskripsi.
- **`inspectLocalDirectory(dirPath)`**:
  - Membaca konfigurasi runtime dan package dependencies secara non-invasif.
  - Menentukan peran teknis (*role*) dan tech stack secara otomatis.
- **`POST Handler`**:
  - Memproses setiap entri proyek dari `project.md`.
  - Membuat `project.json` dan `audit.md` untuk entri baru.
  - Memperbarui kategori pada entri lama jika berbeda.
  - Mengompilasi ulang [data/all_projects.json](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/data/all_projects.json) secara terurut.
  - Menyinkronkan dokumen ke database Appwrite Cloud (`6adc680f00067a162336`).
  - Mengembalikan respon JSON terstruktur berisi statistik eksekusi dan data proyek terbaru.
- **`GET Handler`**:
  - Menyediakan endpoint monitoring liveness dan pengecekan perbedaan sinkronisasi (`needsSync`).

### B. [app/projects/page.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/app/projects/page.tsx)
- **State Baru:**
  - `isSyncing` (*boolean*): Mengendalikan status loading dan penonaktifan tombol saat proses berjalan.
  - `syncNotification` (*object*): Menampung pesan sukses/gagal, rincian jumlah proyek baru, dan status perbaikan.
- **Handler `handleSyncFromMd()`**:
  - Mengirim request `POST /api/projects/sync`.
  - Menginjeksi data proyek terbaru ke state `projects` secara instan.
- **Elemen UI:**
  - Menambahkan tombol `Generate dari project.md` pada jajaran tombol aksi (CTA) atas.
  - Menambahkan banner alert notifikasi dengan tombol dismiss (`X`) dan animasi transisi halus (*fade-in / slide-in*).

---

## 3. Hasil Verifikasi & Uji Fungsional

1. **Uji Endpoint API (`GET /api/projects/sync`):**
   - Output: `{"status":"ready","projectMdExists":true,"projectsInMarkdown":16,"projectsCompiled":16,"needsSync":false}` (`200 OK`).
2. **Uji Eksekusi Sinkronisasi (`POST /api/projects/sync`):**
   - Output: `Success: True, Total: 16, Categories: {'Projek di SEVIMA': 4, 'My Produk': 5, 'Freelance': 3, 'Research & Thesis': 2, 'Test': 2}` (`200 OK`).
   - Berhasil menyinkronkan data langsung ke Appwrite Cloud tanpa error skema.
3. **Uji Kompilasi Turbopack (`npm run build`):**
   - Rute dinamis `ƒ /api/projects/sync` berhasil terdaftar dan terkompilasi sempurna bersama 8 halaman statis lainnya.
   - Pengecekan tipe data TypeScript: **0 Error**.
