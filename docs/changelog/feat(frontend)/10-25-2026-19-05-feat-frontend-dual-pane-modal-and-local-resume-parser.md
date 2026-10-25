# Changelog: Dual-Pane AI Ingestion Modal, Drag & Drop Local Resume Parser, dan Auto-Fill Form

**Tanggal:** 2026-10-25  
**Waktu:** 19:05 WIB  
**Branch:** `feat/frontend`  
**Nama Commit / Fitur:** `feat(frontend): implement dual-pane modal layout with drag-and-drop resume ingestion, local pdf parsing, and auto-fill form` (`10-25-2026-19-05-feat-frontend-dual-pane-modal-and-local-resume-parser`)  
**Tipe Perubahan:** `feat` (Dual-Pane Modal Layout, Local NLP Resume Ingestion, Drag-and-Drop Ingestion, Responsive Select Card Fix)

---

## 1. Ringkasan Perubahan (Executive Summary)

Pembaruan pada branch `feat/frontend` ini merevolusi alur pencatatan lamaran pekerjaan baru pada antarmuka **ProjectVault** (`/applications`). Sebelumnya, modal penambahan lamaran hanya berupa satu kolom formulir manual konvensional yang mengharuskan pengguna mengetik nama PT, posisi, tanggal, kanal, dan isi surat lamaran satu per satu. 

Kini, modal pencatatan lamaran diubah menjadi **Dual-Pane AI Ingestion Workspace** modern beresolusi tinggi yang terintegrasi langsung dengan mesin pemrosesan teks lokal (*Local Python NLP Engine*):

1. **Tata Letak Dual-Pane Responsif (Sisi Kiri & Sisi Kanan):**
   - **Sisi Kiri (`lg:col-span-7`):** Formulir detail lamaran pekerjaan komprehensif (Nama Perusahaan, Posisi yang Dilamar, Status Lamaran, Tanggal Lamaran, Ekspektasi Gaji, Link Postingan, Catatan Rekruter, dan Teks Deskripsi Lowongan untuk Analisis Semantik AI). Dilengkapi lencana indikator visual *Auto-fill aktif*.
   - **Sisi Kanan (`lg:col-span-5`):** Panel pintar *AI Document Parser & File Ingestion* yang memungkinkan pengguna memasukkan dokumen PDF surat lamaran untuk diekstrak dan diisi otomatis (*auto-fill*) ke formulir di sisi kiri secara instan.

2. **Dukungan Drag & Drop dan File Picker Lokal Komputer:**
   - Menyediakan area *Dropzone* interaktif dengan animasi visual saat berkas diseret (*drag-over*), memungkinkan pengguna menarik berkas PDF apa pun dari komputer langsung ke dalam modal.
   - Pilihan klik untuk membuka file dialog penjelajah berkas sistem operasi (`.pdf`).

3. **Akses Cepat 91 Berkas Surat Lamaran Lokal (`data/resume`):**
   - Mengintegrasikan pemindai otomatis ke direktori arsip resume lokal (`data/resume/` dan subfolder).
   - Menyediakan dropdown interaktif berisi 91 berkas surat lamaran yang siap dipilih dan diekstrak hanya dengan satu klik.

4. **Perbaikan Tata Letak Kartu Berkas Lokal (*Horizontal Overflow Fix*):**
   - **Masalah:** Penempatan dropdown `<select>` berdampingan secara horizontal dengan tombol aksi menyebabkan nama berkas PDF yang panjang mendesak tombol keluar dari batas bingkai modal.
   - **Solusi:** Menerapkan tata letak bertumpuk (*stacked vertical layout*):
     - Dropdown `<select>` dikonfigurasi dengan `w-full max-w-full truncate`, memotong nama berkas panjang dengan elipsis (`...`) rapi.
     - Tombol aksi diletakkan di bawah dropdown dengan lebar penuh bergradien: `⚡ Ekstrak Berkas Ini ke Formulir`.
     - Pemilihan berkas pada dropdown langsung memicu proses ekstraksi secara otomatis (*auto-parse on change*).
     - Kontainer kolom kanan dikunci dengan pembatas `min-w-0 max-w-full overflow-hidden`.

5. **Kartu Pratinjau Entitas & Analisis Keahlian (*Parsed Result Insight Card*):**
   - Hasil ekstraksi teks langsung disajikan dalam kartu analitik berdesain glassmorphic:
     - Nama berkas sumber dengan lencana hijau `Ter-parse`.
     - Ringkasan 4 entitas terdeteksi: **Perusahaan**, **Posisi**, **Tanggal**, dan **Kanal/Portal**.
     - Chip keahlian teknis terdeteksi (*Key Skills*) seperti `Next.js`, `React`, `TypeScript`, `Python`, `PHP`, `Laravel`, `Go`, `PostgreSQL`, `MySQL`, `Redis`, `Git`, dll.

6. **Pemrosesan 100% Mesin Lokal (Zero External API Latency / Data Privacy):**
   - Seluruh ekstraksi teks dan inferensi NLP berjalan pada subsistem Python lokal di mesin pengguna tanpa mengirimkan data atau dokumen pribadi ke layanan pihak ketiga.

---

## 2. Rincian Perubahan per Berkas

