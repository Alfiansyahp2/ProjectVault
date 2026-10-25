# Changelog: Refactoring Arsitektur Modal (React Portals & Stacking Context) dan Redesain Header KPI Job Tracker

**Tanggal:** 2026-10-25  
**Waktu:** 18:10 WIB  
**Branch:** `feat/backend-job-tracker`  
**Nama Commit:** `feat(backend/job_tracker): refactor modal architecture with react portals and redesign job tracker header kpis` (`10-25-2026-18-10-feat-backend-job-tracker-modal-layout-and-header-refactor`)  
**Tipe Perubahan:** `feat` / `refactor` (Modal Stacking Context Isolation, React Portals, Executive KPI Grid Redesign & Header De-cluttering)

---

## 1. Ringkasan Perubahan (Executive Summary)

Perubahan pada branch `feat/backend-job-tracker` ini berfokus pada resolusi menyeluruh terhadap *stacking context conflict* dan *layout breakage* pada seluruh dialog modal di antarmuka web **ProjectVault** (`tracker_job`), serta penyempurnaan desain visual header dan kartu metrik KPI eksekutif pada halaman pelacak lamaran kerja:

1. **Resolusi Stacking Context & Isolasi Navigasi (React Portals):**
   - Menghilangkan bug kritis di mana bilah navigasi atas (`Navbar`) tembus dan menutupi bagian atas modal (*modal title clipping*).
   - Memindahkan seluruh modal keluar dari hierarki DOM komponen lokal ke tingkat akar `document.body` menggunakan `createPortal` dari `react-dom` dengan lapisan `z-[100]`.
   - Menghapus pembatasan `relative z-10` pada tag `<main>` di [app/layout.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/app/layout.tsx) yang sebelumnya mengunci batas *z-index* seluruh elemen anak di bawah navbar.

2. **Arsitektur 3 Zona Terisolasi (Sticky Header & Sticky Footer):**
   - Mengatasi terpotongnya modal pada layar beresolusi 720p/1080p akibat tinggi form melebihi tinggi *viewport* (`max-h-[90vh]`).
   - Menerapkan pembagian 3 zona pada seluruh modal:
     - **Sticky Header (`shrink-0`):** Judul modal, deskripsi, dan tombol tutup `X` terkunci permanen di atas dan tidak pernah tergulung.
     - **Scrollable Body (`flex-1 overflow-y-auto overscroll-contain`):** Area formulir dapat digulir dengan mulus secara mandiri tanpa menggeser kartu modal.
     - **Sticky Footer (`shrink-0`):** Tombol aksi primer (`Batal`, `Simpan`, `Unduh`, `Salin Teks`) selalu terpancang di bagian bawah modal dan langsung dapat diakses tanpa perlu menggulung halaman.

3. **Penyempurnaan Visual Header Pelacak Lamaran:**
   - Memperbaiki pembungkusan teks (*text-wrapping*) judul `"Pelacak Lamaran Kerja"` yang sebelumnya terpotong menjadi dua baris sempit. Kini berada dalam satu baris sejajar dengan lencana `Local Intelligence` dan ikon brand.
   - Menata ulang toolbar aksi kanan atas dengan menghapus tombol-tombol impor berkas yang berjejal, menyisakan 3 aksi esensial: **View Switcher (`Kanban | Tabel`)**, **Tombol Refresh Data**, dan **Tombol Primer `+ Catat Lamaran`**.

4. **Simetri Penuh 5 Kartu KPI Eksekutif:**
   - Menyeragamkan dimensi, tipografi, dan hierarki visual 5 kolom kartu metrik:
     - *Kartu 1 (Total Lamaran):* Ikon Briefcase Indigo + Total hitungan lamaran.
     - *Kartu 2 (Perusahaan Unik):* Ikon Building Sky + Entitas terverifikasi.
     - *Kartu 3 (Kanal Utama):* Ikon Globe Emerald + Portal rekrutmen dominan.
     - *Kartu 4 (Follow-Up):* Ikon Alert Amber + Lamaran melewati batas 7 hari kerja (interaktif sebagai filter).
     - *Kartu 5 (Progres Arsip):* Ikon Sparkles Ungu + Persentase berkas tersinkronisasi dan progress bar gradasi halus yang presisi.

