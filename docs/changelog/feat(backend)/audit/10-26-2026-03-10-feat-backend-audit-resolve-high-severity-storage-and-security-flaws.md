# Changelog: Resolusi 4 Temuan Kritis Tinggi (AUD-HIGH-01 s/d AUD-HIGH-04) — Integritas Data Storage, Pencegahan Duplikasi ID, Sandbox Path Traversal, dan Pembersihan Disk Leak

**Tanggal:** 2026-10-26  
**Waktu:** 03:10 WIB  
**Branch:** `feat/backend-audit`  
**Nama Commit / Fitur:** `feat(backend/audit): resolve high severity findings for storage integrity, id desynchronization, path traversal, and upload disk cleanup` (`10-26-2026-03-10-feat-backend-audit-resolve-high-severity-storage-and-security-flaws`)  
**Tipe Perubahan:** `fix` / `security` (Audit Remediation, High Severity Resolution, Data Integrity, Input Sanitization, Disk Lifecycle Management)

---

## 1. Ringkasan Perubahan (Executive Summary)

Pembaruan ini menuntaskan secara menyeluruh **4 temuan berstatus HIGH** pada laporan audit backend ([docs/audit/10-25-2026-19-40-backend-logic-and-architecture-audit.md](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/docs/audit/10-25-2026-19-40-backend-logic-and-architecture-audit.md)). Perubahan ini berfokus pada dua aspek vital sistem: **integritas persistensi data multi-sumber (Appwrite Cloud vs Local Storage)** dan **keamanan endpoint upload dokumen**:

1. **Resolusi False Failure pada State Kosong (`AUD-HIGH-01`):**
   - **Sebelum:** Fungsi `getProjects()` dan `getApplications()` pada [lib/storage.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/lib/storage.ts) menggunakan validasi `if (remote && remote.length > 0) return remote;`. Ketika pengguna sengaja menghapus semua data di Appwrite Cloud sehingga tersisa array kosong (`[]`), sistem salah menafsirkan kondisi tersebut sebagai kegagalan koneksi jaringan, lalu **secara sepihak membangkitkan kembali data dummy awal (`INITIAL_PROJECTS` dan `INITIAL_APPLICATIONS`)**.
   - **Sesudah:** Validasi diperbaiki menjadi `if (remote !== null) return remote;`. Dengan demikian, state kosong yang sah dari cloud dihormati sepenuhnya dan tidak lagi memicu resureksi data dummy.

2. **Pencegahan Duplikasi Data Lokal Saat Sinkronisasi Cloud (`AUD-HIGH-02`):**
   - **Sebelum:** Saat menyimpan entitas yang awalnya memiliki ID lokal (misal: `local_app_...`), fungsi `saveProject()` dan `saveApplication()` memperbarui ID entitas menjadi ID dari Appwrite (`remoteId`). Namun, pencarian indeks di cache lokal hanya mencocokkan `p.id === updated.id`. Akibatnya, ID lokal lama tidak ditemukan, dan entitas baru dimasukkan via `unshift()`, meninggalkan **dua catatan identik (duplikasi data) di antarmuka pengguna**.
   - **Sesudah:** Nilai ID awal disimpan dalam variabel `originalId`. Pencarian indeks kini mencakup `p.id === updated.id || (originalId && p.id === originalId)`, menjamin pembaruan *in-place* tanpa duplikasi.

3. **Pengamanan Jalur Berkas Lokal / Pencegahan Path Traversal (`AUD-HIGH-03`):**
   - **Sebelum:** Parameter `localFilePath` pada rute [app/api/applications/upload-parse/route.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/app/api/applications/upload-parse/route.ts) menerima path berkas apa pun secara mentah tanpa batas kurungan direktori (*unbounded access*), berisiko membaca berkas di luar folder proyek.
   - **Sesudah:** Diterapkan *sandbox containment* yang memastikan path yang diminta secara ketat berada di bawah direktori `data/` (`absolutePath.startsWith(safeDataDir)`) serta wajib berekstensi `.pdf`. Permintaan di luar direktori langsung ditolak dengan status **HTTP 403 Forbidden**.

4. **Pembersihan Otomatis Berkas Sementara & Batasan Upload (`AUD-HIGH-04`):**
   - **Sebelum:** Berkas PDF hasil drag-and-drop ditulis ke `scratch/uploads/` dengan timestamp dan tidak pernah dihapus, menyebabkan penumpukan berkas tak terpakai (*disk bloat*). Selain itu, tidak ada batas ukuran berkas yang diunggah.
   - **Sesudah:** Ekstraksi Python dibungkus dalam blok `try ... finally` yang secara otomatis menghapus berkas sementara dari disk (`fs.unlinkSync(targetPath)`) segera setelah proses ekstraksi selesai. Ditambahkan pula validasi batas ukuran maksimum berkas sebesar **15 MB**.

