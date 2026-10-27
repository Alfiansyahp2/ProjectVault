# Changelog: Penyelesaian AppwriteException Batas Karakter Skema "job_description" (Max 1000 Karakter)

**Tanggal:** 2026-10-26  
**Waktu:** 06:35 WIB  
**Branch:** `feat/backend-ai-analysis`  
**Nama Commit:** `fix(appwrite): resolve job_description schema limit exception and normalize local application IDs` (`10-26-2026-06-35-fix-appwrite-job-description-schema-limit`)  
**Tipe Perubahan:** `fix` (Appwrite Cloud Schema Conformance & Safe Local Storage Data Integrity)

---

## 1. Akar Masalah (Root Cause Analysis)

Saat pengguna menekan tombol **"Simpan ke Pelacak"** di halaman `/analyzer` setelah menganalisis lowongan kerja, muncul pesan galat di konsol peramban:

```text
Console AppwriteException: Invalid document structure: Attribute "job_description" has invalid type. Value must be a valid string and no longer than 1000 chars
```

### Penyebab Teknis:
1. **Batasan Skema Kolom Appwrite Cloud**:
   - Pada koleksi `applications` di Appwrite Cloud, atribut `job_description` dikonfigurasi dengan panjang maksimum sebesar **1000 karakter**.
   - Sebelumnya pada [lib/appwrite.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/lib/appwrite.ts), pemotongan string diatur ke `slice(0, 5000)`.
   - Ketika teks deskripsi lowongan kerja yang dianalisis memiliki panjang lebih dari 1000 karakter (misal ~1.015 hingga 2.500 karakter), muatan (*payload*) yang dikirimkan ke REST API Appwrite melanggar batas skema dokumen, sehingga server Appwrite Cloud mengembalikan *400 Bad Request*.

2. **Perilaku Prefiks ID Lokal**:
   - Pada [features/analyzer/components/AnalyzerView.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/analyzer/components/AnalyzerView.tsx), ID entitas baru sebelumnya dibuat menggunakan prefiks `app_${Date.now()}`.
   - Pengecekan `isValidAppwriteId()` menganggap ID tersebut valid sebagai UID Appwrite, sehingga sistem melakukan percobaan `updateDocument` terlebih dahulu yang menghasilkan respons 404 sebelum mencoba membuat dokumen baru.

---

## 2. Solusi & Perubahan Implementasi

### A. Sanitasi Payload Batas Skema Appwrite ([lib/appwrite.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/lib/appwrite.ts))
* Mengamankan seluruh atribut teks yang dikirim ke Appwrite Cloud agar mematuhi batasan skema koleksi:
  * `job_description`: dipotong secara aman menggunakan `(appItem.job_description || '').trim().slice(0, 990)`.
  * `notes`: dipotong secara aman menggunakan `(appItem.notes || '').trim().slice(0, 990)`.
  * `summary`: dipotong secara aman menggunakan `(appItem.summary || '').trim().slice(0, 990)`.
  * `job_link`: dipotong secara aman menggunakan `(appItem.job_link || '').trim().slice(0, 990)`.
  * `cover_letter`: tetap dipotong pada batas maksimum 4900 karakter (di bawah batas 5000).
* Mengubah penanganan *catch* pada pemanggilan database Appwrite menjadi `console.warn('[Appwrite] Save application fallback to local storage:', err?.message || err);` agar tidak memicu unhandled exception merah di konsol saat jaringan *offline* atau terjadi kegagalan sinkronisasi cloud.

### B. Integritas Data Lengkap di Local Storage
* Meskipun data yang dikirimkan ke Appwrite Cloud dipotong agar lolos validasi skema (990 karakter), data teks deskripsi lowongan kerja **asli dan lengkap** (tanpa pemotongan) tetap tersimpan dengan utuh di `localStorage` pada sisi klien melalui [lib/storage/application-storage.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/lib/storage/application-storage.ts).
* Pengguna tidak kehilangan detail kriteria lowongan maupun draf surat lamaran lengkap saat membuka kartu lamaran di papan Kanban.

### C. Normalisasi ID Entitas Baru ([features/analyzer/components/AnalyzerView.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/analyzer/components/AnalyzerView.tsx))
* Memperbarui inisialisasi ID lamaran baru dari `app_${Date.now()}` menjadi `local_app_${Date.now()}`.
* Hal ini selaras dengan pengecualian ID lokal pada `isValidAppwriteId`, sehingga sistem langsung memicu pembuatan dokumen baru (`createDocument`) di Appwrite tanpa melakukan *round-trip update* 404 yang tidak perlu.

---

## 3. Rincian Modifikasi Berkas

| Berkas | Perubahan |
| :--- | :--- |
| [lib/appwrite.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/lib/appwrite.ts) | Menambahkan pemotongan aman 990 karakter untuk `job_description`, `notes`, dan `summary` agar mematuhi batas skema Appwrite Cloud. |
| [features/analyzer/components/AnalyzerView.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/analyzer/components/AnalyzerView.tsx) | Menggunakan prefiks `local_app_` untuk entitas lamaran baru yang disimpan dari halaman analyzer. |

---

## 4. Hasil Verifikasi

1. **Uji Validasi Skema**: Pengiriman data deskripsi pekerjaan dengan panjang > 1.000 karakter tidak lagi memicu `AppwriteException: Attribute "job_description" has invalid type`.
2. **Uji Build Next.js**: Kompilasi `npm run build` berhasil 100% tanpa galat (`Exit Code: 0`).
3. **Uji UI End-to-End**: Tombol "Simpan ke Pelacak" langsung menampilkan status "Tersimpan ke Pelacak!" dan kartu lamaran sukses muncul di papan Kanban `/applications`.