---

## 2. Analisis Akar Masalah (Root Cause Analysis) & Solusi Arsitektural

### A. Diagnosa Konflik Stacking Context
Pada implementasi sebelumnya, tag `<main>` pada [app/layout.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/app/layout.tsx) dibungkus dengan kelas `relative z-10`, sementara [components/Navbar.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/components/Navbar.tsx) menggunakan `sticky top-0 z-40`. Berdasarkan spesifikasi CSS W3C, elemen dengan `position: relative` dan `z-index` terdefinisi membentuk *local stacking context* baru. Akibatnya, elemen apa pun di dalam `<main>` (termasuk modal dengan `z-50` atau `z-[999]`) tidak akan pernah dapat memiliki urutan tumpukan lebih tinggi daripada sibling sejajar `<main>` yang memiliki `z-40`.

### B. Solusi React Portals & Pembersihan Boundary
1. Tag `<main>` di [app/layout.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/app/layout.tsx) disederhanakan menjadi `<main className="flex-1">` (menghapus `relative z-10`).
2. Bilah navigasi [components/Navbar.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/components/Navbar.tsx) diturunkan ke `z-40`.
3. Seluruh komponen modal dipasangi mekanisme `createPortal(jsx, document.body)` yang mengeksekusi *teleportation* langsung ke elemen `<body>`, menjamin modal selalu berada di tingkat teratas (*root context*) dengan indeks `z-[100]`.

### C. Solusi Desain Flexbox 3-Zona
Struktur kartu modal diubah dari satu kontainer tunggal menjadi susunan *flex column* dengan batas tinggi maksimum `max-h-[90vh]`:
```tsx
<div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md">
  <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#0b1220] border border-white/[0.12] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
    {/* 1. STICKY HEADER */}
    <div className="shrink-0 px-6 py-4.5 border-b border-white/[0.08] bg-slate-900/70 backdrop-blur-md flex items-center justify-between">
      ...
    </div>

    {/* 2. SCROLLABLE BODY */}
    <form id="modal-form" className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 overscroll-contain">
      ...
    </form>

    {/* 3. STICKY FOOTER */}
    <div className="shrink-0 px-6 py-4 border-t border-white/[0.08] bg-slate-900/70 backdrop-blur-md flex items-center justify-end gap-3">
      <button type="submit" form="modal-form">Simpan</button>
    </div>
  </div>
</div>
```
Penggunaan atribut HTML5 `form="modal-form"` pada tombol di luar form memungkinkan tombol submit tetap terisolasi di dalam *sticky footer* namun tetap memicu validasi dan fungsi *submit* formulir dengan sempurna.

---

## 3. Rincian Perubahan per Berkas

### A. [app/layout.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/app/layout.tsx)
- Menghapus kelas `relative z-10` dari tag `<main>`, mengeliminasi isolasi *stacking context* yang membatasi elevasi elemen-elemen dialog di dalam rute aplikasi.

### B. [components/Navbar.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/components/Navbar.tsx)
- Menyesuaikan kelas *header* navigasi dari `z-50` menjadi `z-40` agar berada di bawah lapisan *backdrop* modal (`z-[100]`).

### C. [components/ApplicationModal.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/components/ApplicationModal.tsx)
- Mengimpor `createPortal` dari `react-dom` dan mengimplementasikan state `mounted` untuk proteksi *SSR hydration*.
- Membungkus modal dengan `createPortal(..., document.body)`.
- Mengimplementasikan arsitektur 3 zona:
  - Header tetap (`shrink-0`) dengan ikon Briefcase, judul dinamis (*Catat / Edit*), dan tombol tutup `X`.
  - Formulir input mandiri dengan ID `application-modal-form` dan `overflow-y-auto`.
  - Footer tetap (`shrink-0`) dengan tombol `Batal` dan `Catat ke Pelacak Lamaran` yang selalu terlihat di dasar modal.

### D. [components/ProjectModal.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/components/ProjectModal.tsx)
- Menerapkan `createPortal` ke `document.body`.
- Mengadopsi arsitektur 3 zona dengan form ber-ID `project-modal-form`.
- Menjaga tombol submit `Simpan ke Bank Portofolio` tetap terpampang di bagian footer terlepas dari panjang deskripsi proyek atau pencapaian yang diisi pengguna.

