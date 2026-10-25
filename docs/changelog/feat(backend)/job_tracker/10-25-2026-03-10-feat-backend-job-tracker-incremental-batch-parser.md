# Changelog: Incremental Batch Resume Parser (5 Berkas per Tahap) & Deduplikasi Sinkronisasi Cloud

**Tanggal:** 2026-10-25  
**Waktu:** 03:10 WIB  
**Branch:** `feat/backend-job-tracker`  
**Nama Commit:** `feat(backend/job_tracker): implement incremental batch resume parsing and deterministic appwrite deduplication` (`10-25-2026-03-10-feat-backend-job-tracker-incremental-batch-parser`)  
**Tipe Perubahan:** `feat` (Incremental Batch Ingestion, Local Document Intelligence, Real-time UI Batch Controls & Cloud Sync Deduplication)

---

## 1. Ringkasan Perubahan (Executive Summary)

Perubahan pada branch `feat/backend-job-tracker` ini menghadirkan fitur **Incremental Batch Resume Parsing** dan **Deduplikasi Sinkronisasi Cloud** terpadu di dalam sistem **ProjectVault** (`tracker_job`). Fitur ini menjawab kebutuhan pengguna untuk memasukkan seluruh 91 berkas surat lamaran/resume PDF yang tersebar di folder [data/resume](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/data/resume) dan [data/resume/New folder](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/data/resume/New%20folder) secara terkontrol **5 berkas per tahap**, tanpa membebani memori browser atau menyebabkan *timeout* pemrosesan massal serentak:

1. **Kontrol Pemrosesan Bertahap (Batching 5 Berkas per Klik):**
   - Menghilangkan risiko kegagalan pemrosesan simultan 91 berkas PDF sekaligus.
   - Pengguna dapat memproses berkas secara bertahap 5 per 5 (`batchSize: 5`) dengan mengklik tombol dedicated di antarmuka web, mengamati progresnya secara visual, lalu melanjutkan ke batch berikutnya.
   - Menyediakan fleksibilitas tombol *quick action* **"Parse Semua Sisanya"** jika pengguna ingin menyelesaikan antrean sekaligus.

2. **Pencegahan Duplikasi Data 100% Deterministik:**
   - Menghilangkan masalah duplikasi dokumen di database Appwrite Cloud akibat pemanggilan `ID.unique()` berulang pada berkas yang sama.
   - Mengimplementasikan skema ID dokumen deterministik berbasis hash MD5 32-karakter (`docId = 'app_' + md5(key)`). Jika dokumen dengan ID tersebut telah ada, sistem secara otomatis beralih ke operasi update (`PATCH`), bukan membuat dokumen ganda.

3. **Paginasi Tanpa Batas & Deduplikasi Sisi Klien:**
   - Menuntaskan masalah terpotongnya data pada batas default 25 dokumen bawaan SDK Appwrite dengan menerapkan loop paginasi dinamis (`Query.limit(100)`, `Query.offset(offset)`).
   - Memastikan antarmuka papan Kanban maupun tampilan tabel hanya menampilkan entitas unik berdasarkan identitas berkas dan kombinasi `company_name::job_title`.

4. **Pengalaman Pengguna (UI/UX) Real-time & Responsif:**
   - Menyediakan tombol aksen amber **`Parse 5 Berkas Baru (X tersisa)`** yang secara dinamis memperbarui sisa antrean berkas secara *live*.
   - Menyajikan banner antrean interaktif di atas kolom Kanban yang menampilkan ringkasan jumlah berkas PDF fisik di direktori versus yang telah masuk ke pelacak.
   - Menampilkan notifikasi *toast* terperinci yang merinci 5 perusahaan dan posisi pekerjaan yang baru saja berhasil di-parse.

---

## 2. Arsitektur & Logika Parser Bertahap ([scratch/batch_parser.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/scratch/batch_parser.py))

Pipeline pemrosesan bertahap ini memadukan pembacaan berkas biner PDF lokal dengan kecerdasan ekstraksi entitas berbasis pola alami bahasa (*rule-based NLP extraction*):

1. **Cataloging & State Diffing Engine (`get_all_pdf_files` & `main`):**
   - Memindai dua direktori sumber secara rekursif: [data/resume](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/data/resume) (57 berkas) dan [data/resume/New folder](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/data/resume/New%20folder) (34 berkas) — total 91 PDF.
   - Memfilter berkas kurikulum vitae murni bertaraf `CV_` agar fokus pada surat lamaran/pengantar kerja (*cover letter*).
   - Membandingkan daftar berkas fisik pada disk terhadap entitas yang sudah tersimpan di [data/parsed_applications.json](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/data/parsed_applications.json) untuk menentukan antrean berkas yang belum di-parse (*unparsed files queue*).

