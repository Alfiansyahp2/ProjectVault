# Changelog: Overhaul Komprehensif Desain UI/UX & Tata Letak Komponen Dashboard dan Bank Proyek

**Tanggal:** 2026-10-26  
**Waktu:** 16:47 WIB  
**Branch:** `feat/frontend`  
**Nama Commit / Fitur:** `feat(frontend): overhaul dashboard and project bank ui/ux layout components button hierarchy and card density` (`10-26-2026-16-47-feat-frontend-dashboard-and-project-bank-ui-ux-overhaul`)  
**Tipe Perubahan:** `feat` (Comprehensive UI/UX Overhaul, Layout Restructuring, Card Density Reduction, Button Hierarchy, Wall-of-Text Elimination, Accessible Typography)

---

## 1. Ringkasan Perubahan (Executive Summary)

Pembaruan ini melakukan perombakan total terhadap antarmuka pengguna (**UI**) dan pengalaman pengguna (**UX**) pada halaman **Dashboard** (`/`) dan **Bank Proyek** (`/projects`) berdasarkan analisis kritis terhadap masalah visual yang ditemukan pada tangkapan layar antarmuka sebelumnya.

Sebelum pembaruan ini, tata letak dan komponen mengalami sejumlah masalah ergonomi yang mengganggu kenyamanan pengguna:
1. **Wall-of-Text Paragraf Masif pada Alert Follow-Up**: Alert lowongan yang membutuhkan follow-up menampilkan string mentah 65 nama perusahaan dan posisi yang disambung koma (`.join(', ')`), menghasilkan blok teks kuning setinggi ~250px yang tidak terbaca dan merusak ritme vertikal dashboard.
2. **Penumpukan Vertikal Metrik Header Bank Proyek**: Peletakan 4 tombol aksi lebar di sisi kanan header memaksa kolom metrik di sisi kiri menyusut, sehingga 3 badge metrik (`16 Portofolio`, `60+ Tech`, `48 Capaian`) tertekan dan bertumpuk secara vertikal menjadi satu menara yang tidak seimbang.
3. **Ketinggian Kartu Proyek yang Berlebihan (~480px)**: Pada grid Bank Proyek, setiap kartu portofolio didominasi oleh kotak hijau `Dampak Terukur & Capaian` yang memuat 2 paragraf padat berisi 40–50 kata. Akibatnya, kartu menjadi sangat panjang, teknologi terdorong jauh ke bawah, dan grid 3-kolom terasa penuh sesak serta melelahkan untuk dipindai (*visual fatigue*).
4. **Hierarki Tombol & Kontras Teks yang Tidak Konsisten**: Tombol-tombol CTA tidak memiliki penjenjangan visual yang tegas (semua tombol tampak bersaing untuk mendapatkan perhatian), dan teks sub-label pada beberapa kartu metrik memiliki kontras rendah yang sulit dibaca.

Pembaruan ini menyelesaikan seluruh kendala tersebut dengan standar estetika modern, hierarki visual terstruktur, tipografi kontras tinggi, dan *micro-animations* yang halus.

---

## 2. Analisis UI/UX: Sebelum vs Sesudah

| Area Komponen | Kondisi Sebelum (Problematic) | Kondisi Sesudah (Overhaul UI/UX) | Manfaat UX |
| :--- | :--- | :--- | :--- |
| **Alert Follow-Up Dashboard** | Menampilkan 65 perusahaan dalam 1 paragraf raksasa tanpa struktur, menghabiskan ~250px ruang vertikal. | Menampilkan **4 chip prioritas** dengan ikon gedung, lencana `+{count} lainnya`, dan **drawer expandable** interaktif untuk melihat daftar lengkap dalam grid 3-kolom. | Menghilangkan polusi visual, mengurangi tinggi komponen dari ~250px menjadi ~80px, dan memberikan kendali penuh kepada pengguna. |
| **Hero Banner & CTA Dashboard** | Tombol aksi terdistribusi kaku dan bersaing dalam bobot visual. | Penjenjangan hierarki tombol: **Primary Gradient** (`Salin Konteks AI`), **Secondary Glass** (`Analisis Lowongan`), dan **Tertiary Outline** (`Ekosistem Tech Stack`). | Alur tindakan pengguna menjadi sangat jelas dan terarah. |
| **Kartu Metrik Dashboard** | Teks sub-label pada status wawancara dan tawaran memiliki kontras rendah (`text-slate-500`) yang pudar di latar belakang gelap. | Tipografi kontras tinggi dengan badge status modular, ikon berwarna cerah, dan integrasi tombol pembuka modal tech stack. | Keterbacaan (*readability*) meningkat drastis, metrik kunci dapat dipindai dalam hitungan milidetik. |
| **Header Bank Proyek (ProjectStats)** | Tombol aksi di kanan menekan metrik di kiri hingga tertekuk dan bertumpuk 3 baris vertikal. | **Struktur 2-baris modular**: Baris atas khusus untuk judul halaman dan 3 tombol CTA berpenjenjangan; Baris bawah berupa **grid horizontal 3-kolom** untuk metrik kunci yang seimbang dan simetris. | Layout tidak lagi tertekan pada layar laptop maupun tablet; metrik tech stack berfungsi sebagai tombol interaktif pembuka modal. |
| **Kartu Proyek (ProjectCard)** | Kotak hijau capaian menampilkan 2–3 paragraf padat sehingga tinggi kartu mencapai ~480px, membuat grid sangat panjang. | **Reduksi densitas tinggi kartu menjadi ~290px**: Kotak hijau digantikan oleh **Key Impact Highlight 1-baris** (`★ [Highlight Utama]` + `+{count} lainnya`), judul dengan pemotongan rapi, dan brand icon pada teknologi. | Tampilan grid portofolio menjadi ringkas, profesional, mudah dipindai, dan tidak melelahkan mata. |
| **Tabel Bank Proyek (ProjectTableView)** | Baris capaian dapat melebar tanpa batas dan merusak kerapian baris tabel. | Capaian dibatasi maksimal 2 baris teratas dengan lencana `+{count} capaian lainnya`, serta integrasi brand icon SVG pada kolom teknologi. | Konsistensi tinggi baris tabel terjaga dan pemindaian data tabular menjadi nyaman. |