### A. [components/ApplicationModal.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/components/ApplicationModal.tsx)
- Mengubah dimensi kartu modal menjadi `max-w-5xl` dengan pembagian grid responsif 12 kolom (`grid-cols-1 lg:grid-cols-12`).
- Menambahkan state manajemen untuk ekstraksi berkas:
  - `localFiles`: Menyimpan daftar berkas resume lokal yang tersedia.
  - `selectedLocalFile`: Berkas yang dipilih pada dropdown.
  - `isParsing` & `isDragging`: Status loading pemrosesan dan interaksi seret-lepas berkas.
  - `parsedResult`: Objek entitas hasil ekstraksi NLP.
  - `parseSuccessMsg` & `parseErrorMsg`: Notifikasi status ekstraksi yang informatif.
- Mengimplementasikan handler `handleLocalFileParse` dan `handleFileUpload` yang memanggil rute API `/api/applications/upload-parse`.
- Menambahkan pemetaan data otomatis (*auto-population*) ke formulir kiri:
  - `companyName` ← `result.company_name`
  - `jobTitle` ← `result.job_title`
  - `appliedDate` ← `result.applied_date`
  - `jobDescription` ← `result.summary` + ringkasan keahlian
  - `notes` ← `"Sumber Lowongan: " + result.source_portal`
  - `coverLetter` ← `result.cover_letter`
- Memperbaiki tata letak dropdown berkas lokal agar menggunakan kelas `w-full max-w-full truncate` dan menempatkan tombol aksi di bawahnya secara penuh untuk mencegah *horizontal clipping*.

### B. [app/api/applications/upload-parse/route.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/app/api/applications/upload-parse/route.ts) *(Berkas Baru)*
- Rute API Next.js Serverless Route Handler (`runtime: nodejs`, `dynamic: force-dynamic`).
- **Metode GET:**
  - Memindai direktori `data/resume` dan `data/resume/New folder`.
  - Mengabaikan berkas non-PDF dan CV umum (`CV_*`), memusatkan data pada berkas surat lamaran spesifik.
  - Mengembalikan daftar terurut berdasarkan nama berkas lengkap dengan ukuran dan path relatif.
- **Metode POST:**
  - Mendukung payload JSON `{ localFilePath }` untuk memproses berkas lokal yang sudah ada di direktori kerja.
  - Mendukung payload `multipart/form-data` untuk memproses berkas baru yang diunggah pengguna via drag-and-drop, menyimpannya sementara di `scratch/uploads/`.
  - Menjalankan skrip Python `api/parse_single.py` melalui `child_process.exec` dan mengembalikan JSON hasil inferensi.

### C. [api/parse_single.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/parse_single.py) *(Berkas Baru)*
- Skrip mandiri Python CLI untuk parsing single dokumen PDF berbasis `pypdf`.
- Didesain bebas dari masalah *relative import* modul (`ValueError: attempted relative import beyond top-level package`).
- Menggabungkan regex heuristik pembersihan teks:
  - Pemulihan *spaced kerning* (contoh: `S e v i m a` → `Sevima`).
  - Pembersihan gelar, sapaan rekruter (`Kepada Yth.`, `HRD/Tim Rekrutmen`), dan alamat fisik kantor dari nama perusahaan.
  - Normalisasi posisi pekerjaan dan pembersihan imbuhan perihal lamaran kerja.
  - Ekstraksi tanggal berkas (mendukung bulan Bahasa Indonesia dan Bahasa Inggris).
  - Klasifikasi portal lowongan kerja berdasarkan tanda tangan kata kunci (Jobstreet, LinkedIn, Glints, Kalibrr, Disnaker, Instagram, dll.).
  - Ekstraksi keahlian teknis (*Tech Keywords Taxonomy*) dan pembuatan ringkasan deskripsi otomatis.
  - Pengembalian teks lengkap surat lamaran (`cover_letter`).

### D. [api/services/nlp_engine.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/services/nlp_engine.py)
- Memperbarui fungsi `parse_pdf_document` agar menyertakan `"cover_letter": cleaned_text.strip()` dalam kamus hasil ekstraksi, memastikan teks surat lamaran tersimpan secara utuh dan siap disalin maupun diarsipkan.

---

## 3. Verifikasi & Pengujian Kualitas

1. **Pengujian CLI Subprocess Python:**
   - Dieksekusi pada berkas `data/resume/New folder/surat lamaran_ADR Group of Companies (PT Selamat Sempurna Tbk.).pdf`.
   - Menghasilkan status kode `0` dan mengembalikan JSON valid berisi nama perusahaan, posisi *Fullstack Web Developer*, tanggal *2026-10-05*, portal *Jobstreet*, 13 keahlian teknis, dan teks lengkap surat lamaran.
2. **Pengujian API Endpoints:**
   - Panggilan `GET /api/applications/upload-parse` berhasil mengembalikan 91 berkas PDF lokal secara lengkap dan terurut.
   - Panggilan `POST /api/applications/upload-parse` sukses mengeksekusi ekstraksi dan mengembalikan data entitas terstruktur.
3. **Pengujian Antarmuka Pengguna & Browser Visual:**
   - Dilakukan verifikasi visual langsung pada peramban web di `http://localhost:3000/applications`.
   - Menguji dropdown berkas berjuluk panjang (`surat lamaran_ADR Group of Companies (PT Selamat Sempurna Tbk.).pdf (14 KB)`).
   - Terbukti tidak ada elemen yang meluber (*zero horizontal overflow*).
   - Formulir di sisi kiri langsung terisi secara otomatis (*auto-filled*) dan kartu pratinjau entitas di sisi kanan tampil dengan tata letak proporsional.
4. **Validasi Kompilasi & TypeScript:**
   - Menjalankan `npm run build` yang sukses 100% tanpa galat kompilasi atau kesalahan tipe TypeScript (*0 errors, code exit 0*).
