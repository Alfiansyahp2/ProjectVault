# Changelog: Resolusi Temuan Kritis Backend (AUD-CRIT-01) — Migrasi Batch Parser Mandiri Terlacak Git & Pengamanan Parameter Eksekusi

**Tanggal:** 2026-10-25  
**Waktu:** 19:57 WIB  
**Branch:** `feat/backend-audit`  
**Nama Commit / Fitur:** `feat(backend/audit): resolve critical audit finding by creating tracked batch parser and hardening cli parameters` (`10-25-2026-19-57-feat-backend-audit-resolve-critical-untracked-parser-dependency`)  
**Tipe Perubahan:** `fix` / `feat` (Audit Remediation, Critical Severity Resolution, Process Isolation, CLI Parameter Hardening)

---

## 1. Ringkasan Perubahan (Executive Summary)

Perubahan ini merupakan langkah pertama dalam pelaksanaan **Rencana Aksi Audit Backend** (*Backend Remediation Roadmap*) pada branch `feat/backend-audit`, yang secara khusus menyelesaikan temuan dengan tingkat keparahan **CRITICAL (`AUD-CRIT-01`)** yang sebelumnya mengancam stabilitas operasional dan deployment sistem:

1. **Eliminasi Ketergantungan Berkas Untracked (`scratch/`):**
   - **Sebelum:** Rute API sinkronisasi lamaran ([app/api/applications/sync/route.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/app/api/applications/sync/route.ts)) mengeksekusi skrip Python pada path `scratch/batch_parser.py`. Mengingat direktori `scratch/` masuk ke dalam [.gitignore](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/.gitignore), berkas ini tidak pernah tersimpan di repositori Git, sehingga setiap *fresh clone*, automated build CI/CD, atau deployment ke server/Vercel/Docker akan langsung mengalami **kegagalan total (HTTP 500)**.
   - **Sesudah:** Dibuat modul Python mandiri resmi dan terlacak penuh oleh Git di [api/batch_parser.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/batch_parser.py), memastikan fungsionalitas batch parsing selalu tersedia di semua lingkungan tanpa bergantung pada folder scratch.

2. **Resolusi Jalur Eksekusi Cerdas dengan Fallback Bersusun:**
   - Handler `POST` dan `GET` pada `/api/applications/sync` diperbarui untuk memprioritaskan skrip resmi `api/batch_parser.py` dan tetap menyediakan fallback anggun (*graceful fallback*) ke `scratch/batch_parser.py` bila berkas lokal lama masih ada.