---

## 3. Rincian Modifikasi Berkas & Komponen

### A. Dashboard Follow-Up Alert ([features/dashboard/components/DashboardFollowUpAlert.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/dashboard/components/DashboardFollowUpAlert.tsx))
- **Eliminasi Wall-of-Text**: Menghapus baris kode `followUpNeeded.map(f => ...).join(', ')`.
- **Top Priority Chips**: Memilih 4 perusahaan teratas dan menampilkannya sebagai chip modular terpisah dengan ikon `Building2`, nama perusahaan berbobot tebal, posisi pekerjaan, dan pemotongan teks rapi (`truncate`).
- **Lencana Sisa Interaktif**: Menampilkan lencana `+{remainingCount} lainnya` yang mengindikasikan ketersediaan data lebih lanjut.
- **Drawer Kolapsibel**: Menambahkan tombol aksi `Tinjau & Follow-up ({count})` dengan ikon panah chevron yang dapat membuka/menutup drawer daftar lengkap 65 perusahaan dalam grid 3-kolom berskrol halus dengan informasi tanggal lamaran dan tautan langsung.

### B. Dashboard Hero Banner ([features/dashboard/components/DashboardHeroBanner.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/dashboard/components/DashboardHeroBanner.tsx))
- **Penjenjangan Tombol CTA**:
  - **Primer**: `[Salin Konteks AI]` menggunakan gradien `from-indigo-500 via-indigo-600 to-sky-500`, bayangan pendaran neon (*glow shadow*), dan feedback visual ketika disalin.
  - **Sekunder**: `[Analisis Lowongan]` menggunakan kontainer *frosted glass* dengan border semi-transparan `border-white/10`.
  - **Tersier**: `[Ekosistem Tech Stack]` menggunakan gaya netral elegan untuk membuka modal katalog teknologi.
- **Responsivitas**: Tombol disusun dengan pembungkus fleksibel (*flex-wrap*) dengan jarak celah yang proporsional di seluruh resolusi layar.

### C. Dashboard Metrics ([features/dashboard/components/DashboardMetrics.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/dashboard/components/DashboardMetrics.tsx))
- **Koreksi Kontras Teks**: Memperbaiki teks keterangan di bagian bawah kartu "Wawancara Aktif" dan "Tawaran Diterima" dari abu-abu gelap menjadi teks yang kontras dan nyaman dibaca.
- **Penyelarasan Kartu Bank Proyek**: Mengintegrasikan lencana `[X+ Tech]` langsung di samping angka jumlah portofolio dengan efek hover interaktif untuk memicu `TechStackModal`.

### D. Recent Projects Card ([features/dashboard/components/RecentProjectsCard.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/dashboard/components/RecentProjectsCard.tsx))
- **Parser Capaian Cerdas**: Mengurai string `achievements` berdasarkan karakter newline atau bullet (`•`, `*`) dan hanya mengambil poin capaian utama pertama.
- **Highlight Capaian 1-Baris**: Menampilkan `★ [Highlight Utama]` dengan pemotongan teks ellipsis dan lencana `+{bullets.length - 1} capaian`.
- **Ikon Teknologi Miniatur**: Menampilkan 4 teknologi pertama dengan brand icon SVG autentik dari `TechIcon` dan lencana `+{n} lainnya` untuk membuka rincian modal teknologi proyek.

