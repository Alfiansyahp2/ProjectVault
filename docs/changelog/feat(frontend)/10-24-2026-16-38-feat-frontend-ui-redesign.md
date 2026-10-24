# Changelog: Frontend UI/UX Redesign & Modern Design System

**Tanggal:** 2026-10-24  
**Waktu:** 16:38 WIB  
**Branch:** `feat/frontend`  
**Nama Commit:** `feat(frontend): redesign dashboard ui with dark glassmorphism and modern typography` (`10-24-2026-16-38-feat-frontend-ui-redesign`)  
**Tipe Perubahan:** `feat` (UI/UX Redesign, Typography & Enterprise Design System)

---

## 1. Ringkasan Perubahan (Executive Summary)

Perubahan pada branch `feat/frontend` ini merombak antarmuka pengguna (*frontend*) aplikasi **ProjectVault** agar memiliki estetika kelas dunia (*world-class enterprise SaaS*) dengan pendekatan **Dark Glassmorphism** dan sistem tipografi modern:

1. **Tipografi Premium Google Font (`Plus Jakarta Sans`):**
   - Mengintegrasikan font Google *Plus Jakarta Sans* langsung via `next/font/google` di [app/layout.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/app/layout.tsx).
   - Menggantikan tampilan font default browser yang kaku menjadi hierarki visual yang tajam, elegan, dan profesional.

2. **Hero Banner & Efek Pencahayaan (*Ambient Glow*):**
   - Mengganti kotak biru solid yang datar dengan kartu kaca berlapis (*layered glassmorphic card*) bergradien `#090d16` & `from-indigo-950/70 via-slate-900/90`.
   - Menambahkan ornamen pencahayaan atmosferik (*ambient radial glow*) dan badge status *"✨ Solusi Anti-Lupa Konteks AI & Vault Portofolio"*.
   - Tombol Call-to-Action (CTA) bergradien cerdas dengan micro-interaksi *hover/active scale*.

3. **Penyempurnaan 4 Kartu Metrik Kunci (Interactive Metric Cards):**
   - Menerapkan efek interaktif *hover lift* (`transform: translateY(-2px)`) dan bayangan dinamis.
   - Menggunakan wadah ikon dengan aksen warna khusus tiap metrik (Indigo untuk Portofolio, Sky untuk Lamaran, Amber untuk Wawancara, Emerald untuk Tawaran Diterima).
   - Menampilkan angka metrik yang lebih tebal dan hierarki teks yang jelas.

4. **Smart Follow-Up Alert Banner:**
   - Mendesain ulang banner pengingat lamaran $\ge 7$ hari dengan aksen *amber glow* transparan, indikator badge jumlah lamaran, dan tombol aksi langsung *"Tinjau & Follow-up →"*.

5. **Katalog Proyek & Lamaran Pekerjaan Terbaru:**
   - **Kutipan Capaian Terukur (*Achievements*):** Ditampilkan dalam badge mandiri dengan latar emerald kontras tinggi (`bg-emerald-500/[0.08] text-emerald-300`) agar hasil metrik terukur langsung menonjol.
   - **Tech Stack Chips:** Tag teknologi diubah menjadi chip modern bernuansa slate gelap.
   - **Avatar Entitas Perusahaan:** Menambahkan avatar inisial perusahaan pada kartu lamaran terbaru.

6. **Harmonisasi Navigasi & Seluruh Modal Interaktif:**
   - `Navbar`: Menghadirkan logo baru bergradien multi-tone, kapsul menu navigasi terpadu, dan status badge dengan *pulsing beacon* aktif untuk Python AI & Appwrite Cloud.
   - `ProjectModal`, `ApplicationModal`, dan `AiPromptModal`: Diseragamkan menggunakan tema dark glassmorphism, input field gelap yang nyaman di mata, dan tombol aksi bergradien.

---

## 2. Rincian Perubahan per Berkas

### A. [app/globals.css](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/app/globals.css)
- Menetapkan skema warna dark mode terpadu (`#090d16` dan font `--font-jakarta`).
- Menambahkan kelas utilitas `.ambient-glow`, `.glass-panel`, dan `.glass-card` lengkap dengan transisi cubic-bezier dan efek hover glow.
- Menambahkan animasi shimmer (`@keyframes shimmer`) serta scrollbar kustom bernuansa minimalis.

### B. [app/layout.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/app/layout.tsx)
- Mengimpor dan mengonfigurasi `Plus_Jakarta_Sans` dari `next/font/google`.
- Menyematkan elemen `<div className="ambient-glow" />` sebagai pencahayaan latar global.
- Memperbarui footer aplikasi dengan informasi stack teknis dan layout responsif yang rapi.

### C. [app/page.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/app/page.tsx)
- Merombak total layout Dashboard utama:
  - Hero banner glassmorphic dengan dua tombol aksi utama.
  - Follow-up alert banner bernuansa amber dinamis.
  - 4 kartu metrik interaktif dengan icon containers dan tipografi tebal.
  - Kolom Bank Proyek Pilihan dan Lamaran Terbaru dengan kartu glassmorphic, highlight capaian terukur, dan quick copy button.

### D. [app/projects/page.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/app/projects/page.tsx)
- Menyelaraskan seluruh tampilan halaman Bank Proyek dengan tema dark glassmorphism.
- Memperbaiki encoding karakter simbol UTF-8 yang sebelumnya rusak (`â€¢` menjadi `•`, `â˜…` menjadi `★`).
- Memperbarui search bar, dropdown kategori, kartu proyek, dan link repository/demo.

### E. [components/Navbar.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/components/Navbar.tsx)
- Mengganti navbar default dengan sticky glassmorphic header (`#090d16/80 backdrop-blur-xl border-b border-white/[0.08]`).
- Memperbaiki logo brand dengan gradien `from-indigo-600 via-indigo-500 to-sky-400` dan teks ProjectVault modern.
- Menambahkan indikator status interaktif dengan lampu ping/beacon untuk deteksi backend Python FastAPI dan koneksi Appwrite Cloud.

### F. [components/ProjectModal.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/components/ProjectModal.tsx)
- Merombak pop-up modal input dan edit proyek menjadi modal dark glassmorphic (`bg-[#0b1220] border-white/[0.12]`).
- Mengoptimalkan form input field, tag selector teknologi dengan tombol hapus instan, dan tombol submit bergradien.

### G. [components/ApplicationModal.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/components/ApplicationModal.tsx)
- Mengonversi modal pencatatan lamaran kerja ke gaya dark glassmorphic yang serasi.
- Memperbarui input data perusahaan, posisi, status dropdown, tanggal pengiriman berkas, ekspektasi gaji, deskripsi loker, dan arsip cover letter.

### H. [components/AiPromptModal.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/components/AiPromptModal.tsx)
- Meng-upgrade modal generator master prompt anti-lupa untuk AI luar.
- Memberikan textarea monospace yang nyaman dibaca, opsi checkbox penyertaan metrik capaian terukur, dan tombol salin 1-klik dengan transisi status tersalin.

---

## 3. Hasil Verifikasi & Uji Build

1. **Uji Kompilasi (`npm run build`):**
   - Kompilasi Turbopack selesai sukses dalam **11.3 detik**.
   - Pemeriksaan TypeScript lolos 100% tanpa error dalam **14.4 detik**.
   - Seluruh 8 rute statis (`/`, `/_not-found`, `/analyzer`, `/applications`, `/projects`, `/settings`) berhasil digenerate sempurna.
2. **Uji Runtime (`npm run dev`):**
   - Berjalan lancar di `http://localhost:3000` tanpa hydration mismatch, CSS warning, maupun console error.
