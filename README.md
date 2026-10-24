# ProjectVault — Pelacak Lamaran Kerja & Bank Proyek

Aplikasi sederhana dan praktis untuk mencatat semua riwayat proyek portofolio Anda, memantau status lamaran kerja, dan membuat surat lamaran (*cover letter*) otomatis yang cocok dengan syarat lowongan pekerjaan.

Aplikasi ini dibuat agar **AI (seperti ChatGPT, Claude, atau Gemini) tidak pernah lupa lagi** dengan riwayat proyek yang pernah Anda kerjakan.

---

## 🎯 Fitur Utama Secara Garis Besar

1. **Bank Proyek:** Tempat menyimpan seluruh portofolio, peran, dan teknologi yang pernah Anda gunakan.
2. **Pelacak Lamaran Kerja (Kanban):** Papan visual untuk memantau status lamaran (*Rencana, Terkirim, Wawancara, Diterima, Ditolak*) dan arsip surat lamaran yang pernah Anda kirim.
3. **Peringatan Follow-Up:** Pengingat otomatis jika ada lamaran yang sudah dikirim lebih dari 7 hari tanpa kabar.
4. **Pembuat Surat Lamaran Otomatis (Mesin Python):** Cukup tempel deskripsi lowongan kerja, aplikasi akan mencocokkan proyek Anda yang paling pas dan membuatkan draf surat lamaran siap kirim.
5. **Tombol "Salin untuk AI" (Anti-Lupa):** Sekali klik untuk menyalin seluruh rangkuman portofolio Anda agar siap ditempel di obrolan AI apa pun.

---

## 🚀 Panduan Cepat Menjalankan (Untuk Pemula)

Tidak perlu konfigurasi rumit, cukup ikuti 3 langkah mudah ini:

### Langkah 1: Buka Terminal

Buka **PowerShell** atau **Command Prompt**, lalu masuk ke folder aplikasi:

```powershell
cd "C:\Users\MyBook Hype AMD\OneDrive\Documents\kerja\_code\tracker_job"
```

### Langkah 2: Jalankan Aplikasi

Ketik perintah ini lalu tekan **Enter**:

```powershell
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
3. **Analisis Lowongan Kerja:** Masuk ke menu **AI & Analisis** &rarr; tempel syarat lowongan dari LinkedIn/JobStreet &rarr; klik **Jalankan Analisis**. Sistem akan memilihkan proyek terbaik Anda dan membuatkan surat lamarannya!
4. **Chat dengan AI Tanpa Takut Lupa:** Klik tombol **"Salin untuk AI"** di Dashboard, lalu tempel (*paste*) di awal obrolan ChatGPT atau Gemini Anda.

---