### E. Project Bank Stats & Header ([features/projects/components/ProjectStats.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/projects/components/ProjectStats.tsx))
- **Restrukturisasi 2-Baris**:
  - **Baris 1 (Header & Aksi)**: Menempatkan judul "Bank Proyek & Portofolio", badge status, dan deskripsi di sisi kiri, serta 3 tombol aksi di sisi kanan (`[Generate dari project.md]`, `[Konteks AI]`, dan `[+ Tambah Proyek]`).
  - **Baris 2 (Metrik Strip 3-Kolom)**: Menghadirkan 3 kartu metrik horizontal berukuran seragam:
    1. **Proyek Unggulan**: Ikon `FolderGit2` indigo, angka tebal, label deskriptif.
    2. **Tech Stacks & Ikon**: Berfungsi sebagai kartu interaktif dengan efek hover transform, ikon `Cpu`, jumlah teknologi terdeteksi, dan lencana tombol `Buka Modal →`.
    3. **Capaian Terukur**: Ikon `TrendingUp` emerald, angka total capaian yang terverifikasi.

### F. Project Grid Card ([features/projects/components/ProjectCard.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/projects/components/ProjectCard.tsx))
- **Penurunan Tinggi Kartu (~480px ke ~290px)**:
  - Mengganti kotak hijau multi-bullet yang masif dengan strip ringkas **Key Impact Highlight** 1-baris.
  - Membatasi deskripsi proyek menjadi maksimal 2 baris (`line-clamp-2`).
  - Membatasi tag teknologi menjadi 4 teratas dengan `TechIcon` brand SVG dan tombol `+{remainingTech} stack • Modal`.
- **Efek Hover & Ergonomi**:
  - Menambahkan animasi elevasi `hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-xl` untuk memberikan umpan balik visual yang memikat (*wow factor*).
  - Isolasi klik pada tombol salin dan chip teknologi menggunakan `e.stopPropagation()` agar tidak memicu pembukaan modal detail proyek secara tidak sengaja.

### G. Project Table View ([features/projects/components/ProjectTableView.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/projects/components/ProjectTableView.tsx))
- Membatasi render bullet capaian menjadi 2 poin teratas dengan `line-clamp-2` dan menambahkan keterangan `+{n} capaian lainnya`.
- Menyelaraskan padding dan tipografi agar konsisten dengan gaya desain sistem antarmuka baru.

---

## 4. Berkas yang Dimodifikasi

| Berkas | Status | Ringkasan Modifikasi |
| :--- | :--- | :--- |
| [features/dashboard/components/DashboardFollowUpAlert.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/dashboard/components/DashboardFollowUpAlert.tsx) | Edit | Perbaikan drastis wall-of-text: mengganti deretan 65 nama perusahaan menjadi chip prioritas ringkas, lencana +X lainnya, dan drawer expandable. |
| [features/dashboard/components/DashboardHeroBanner.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/dashboard/components/DashboardHeroBanner.tsx) | Edit | Penataan hierarki tombol CTA agar seimbang, proporsional, dan elegan. |
| [features/dashboard/components/DashboardMetrics.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/dashboard/components/DashboardMetrics.tsx) | Edit | Penyelarasan kontras teks, penataan tombol [X+ Tech], dan footer info kartu metrik. |
| [features/dashboard/components/RecentProjectsCard.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/dashboard/components/RecentProjectsCard.tsx) | Edit | Pembatasan capaian menjadi 1 highlight ringkas, tag dengan `TechIcon`, dan trigger modal proyek. |
| [features/projects/components/ProjectStats.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/projects/components/ProjectStats.tsx) | Edit | Restrukturisasi layout 2-baris untuk mencegah penumpukan vertikal metrik menjadi 3 kartu terstruktur. |
| [features/projects/components/ProjectCard.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/projects/components/ProjectCard.tsx) | Edit | Reduksi drastis tinggi kartu dengan menampilkan 1 poin capaian terukur utama, efek hover transform, dan tag berikon. |
| [features/projects/components/ProjectTableView.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/projects/components/ProjectTableView.tsx) | Edit | Pembatasan 2 baris capaian, tag teknologi berikon, dan tombol `[Buka Modal Stack]`. |

---

## 5. Hasil Pengujian & Verifikasi

1. **Uji Kompilasi & Build Produksi (`npm run build`)**:
   - Status: **LULUS (Exit Code: 0)**.
   - Tidak ada peringatan linting atau kesalahan tipe TypeScript.
   - Halaman `/` (Dashboard) dan `/projects` (Bank Proyek) digenerasi sebagai halaman statis yang sangat cepat.
2. **Penyelesaian Masalah Visual pada Gambar**:
   - **Teks Paragraf Masif Alert Follow-Up Terselesaikan**: Tidak ada lagi paragraf kuning raksasa yang memenuhi sepertiga layar. Diganti dengan 4 chip prioritas bersih dan drawer *expandable*.
   - **Penumpukan Vertikal Metrik Header Terselesaikan**: Header dan metrik Bank Proyek tersusun rapi dalam 3 kartu modular horizontal yang proporsional.
   - **Ketinggian Berlebih Kartu Proyek Terselesaikan**: Kartu portofolio tidak lagi didominasi blok hijau raksasa; digantikan dengan highlight capaian 1-baris yang elegan dan lencana jumlah capaian.
   - **Hierarki Tombol & Kontras Teks**: Semua tombol CTA kini memiliki hierarki visual yang jelas (primer gradient, sekunder glass, tersier outline) dengan tipografi kontras tinggi.
