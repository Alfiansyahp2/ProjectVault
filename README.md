# ProjectVault — Pelacak Lamaran Kerja & Bank Proyek

Aplikasi sederhana dan praktis untuk mencatat semua riwayat proyek portofolio Anda, memantau status lamaran kerja, dan membuat surat lamaran (*cover letter*) otomatis yang cocok dengan syarat lowongan pekerjaan.

Aplikasi ini dibuat agar **AI (seperti ChatGPT, Claude, atau Gemini) tidak pernah lupa lagi** dengan riwayat proyek yang pernah Anda kerjakan.

---

## 🎯 Fitur Utama Secara Garis Besar

1. **Bank Proyek:** Tempat menyimpan seluruh portofolio, peran, dan teknologi yang pernah Anda gunakan.
2. **Pelacak Lamaran Kerja (Kanban):** Papan visual untuk memantau status lamaran (*Rencana, Terkirim, Wawancara, Diterima, Ditolak*) dan arsip surat lamaran yang pernah Anda kirim.
3. **Peringatan Follow-Up:** Pengingat otomatis jika ada lamaran yang sudah dikirim lebih dari 7 hari tanpa kabar.
4. **Analisis Lowongan Kerja & Pencocokan Portofolio (Hibrida AHP-SAW):** Cukup tempel deskripsi lowongan kerja, mesin analitik akan mencocokkan proyek Anda yang paling relevan secara objektif dan transparan.
5. **Pembuat Surat Lamaran Otomatis (Mesin Python Offline):** Menyusun draf surat lamaran siap kirim dan strategi interview berbasis bukti proyek nyata tanpa ketergantungan API eksternal.
6. **Tombol "Salin untuk AI" (Anti-Lupa):** Sekali klik untuk menyalin seluruh rangkuman portofolio Anda agar siap ditempel di obrolan AI apa pun.

---

## 🧠 Metode Perhitungan Kecocokan: Hibrida AHP-SAW

Untuk mengevaluasi dan merangking proyek portofolio terhadap persyaratan lowongan kerja secara ilmiah dan transparan, ProjectVault menerapkan pendekatan **Multi-Criteria Decision Analysis (MCDA)** dengan metode **Hibrida AHP-SAW (Analytic Hierarchy Process - Simple Additive Weighting)**:

### 1. Pembobotan Kriteria dengan AHP (Analytic Hierarchy Process)
Bobot prioritas setiap kriteria ($w_j$) ditentukan melalui matriks perbandingan berpasangan (*pairwise comparison*) skala Saaty (1–9) yang telah divalidasi dengan nilai rasio konsistensi **$CR = 0.0023 \ll 0.10$** (terbukti konsisten dan valid secara matematis):

- **$C_1$ Core Tech Stack Alignment ($37\%$):** Rasio kecocokan keahlian teknis proyek (`project.technologies`) terhadap daftar keahlian yang dibutuhkan lowongan (`detected_skills`).
- **$C_2$ Feature & Context Relevance ($28\%$):** Frekuensi dan relevansi konteks domain, fitur sistem, dan kata kunci arsitektur di dalam narasi proyek (`project.description`).
- **$C_3$ Role & Architectural Alignment ($20\%$):** Keselarasan peran spesialisasi proyek (Backend, Frontend, Fullstack, Mobile, DevOps) terhadap judul posisi lowongan (`job_title`).
- **$C_4$ Complexity & Quality Proof ($15\%$):** Pembuktian rekayasa nyata berupa metrik hasil terukur (misal peningkatan efisiensi %), live demo aktif, dan tautan repositori kode sumber.

### 2. Perangkingan Alternatif Runtime dengan SAW (Simple Additive Weighting)
Skor akhir kecocokan komposit proyek portofolio dihitung secara instan dan berlatensi rendah ($O(K \times N)$) menggunakan formula linier penjumlahan terbobot:

$$S_i = \left( \sum_{j=1}^{4} w_j \cdot r_{ij} \right) \times 100$$
$$S_i = (0.37 \cdot r_{i1} + 0.28 \cdot r_{i2} + 0.20 \cdot r_{i3} + 0.15 \cdot r_{i4}) \times 100$$

- $r_{ij} \in [0, 1]$ adalah nilai kinerja ternormalisasi kriteria *benefit*.
- Hasil perangkingan memilih **Top-3 Proyek** paling relevan untuk dijadikan bukti pengalaman pada draf surat lamaran (*Cover Letter*) dan poin bicara wawancara kerja.
- Dilengkapi transparansi rincian skor (*Score Breakdown*) langsung di kartu proyek.

> 📖 **Dokumentasi Lengkap:** Penjelasan derivasi matematis matriks Saaty, uji konsistensi nilai eigen ($\lambda_{\max}$), dan simulasi komputasi riil dapat dilihat di dokumen [Metodologi dan Perhitungan Logika Hibrida AHP-SAW](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/docs/changelog/feat(backend)/ai-anylisis/perhitungan/10-29-2026-20-20-metodologi-dan-perhitungan-logika-hibrida-ahp-saw.md).

---

## 🚀 Panduan Cepat Menjalankan (Untuk Pemula)

Tidak perlu konfigurasi rumit, cukup ikuti 3 langkah mudah ini:

### Langkah 1: Buka Terminal di Folder Proyek

Buka terminal (**PowerShell**, **Command Prompt**, atau **Terminal macOS/Linux**) di dalam folder proyek ini:

```bash
# Unduh repositori (jika baru pertama kali):
git clone https://github.com/Alfiansyahp2/ProjectVault.git
cd ProjectVault

# Pasang dependensi:
npm install
```

### Langkah 2: Jalankan Aplikasi

Ketik perintah ini lalu tekan **Enter**:

```bash
npm run dev
```

### Langkah 3: Buka di Browser

Buka Google Chrome atau browser favorit Anda, lalu ketik alamat ini:
👉 **[http://localhost:3000](http://localhost:3000)**

*Aplikasi sudah langsung bisa digunakan! Semua data yang Anda masukkan otomatis tersimpan di laptop Anda.*

---

## 💡 Cara Penggunaan Sehari-Hari

1. **Catat Proyek:** Masuk ke menu **Bank Proyek** &rarr; klik **Tambah Proyek Baru** &rarr; isi nama proyek dan teknologi yang digunakan.
2. **Kirim Lamaran Baru:** Saat Anda melamar pekerjaan, buka menu **Pelacak Lamaran** &rarr; klik **Catat Lamaran Baru** agar riwayatnya tersimpan rapi.
3. **Analisis Lowongan Kerja:** Masuk ke menu **AI & Analisis** &rarr; tempel syarat lowongan dari LinkedIn/JobStreet &rarr; klik **Jalankan Analisis**. Sistem Hibrida AHP-SAW akan mengevaluasi portofolio Anda, memilih proyek terbaik, dan menyusun surat lamaran siap kirim!
4. **Chat dengan AI Tanpa Takut Lupa:** Klik tombol **"Salin untuk AI"** di Dashboard, lalu tempel (*paste*) di awal obrolan ChatGPT atau Gemini Anda.

---