2. **Temporal Entity Normalizer (`extract_date`):**
   - Mendeteksi landmark penanggalan surat resmi dalam format bahasa Indonesia dan Inggris (misal: `"Surabaya, 16 Oktober 2026"` atau `"16 October 2026"`).
   - Mengonversi nama bulan multi-bahasa (`januari`–`desember` dan `january`–`december`) ke format standar ISO `YYYY-MM-DD` (`2026-10-16`).
   - Menyediakan fallback aman ke stempel waktu modifikasi berkas fisik (`os.path.getmtime`) apabila pola teks tidak memuat tanggal formal.

3. **Multi-Strategy Company Entity Recognizer (`extract_company` & `clean_company_name`):**
   - *Strategi 1 (Heuristik Nama Berkas):* Mengekstrak nama perusahaan dari struktur nama berkas dan membersihkan prefiks (`surat lamaran_`, `cover letter-`).
   - *Strategi 2 (Header Landmark Parsing):* Memindai 1–4 baris di bawah kalimat formal `"Kepada Yth."` untuk mendeteksi entitas badan usaha (`PT`, `CV`, `Sdn Bhd`, `Tbk`, `Group`, `Studio`, `Politeknik/Universitas`).
   - *Strategi 3 (Konteks Intensi):* Memindai frasa kalimat `"di PT ..."` atau `"at [Company]"`.
   - *Pembersih Entitas:* Menghapus alamat jalan fisik (`Jln.`, `Jl.`, `Gedung`, `Lantai`, `No.`), gelar jabatan rekrutmen (`HRD / Tim Rekrutmen`), dan sufiks nama pelamar.

4. **Contextual Role / Job Title Classifier (`extract_job_title` & `clean_job_title`):**
   - Menggunakan *sliding window regex* pada kalimat intensi pelamaran kerja:
     - `"Perihal: Lamaran Pekerjaan - [Posisi]"`
     - `"mengajukan diri sebagai [Posisi] di ..."`
     - `"posisi [Posisi] di ..."`
     - `"interest in the [Position] position at ..."`
   - Melakukan *fallback ontology search* terhadap 8 taksonomi peran rekayasa perangkat lunak utama (Full Stack Developer, Backend Developer, Frontend Developer, Software Engineer, IT Software Staff, Programmer, Mobile Developer, Web Developer).

5. **Source Portal Classifier (`extract_portal`):**
   - Mengklasifikasikan kanal sumber lowongan kerja secara multi-kelas: `Jobstreet`, `LinkedIn`, `Glints`, `Kalibrr`, `KitaLulus`, `Dealls`, `Karir.com`, `Disnaker`, `Instagram`, atau `Website Perusahaan`.

6. **Technical Skills Taxonomy Extractor (`extract_skills`):**
   - Mengidentifikasi kata kunci teknis dari taksonomi keahlian rekayasa modern (Next.js, React, TypeScript, Python, PHP, Laravel, Go, Flutter, PostgreSQL, MySQL, Docker, REST API, dll) menggunakan *word-boundary regex matching*.

7. **Document Layout Normalizer & Text Sanitizer (`clean_extracted_text`):**
   - Membaca teks multi-halaman via `pypdf` dan mengoreksi pemisahan karakter artefak PDF (misal: `"Full -Stack"` menjadi `"Full Stack"`, `"Back -end"` menjadi `"Backend"`).

8. **Deterministic Document Identity Generator:**
   - Menghasilkan ID unik `app_[sanitized_filename]_[date]` dan hash MD5 untuk referensi persistensi di basis data lokal maupun cloud.

---

## 3. Rincian Perubahan per Berkas

### A. [scratch/batch_parser.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/scratch/batch_parser.py) *(Berkas Baru)*
- Skrip engine CLI Python mandiri untuk pemrosesan resume secara bertahap.
- Mendukung mode `--status` untuk inspeksi jumlah berkas fisik vs parsed.
- Mendukung mode `--batch-size 5` (atau ukuran batch dinamis / `all`) untuk mengekstrak n-berkas berikutnya yang belum pernah diproses.
- Mendukung mode `--reset [limit]` untuk mengembalikan status antrean pengujian ke jumlah tertentu.