### E. [components/ProjectDetailModal.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/components/ProjectDetailModal.tsx)
- Menerapkan `createPortal` ke `document.body` dan elevasi `z-[100]`.
- Menghapus margin luar berlebih (`my-8`) dan menambahkan kelas `shrink-0` pada top bar aksi dan footer modal agar dokumen portofolio tidak terpotong vertikal.

### F. [components/AiPromptModal.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/components/AiPromptModal.tsx)
- Mengimpor `createPortal` ke `document.body`.
- Memisahkan kontrol tombol `Salin Seluruh Konteks (1-Klik)` dan `Tutup` ke dalam *sticky footer*, sementara area textarea prompt AI yang panjang dapat digulir dengan nyaman di area tengah (*body*).

### G. [app/applications/page.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/app/applications/page.tsx)
- **Header & Action Hub:** Menyusun kembali tata letak brand dan judul menjadi responsif tanpa pemenggalan baris canggung, membersihkan tombol duplikat dari toolbar atas.
- **5 Kartu KPI Simetris:** Memperbarui kartu ke-5 (`PROGRES ARSIP`) dengan ikon `Sparkles` ungu, label kapital, rasio numerik `30/91`, dan bar progres dinamis yang selaras dengan 4 kartu metrik lainnya.
- **Banner Impor Bertahap:** Memusatkan tombol `Parse 5 Berkas Baru` dan `Parse Semua` ke dalam banner antrean khusus amber di bawah kartu KPI.
- **Modal Pembaca Cover Letter:** Mengintegrasikan `createPortal` pada dialog pembaca surat lamaran dengan elevasi `z-[100]` dan header/footer terkunci.

---

## 4. Hasil Verifikasi Visual & Pengujian (Quality Assurance)

Pengujian end-to-end dilakukan menggunakan simulasi browser subagent interaktif pada *viewport* laptop standar (1280x712):

1. **Uji Tampilan Header & 5 Kartu KPI:**
   - Judul `"Pelacak Lamaran Kerja"` tampil utuh dalam satu baris horizontal tanpa wrap aneh.
   - Kelima kartu KPI memiliki tinggi identik, ikon tematik dengan latar belakang aksen halus, dan tipografi seimbang.

2. **Uji Buka Tutup Seluruh Modal:**
   - **`ApplicationModal` (`+ Catat Lamaran`):** Terbuka tepat di tengah layar, seluruh bilah navigasi tertutup *backdrop blur* gelap, header terlihat 100%, footer terlihat 100%, tombol `Batal` dan `Simpan` dapat diklik secara langsung.
   - **`Cover Letter Reader Modal`:** Terbuka dengan layout kertas surat rapi, tag keahlian terisolasi, dan tombol `Unduh (.txt)` serta `Salin Teks` aktif di footer.
   - **`ProjectModal` (`+ Tambah Proyek`):** Formulir penambahan proyek portofolio tampil proporsional tanpa terpotong batas atas atau bawah layar.
   - **`ProjectDetailModal` (Klik Kartu Proyek):** Rincian arsitektur, tech stack, dan capaian terukur tampil terstruktur dengan tombol aksi CV di header.
   - **`AiPromptModal` (`Salin Konteks untuk AI`):** Textarea prompt master anti-halusinasi dapat digulir dan disalin dengan 1 klik.

3. **Uji Validasi TypeScript:**
   - Perintah `npx tsc --noEmit` berhasil dieksekusi dengan status **Exit Code 0** (0 kesalahan tipe data).

---

## 5. Ringkasan Status Repositori

```text
Branch: feat/backend-job-tracker
Status: Berhasil diverifikasi dan siap dikomit
Berkas yang diubah:
  - app/applications/page.tsx
  - app/layout.tsx
  - components/AiPromptModal.tsx
  - components/ApplicationModal.tsx
  - components/Navbar.tsx
  - components/ProjectDetailModal.tsx
  - components/ProjectModal.tsx
  - docs/changelog/feat(backend)/job_tracker/10-25-2026-18-10-feat-backend-job-tracker-modal-layout-and-header-refactor.md
```
