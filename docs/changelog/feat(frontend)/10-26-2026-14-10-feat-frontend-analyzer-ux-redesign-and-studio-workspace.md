# Changelog: Redesain UI/UX Halaman Analyzer, Dark Glassmorphism, Layout Sticky, dan Studio Tab Workspace

**Tanggal:** 2026-10-26  
**Waktu:** 14:10 WIB  
**Branch:** `feat/frontend`  
**Nama Commit / Fitur:** `feat(frontend/analyzer): redesign analyzer ui ux with dark glassmorphism, sticky controls, and studio tabs` (`10-26-2026-14-10-feat-frontend-analyzer-ux-redesign-and-studio-workspace`)  
**Tipe Perubahan:** `feat` (UI/UX Ergonomics, Dark Glassmorphism Design System, Studio Workspace Tabs, Sticky Input Controls, 1-Click Job Presets & Export Actions)

---

## 1. Ringkasan Perubahan (Executive Summary)

Pembaruan pada branch `feat/frontend` ini merombak total antarmuka dan alur interaksi pengguna (*user experience*) pada halaman **AI Job Analyzer & Cover Letter Studio** ([`http://localhost:3000/analyzer`](http://localhost:3000/analyzer)). 

Sebelumnya, halaman analyzer memiliki kendala ergonomis dan visual:
1. **Inkonsistensi Tema & Masalah Kontras**: Tag `<html>` pada aplikasi belum memiliki kelas `dark`, menyebabkan kartu komponen merender latar belakang putih bawaan dan teks judul berwarna gelap di atas kanvas latar belakang malam (`#090d16`), sehingga teks judul menjadi tidak terbaca (*low contrast*).
2. **Kelelahan Menggulir Vertikal (*Vertical Scroll Fatigue*)**: Seluruh kartu output (Skor Kecocokan, Rincian Taksonomi Skill, 3 Proyek Portofolio Terkait, Generator Surat Lamaran, dan Mega-Prompt AI) disusun menumpuk secara vertikal sepanjang lebih dari ~3.000 piksel, memaksa pengguna melakukan scrolling berulang kali hanya untuk mengedit input pekerjaan di bagian atas.
3. **Empty State Pasif**: Keadaan awal sebelum proses analisis belum menyediakan panduan interaktif maupun data uji coba cepat.

Pembaruan ini menghadirkan arsitektur tata letak dan desain visual berstandar modern:
- **Penerapan Penuh Sistem Desain Midnight Glassmorphism**: Penyelarasan tema gelap konsisten (`bg-slate-950/70 border-white/[0.08]`), ambient glow gradien, dan tipografi kontras tinggi.
- **Sticky Desktop Input Column (`lg:sticky lg:top-20`)**: Kolom formulir input pekerjaan di sisi kiri terkunci pada posisinya saat panel hasil di sisi kanan digulir.
- **Studio Tab Navigation (`Semua Bagian`, `Kecocokan & Bukti`, `Surat Lamaran`, `Mega-Prompt AI`)**: Pengguna dapat memfilter tampilan hasil secara modular tanpa harus menggulir halaman panjang.
- **Preset 1-Klik & Akselerator Clipboard**: Penambahan tombol preset lowongan instan (*Frontend React*, *AI & Python Backend*, *Fullstack TypeScript*), tombol tempel dari clipboard, serta tombol reset form.
- **Fitur Ekspor & Integrasi Cepat**: Ekspor berkas `.txt` surat lamaran, penyalinan instan dengan notifikasi *toast*, serta sinkronisasi langsung ke papan pelacak lamaran (*Application Tracker*).

---

## 2. Rincian Modifikasi Komponen & Arsitektur

### A. Root Layout & Tema Global ([app/layout.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/app/layout.tsx))
- Menambahkan kelas `dark` pada tag `<html>`: `<html lang="id" className={`${jakarta.variable} dark`}>`.
- Memastikan seluruh token utilitas Tailwind berbasis `dark:` dan variabel warna latar belakang aktif secara konsisten di seluruh halaman aplikasi tanpa bergantung pada konfigurasi *client-side theme switch* manual.

### B. Halaman Utama & Tata Letak Studio ([features/analyzer/components/AnalyzerView.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/analyzer/components/AnalyzerView.tsx))
- **Sticky Panel Desktop**: Membungkus kolom kiri dengan kelas `lg:sticky lg:top-20 space-y-4` agar tetap berada dalam jangkauan pandangan pengguna saat memeriksa dokumen panjang di sisi kanan.
- **Studio Tab Navigation**:
  - Mendefinisikan tipe tab: `type AnalyzerStudioTab = 'all' | 'match' | 'cover_letter' | 'prompt'`.
  - Menghadirkan bilah tab navigasi di bagian atas kolom hasil dengan badge indikator dinamis:
    - `Semua Bagian`: Menampilkan keseluruhan hasil secara terpadu.
    - `Kecocokan & Bukti`: Memfokuskan tampilan pada skor persentase kecocokan, taksonomi skill, dan kartu proyek portofolio terkait.
    - `Surat Lamaran`: Studio penyusunan draf surat lamaran personal.
    - `Mega-Prompt AI`: Prompt terstruktur siap pakai untuk LLM pihak ketiga.
- **Header Bergradien Premium**:
  - Mengubah judul menjadi teks bergradien cerah `bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400`.
  - Menambahkan lencana status mesin lokal `Local NLP Engine v2.0 • Offline Ready`.
- **Empty State Interaktif**:
  - Desain *orb icon* bercahaya dengan ikon `Sparkles` dan lencana `ProjectVault AI Engine`.
  - Tiga kartu panduan ringkas:
    1. *Pilih Preset atau Paste Deskripsi*
    2. *Analisis Relevansi & Skor Portofolio*
    3. *Generate Cover Letter & Ekspor Prompt*
  - Shortcut chip preset lowongan yang dapat langsung diklik pada tampilan kosong.

### C. Kartu Input Lowongan Pekerjaan ([features/analyzer/components/JobInputCard.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/analyzer/components/JobInputCard.tsx))
- **Gaya Glassmorphism**: Menggunakan kelas `glass-card bg-slate-950/70 border-white/[0.08]`.
- **Preset Sampel Pekerjaan (`SAMPLE_JOB_PRESETS`)**:
  - `Frontend React / Next.js` (Perusahaan FinTech Unicorn).
  - `AI & Python Backend` (Startup Deep Learning / Big Data).
  - `Fullstack TypeScript` (SaaS Enterprise).
- **Aksi Cepat Formulir**:
  - Tombol *Paste dari Clipboard* berbasis `navigator.clipboard.readText()`.
  - Tombol *Reset Form* untuk membersihkan input dalam satu ketukan.
- **Indikator Real-Time**:
  - Penghitung jumlah karakter dan perkiraan kata.
  - Lencana peringatan visual ketika teks mendekati batas skema.
- **Area Teks Proporsional**: Mengatur ketinggian textarea menjadi 5 baris (`rows={5}`) agar tidak memakan ruang vertikal berlebih di desktop.

### D. Rincian Skor & Kecocokan Keahlian ([features/analyzer/components/SkillsMatchBreakdown.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/analyzer/components/SkillsMatchBreakdown.tsx))
- **Circular SVG Match Gauge**:
  - Visualisasi radial progress bar SVG dengan persentase skor kecocokan.
  - Lencana tingkat kecocokan dinamis: *Sangat Kuat* (≥80%), *Kuat* (≥65%), *Cukup* (≥45%), dan *Perlu Ditingkatkan* (<45%).
- **Statistik & Taksonomi Keahlian**:
  - Rincian ringkas jumlah keahlian yang cocok versus yang belum terpenuhi.
  - Akordion taksonomi domain keahlian terklasifikasi (*Frontend, Backend, Database, Cloud/DevOps, AI/ML, dll.*) berlatar gelap `bg-slate-950/90`.
- **Sorotan Strategi Wawancara (*Interview Talking Points*)**:
  - Kontainer bergradien indigo `bg-gradient-to-r from-indigo-950/40 via-blue-950/30 to-indigo-950/40 border border-indigo-500/25`.
  - Menampilkan poin-poin argumentasi strategis untuk menjawab pertanyaan wawancara teknis.
- **Kartu Proyek Portofolio Pembuktian**:
  - Kartu proyek dengan lencana skor relevansi `Skor xx%`.
  - Penjelasan alasan relevansi proyek terhadap lowongan.
  - Tautan langsung ke repositori GitHub (`Repo`) dan demo aplikasi langsung (`Demo`).

### E. Generator Surat Lamaran ([features/analyzer/components/CoverLetterGeneratorCard.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/analyzer/components/CoverLetterGeneratorCard.tsx))
- **Pill Pilihan Gaya Bahasa (*Quick Tone Pills*)**:
  - Pilihan gaya instan: *Profesional*, *Antusias*, *Ringkas*, dan *Teknis*.
- **Pemilih Bahasa & Ekspor Berkas**:
  - Tombol toggle dwibahasa: Bahasa Indonesia (`ID`) dan Bahasa Inggris (`EN`).
  - Tombol *Unduh .txt* (`handleDownloadTxt`) untuk menyimpan draf surat lamaran ke sistem berkas lokal pengguna.
  - Tombol *Salin Teks* dengan notifikasi toast visual saat berhasil disalin.
  - Tombol *Simpan ke Pelacak* untuk otomatis mencatat lamaran ke database dan papan Kanban.
- **Editor Teks Modern**: Area penulisan draf dengan font proporsional, scrollbar kustom halus, dan kontras teks putih jernih.

### F. Mega-Prompt LLM Eksternal ([features/analyzer/components/ExternalAiPromptCard.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/analyzer/components/ExternalAiPromptCard.tsx))
- Tampilan blok kode gelap `bg-slate-950/90 border-white/[0.08]` dengan font monospace.
- Tombol *Salin Prompt* sekali klik dengan feedback ikon centang hijau.
- Format prompt terstruktur mencakup profil pengguna, daftar proyek unggulan, kriteria lowongan, dan instruksi penulisan adaptif untuk ChatGPT, Claude, atau Gemini.

---

## 3. Rincian Berkas yang Dimodifikasi

| Berkas | Aksi | Ringkasan Modifikasi |
| :--- | :--- | :--- |
| [app/layout.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/app/layout.tsx) | Edit | Menambahkan kelas `dark` pada tag `<html>` untuk aktivasi tema gelap global. |
| [features/analyzer/components/AnalyzerView.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/analyzer/components/AnalyzerView.tsx) | Edit | Menerapkan layout desktop sticky, bilah navigasi studio tab, dan empty state interaktif. |
| [features/analyzer/components/JobInputCard.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/analyzer/components/JobInputCard.tsx) | Edit | Redesain glassmorphism, preset chip 1-klik, shortcut paste/reset, dan penghitung karakter. |
| [features/analyzer/components/SkillsMatchBreakdown.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/analyzer/components/SkillsMatchBreakdown.tsx) | Edit | Gauge radial match SVG, akordion taksonomi skill, tips wawancara, dan kartu portofolio. |
| [features/analyzer/components/CoverLetterGeneratorCard.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/analyzer/components/CoverLetterGeneratorCard.tsx) | Edit | Quick tone pills, language switch (ID/EN), unduh .txt, salin teks, dan simpan ke tracker. |
| [features/analyzer/components/ExternalAiPromptCard.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/analyzer/components/ExternalAiPromptCard.tsx) | Edit | Blok kode mono gelap collapsible dengan tombol salin prompt terstruktur. |

---

## 4. Hasil Pengujian & Verifikasi

1. **Uji Kompilasi & Build Produksi (`npm run build`)**:
   - Berhasil 100% tanpa error TypeScript maupun lint (`Exit Code: 0`).
   - Seluruh halaman statis dan rute dinamis berhasil dibuat.
2. **Uji Responsivitas & Ergonomi Antarmuka**:
   - Diuji pada resolusi Desktop (1280x712): formulir input di sisi kiri tetap terkunci saat scrolling, sedangkan tab navigasi di sisi kanan merespons pergantian kategori secara mulus.
   - Diuji pada interaksi formulir: tombol preset instan berhasil mengisi judul, perusahaan, dan deskripsi secara akurat; tombol reset berhasil mengosongkan form; tombol salin berhasil menaruh teks ke clipboard.
3. **Uji Penyelarasan Desain Visual**:
   - Masalah kontras teks hitam di atas kanvas malam telah terselesaikan sepenuhnya. Seluruh teks dan elemen interaktif kini memiliki kontras tinggi yang nyaman di mata.