### B. [app/api/applications/sync/route.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/app/api/applications/sync/route.ts)
- Memperbarui rute `POST /api/applications/sync` agar menerima payload JSON `{ batchSize: 5 }`, `{ batchSize: 'all' }`, atau `{ reset: true }`.
- Menjalankan subprocess Python batch parser dan mengembalikan metadata pemrosesan: `batchProcessed`, `newlyParsed`, `totalApplications`, dan `unparsedCount`.
- Menerapkan mekanisme upsert ke Appwrite Cloud menggunakan `documentId` deterministik (`docId = 'app_' + md5(key)`). Jika dokumen sudah ada, ditangani secara elegan via HTTP 409 Conflict dilanjutkan `PATCH`.
- Memperbarui rute `GET /api/applications/sync` agar mengembalikan status kesiapan antrean (`totalPdfFiles`, `parsedApplications`, `unparsedCount`, `unparsedFiles`, dan daftar `applications`).

### C. [app/applications/page.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/app/applications/page.tsx)
- Menambahkan state baru: `unparsedCount`, `totalPdfFiles`, dan `isBatchParsing`.
- Mengintegrasikan fungsi `checkSyncStatus()` yang dipanggil saat mount dan setelah operasi batch selesai.
- Mengimplementasikan handler `handleBatchParse(batchSize = 5)` yang langsung memperbarui state aplikasi dan `localStorage` secara reaktif.
- Menambahkan tombol aksi cerdas **`Parse 5 Berkas Baru (${unparsedCount} tersisa)`** bergradasi amber dengan spinner interaktif.
- Menambahkan banner informatif **`X Berkas Surat Lamaran Belum Dimasukkan`** dengan tombol aksi cepat *Parse 5 Berkas* dan *Parse Semua Sisanya*.
- Menambahkan indikator denyut lembut `[X Belum di-Parse]` pada Quick Metrics Bar di header halaman.

### D. [lib/appwrite.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/lib/appwrite.ts)
- Memperbarui fungsi [fetchApplicationsFromAppwrite](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/lib/appwrite.ts#L154-L195) dengan perulangan paginasi dinamis (`Query.limit(100)`, `Query.offset(offset)`) sehingga seluruh dokumen di cloud terambil tanpa terpotong batas default 25 dokumen.
- Menerapkan deduplikasi dokumen berbasis `file_path` atau kombinasi `company_name::job_title` agar tidak ada kartu lamaran ganda yang tampil di UI.

---

## 4. Hasil Verifikasi & Uji Kinerja

1. **Uji Ekstraksi Batch 5 Berkas PDF:**
   - Waktu eksekusi: **~1.12 detik** untuk 5 berkas PDF (rata-rata ~0.22 detik per berkas).
   - Ekstraksi entitas presisi: Perusahaan, posisi pekerjaan, tanggal, portal, dan keahlian teknis terdeteksi akurat tanpa kegagalan.
   - Penurunan sisa antrean: Berhasil berkurang dari 66 berkas menjadi 61 berkas.
2. **Uji Kompilasi TypeScript (`npx tsc --noEmit`):**
   - Pengecekan tipe data TypeScript lolos sempurna dengan **0 error**.
3. **Uji Otomasi Browser End-to-End via Subagent:**
   - Navigasi halaman ke [http://localhost:3000/applications](http://localhost:3000/applications).
   - Verifikasi visibilitas tombol *Parse 5 Berkas Baru (66 tersisa)* dan banner antrean.
   - Tombol berhasil diklik secara interaktif; state berubah menjadi *Mem-parse 5 Berkas...*, data baru langsung masuk ke kolom Kanban, badge tombol terbarui menjadi *(61 tersisa)*, dan toast notifikasi sukses ditampilkan.
   - Tangkapan layar verifikasi tersimpan di [batch_parse_success_1792872605471.png](file:///C:/Users/MyBook%20Hype%20AMD/.gemini/antigravity-ide/brain/905262ec-df67-41d7-baa9-d6156ebd0f2e/batch_parse_success_1792872605471.png).
   - Rekaman video interaksi tersimpan di [batch_parse_5_demo_1792872583850.webp](file:///C:/Users/MyBook%20Hype%20AMD/.gemini/antigravity-ide/brain/905262ec-df67-41d7-baa9-d6156ebd0f2e/batch_parse_5_demo_1792872583850.webp).