---

## 2. Rincian Perubahan per Berkas

### A. [lib/storage.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/lib/storage.ts)
* **Mengatasi `AUD-HIGH-01` (Empty State):**
  Mengubah logika evaluasi respons remote pada `getProjects()` dan `getApplications()`:
  ```typescript
  if (remote !== null) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(remote));
    }
    return remote;
  }
  ```
* **Mengatasi `AUD-HIGH-02` (ID Desynchronization):**
  Mempertahankan `originalId` sebelum entitas disimpan ke Appwrite:
  ```typescript
  export async function saveApplication(appItem: JobApplication): Promise<JobApplication> {
    const originalId = appItem.id;
    // ... simpan ke Appwrite dan dapatkan remoteId ...
    if (typeof window !== 'undefined') {
      const current = await getApplications();
      const index = current.findIndex(a => a.id === updatedApp.id || (originalId && a.id === originalId));
      if (index >= 0) {
        current[index] = updatedApp;
      } else {
        current.unshift(updatedApp);
      }
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(current));
    }
    return updatedApp;
  }
  ```

### B. [app/api/applications/upload-parse/route.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/app/api/applications/upload-parse/route.ts)
* **Mengatasi `AUD-HIGH-03` (Sandbox Boundary):**
  Memvalidasi tipe data `localFilePath`, mengevaluasi path kanonikal (`path.resolve`), dan memastikan berkas berada di dalam `cwd/data` dengan ekstensi `.pdf`:
  ```typescript
  const safeDataDir = path.resolve(cwd, 'data');
  const absolutePath = path.isAbsolute(localFilePath) 
    ? path.resolve(localFilePath) 
    : path.resolve(cwd, localFilePath);

  if (!absolutePath.startsWith(safeDataDir) || !absolutePath.toLowerCase().endsWith('.pdf')) {
    return NextResponse.json(
      { success: false, error: 'Akses ditolak: Hanya berkas PDF di dalam direktori data/ yang diizinkan.' },
      { status: 403 }
    );
  }
  ```
* **Mengatasi `AUD-HIGH-04` (Disk Lifecycle & Limit):**
  Menerapkan batas ukuran maksimum 15MB (`MAX_UPLOAD_SIZE`) dan memastikan penghapusan berkas pada blok `finally`:
  ```typescript
  let parsedData: any = null;
  try {
    parsedData = await parsePdfWithPython(targetPath, cwd);
  } finally {
    if (fs.existsSync(targetPath)) {
      try {
        fs.unlinkSync(targetPath);
      } catch (unlinkErr) {
        console.warn('Gagal menghapus berkas sementara upload:', targetPath, unlinkErr);
      }
    }
  }
  ```

### C. [docs/audit/10-25-2026-19-40-backend-logic-and-architecture-audit.md](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/docs/audit/10-25-2026-19-40-backend-logic-and-architecture-audit.md)
* Memperbarui tabel matriks temuan audit untuk menandai `AUD-CRIT-01`, `AUD-HIGH-01`, `AUD-HIGH-02`, `AUD-HIGH-03`, dan `AUD-HIGH-04` dengan status **Selesai**.

---

## 3. Verifikasi & Pengujian Kualitas

1. **Uji Keamanan Path Traversal:**
   - Dikirimkan permintaan `POST /api/applications/upload-parse` dengan payload manipulatif `{"localFilePath": "../package.json"}`.
   - **Hasil:** Server secara tepat menolak permintaan dengan **HTTP 403 Forbidden** dan pesan aman: `"Akses ditolak: Hanya berkas PDF di dalam direktori data/ yang diizinkan."`.
2. **Uji Akses Berkas Legal:**
   - Dikirimkan permintaan dengan berkas legal `data/resume/New folder/surat lamaran_ADR Group of Companies...pdf`.
   - **Hasil:** Berhasil merespons dengan **HTTP 200 OK** dan data ekstraksi entitas lengkap.
3. **Uji Siklus Hidup Berkas Upload:**
   - Berkas sementara diuji diunggah dan diverifikasi terhapus dari `scratch/uploads/` segera setelah respons dikirimkan.
4. **Uji Kompilasi & Validasi TypeScript:**
   - Menjalankan `npm run build` yang lulus 100% tanpa galat kompilasi atau kesalahan tipe data (*0 errors, Exit Code 0*).