3. **Pengerasan Parameter CLI (*CLI Parameter Hardening & Sanitization*):**
   - Menghilangkan celah potensi injeksi argumen shell dengan memvalidasi dan mengonversi `batchSize` dan `resetLimit` ke tipe numerik integer positif (`Number.isInteger(rawLimit) && rawLimit > 0`).
   - Melakukan normalisasi pemisah path Windows (`\`) menjadi (`/`) pada string pemanggilan subprocess untuk mencegah *escaping collision*.

4. **Penyempurnaan Pelestarian Data Surat Lamaran (*Full Cover Letter Preservation*):**
   - Menghilangkan pemotongan sepihak draf surat lamaran pada [api/batch_parser.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/batch_parser.py), memastikan teks lengkap surat lamaran (`cover_letter`) tersimpan utuh dan menyertakan `cover_letter_preview` untuk efisiensi transfer data.

---

## 2. Analisis Akar Masalah (Root Cause Analysis) & Solusi Teknis

### A. Diagnosa `AUD-CRIT-01`
Berdasarkan dokumen audit [docs/audit/10-25-2026-19-40-backend-logic-and-architecture-audit.md](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/docs/audit/10-25-2026-19-40-backend-logic-and-architecture-audit.md), konfigurasi `.gitignore` mengecualikan folder `scratch/`:
```gitignore
# Private Documents & User Data
prd.md
data/
/data/
scratch/
```
Sedangkan [app/api/applications/sync/route.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/app/api/applications/sync/route.ts) mengandalkan path tersebut secara statis:
```typescript
const parserScript = path.join(cwd, 'scratch', 'batch_parser.py');
```
Kondisi ini menimbulkan *silent build risk* di mana aplikasi berhasil dikompilasi pada mesin lokal (karena berkas sementara ada di direktori kerja lokal pengembang), tetapi **pasti gagal secara instan saat dirilis ke server produksi**.

### B. Solusi Teknis
1. **Modul Resmi [api/batch_parser.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/batch_parser.py):**
   - Mengintegrasikan mesin ekstraksi teks `pypdf` mandiri yang bebas dari galat *relative import* Python (`ValueError: attempted relative import beyond top-level package`).
   - Menyediakan 3 mode eksekusi CLI:
     - `--status`: Menghitung total berkas PDF pada `data/resume` (91 berkas), jumlah berkas ter-parse, dan daftar antrean yang belum diproses.
     - `--batch-size N`: Memproses $N$ berkas berikutnya secara inkremental (default: 5) dan menambahkannya ke `data/parsed_applications.json`.
     - `--reset N`: Mengatur ulang antrean parsing ke sejumlah $N$ berkas awal yang ditentukan secara aman.

2. **Pembaruan Rute Node.js ([app/api/applications/sync/route.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/app/api/applications/sync/route.ts)):**
   ```typescript
   const trackedScript = path.join(cwd, 'api', 'batch_parser.py');
   const scratchScript = path.join(cwd, 'scratch', 'batch_parser.py');
   const parserScript = fs.existsSync(trackedScript) ? trackedScript : scratchScript;

   const rawBatch = body?.batchSize;
   const isReset = Boolean(body?.reset);
   const rawLimit = Number(body?.resetLimit);
   const resetLimit = Number.isInteger(rawLimit) && rawLimit > 0 ? rawLimit : 25;

   let cmd = `python "${parserScript.replace(/\\/g, '/')}"`;
   ```

---

## 3. Rincian Perubahan per Berkas

### A. [api/batch_parser.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/batch_parser.py) *(Berkas Baru — Tracked by Git)*
- Mengimplementasikan seluruh pipa inferensi dokumen PDF:
  - Normalisasi *spaced kerning* dan pembersihan noise teks.
  - Ekstraksi entitas nama perusahaan (`extract_company`), posisi pekerjaan (`extract_job_title`), tanggal lamaran (`extract_date`), portal sumber (`extract_portal`), serta keahlian teknis kunci (`extract_skills`).
  - Pembuatan ringkasan deskripsi otomatis (*extractive summary*).
  - Pemuatan teks surat lamaran utuh (`cover_letter`).
  - Penanganan parameter CLI `--status`, `--reset`, dan `--batch-size`.

### B. [app/api/applications/sync/route.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/app/api/applications/sync/route.ts)
- Mengubah deklarasi `parserScript` pada metode `POST` dan `GET` agar mendeteksi keberadaan `api/batch_parser.py`.
- Melakukan normalisasi karakter pemisah path direktori menggunakan `.replace(/\\/g, '/')`.
- Menerapkan sanitasi input numerik ketat pada `resetLimit` dan `batchSize`.

---

## 4. Verifikasi & Pengujian Kualitas

1. **Uji Langsung CLI Python:**
   - Menjalankan `python api/batch_parser.py --status`.
   - **Hasil:** Berhasil keluar dengan Exit Code `0` dan mengembalikan JSON status antrean:
     ```json
     {
       "totalFiles": 91,
       "parsedCount": 55,
       "unparsedCount": 36,
       "unparsedFiles": [
         "surat lamaran_cmlabs.pdf",
         "surat lamaran_rata.id.pdf",
         ...
       ]
     }
     ```
2. **Uji Build Kompilasi Next.js & TypeScript:**
   - Menjalankan `npm run build`.
   - **Hasil:** Berhasil mengompilasi seluruh rute aplikasi (`○ /applications`, `ƒ /api/applications/sync`, dll.) tanpa kesalahan tipe TypeScript (*0 errors, Exit Code 0*).
3. **Uji Status Version Control:**
   - Berkas `api/batch_parser.py` dan perubahan [route.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/app/api/applications/sync/route.ts) siap di-commit pada branch `feat/backend-audit`.
