# Changelog: Penataan Ulang UI Header Form, Tombol Aksi Icon-Only & Floating Status Pill

**Tanggal:** 2026-10-27  
**Waktu:** 19:30 WIB  
**Branch:** `feat/frontend`  
**Nama Commit:** `feat(frontend): streamline header action bar with icon-only buttons and floating status toast` (`10-27-2026-19-30-feat-frontend-header-ui-icon-only-actions-and-floating-status-pill`)  
**Tipe Perubahan:** `feat` / `refactor` (UI Layout Streamlining, Icon-Only Button Design, Floating Status Toast, Anti-Wrap Protection)

---

## 1. Ringkasan Perubahan (Executive Summary)

Pembaruan pada branch `feat/frontend` ini menata ulang area header pada panel formulir lowongan kerja di halaman **AI & Analisis** (`/analyzer`) dan panel masukan teks panjang pada **Modal Catat Lamaran** (`features/applications`).

### Permasalahan UI Sebelumnya:
1. **Teks Judul Terlipat (*Awkward Text Wrapping*)**:
   - Pada viewport tablet/laptop tertentu, teks *"Informasi Lowongan"* terdesak oleh deretan tombol aksi di sisi kanan sehingga terlipat menjadi dua baris (*Informasi \n Lowongan*).
2. **Kepadatan Teks Status Pesan**:
   - Saat proses ekstraksi OCR gambar selesai, teks notifikasi keberhasilan yang panjang (*"Berhasil mengekstrak teks gambar!"*) dirender secara inline di antara judul dan tombol aksi, menyebabkan tabrakan tata letak dan pembungkus 3 baris teks.
3. **Tombol Aksi Terlalu Padat**:
   - Label teks tombol (*"Tambah"*, *"Tempel"*, *"Reset"*) memakan ruang horizontal yang berlebihan dan membuat tampilan header terasa penuh.

### Solusi & Peningkatan yang Diterapkan:
1. **Proteksi Anti-Lipat Judul (*No Title Wrapping*)**:
   - Menambahkan utilitas `shrink-0 whitespace-nowrap` pada judul header di [JobInputCard.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/analyzer/components/JobInputCard.tsx) dan [RawTextParserTab.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/applications/components/ApplicationModal/RawTextParserTab.tsx) sehingga judul selalu tampil satu baris yang kokoh dan rapi.
2. **Peralihan ke Tombol Icon-Only Minimalis**:
   - Menghapus label teks pada tombol aksi di [JobInputMediaMenu.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/analyzer/components/JobInputMediaMenu.tsx):
     - **`[ + ]`** : Tombol menu cepat sumber masukan (Gambar OCR / Berkas Lokal).
     - **`[ 📋 ]`** : Tombol tempel langsung dari *clipboard*.
     - **`[ ↺ ]`** : Tombol bersihkan isi formulir.
   - Dilengkapi atribut aksesibilitas `title` dan `aria-label` yang ramah pembaca layar serta *tooltip* native peramban.
3. **Notifikasi Mengambang (*Floating Status Pill / Toast*)**:
   - Pesan status keberhasilan (*statusMsg*) dan progres OCR (*ocrStatus*) dipindahkan menjadi pill mengambang (*absolute floating toast*, `top-full mt-2 right-0 z-30`) dengan latar belakang *glassmorphism* `#0b1220/95` dan bingkai aksen hijau/biru.
   - Tidak lagi mempengaruhi lebar header formulir dan otomatis hilang setelah beberapa detik.
4. **Spinner Loading Terintegrasi pada Tombol**:
   - Saat ekstraksi OCR berlangsung, ikon `+` pada tombol utama otomatis berganti menjadi animasi spinner berputar `<RefreshCw className="animate-spin" />` dengan status `cursor-wait`.

---

## 2. Diagram Alur Antarmuka Pengguna (UI Layout Hierarchy)

```mermaid
graph TD
    subgraph "Header Formulir Lowongan Kerja"
        H2["[💼] Informasi Lowongan<br/>(shrink-0 whitespace-nowrap)"]
        
        subgraph "Action Bar Minimalis (JobInputMediaMenu)"
            BTN_PLUS["[+] Tambah Menu<br/>(atau 🔄 saat proses)"]
            BTN_PASTE["[📋] Tempel Clipboard"]
            BTN_RESET["[↺] Reset Form"]
        end
        
        subgraph "Floating Layer (z-30)"
            TOAST["✨ Floating Pill Notifikasi / Progres OCR<br/>(absolute right-0 top-full mt-2)"]
            DROPDOWN["📁 Dropdown Sumber Masukan<br/>(Tambah Gambar / Berkas Lokal)"]
        end
    end

    H2 --- Action Bar Minimalis
    BTN_PLUS -. "Aktif" .-> DROPDOWN
    BTN_PLUS -. "Status/Progres" .-> TOAST
```

---

## 3. Rincian Modifikasi Berkas

| Berkas | Tipe | Ukuran | Deskripsi |
| :--- | :---: | :---: | :--- |
| [features/analyzer/components/JobInputCard.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/analyzer/components/JobInputCard.tsx) | `modified` | **213 baris** | Menerapkan `shrink-0 whitespace-nowrap` dan `gap-2` pada judul header agar tidak terlipat menjadi 2 baris saat layar menyempit. |
| [features/analyzer/components/JobInputMediaMenu.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/analyzer/components/JobInputMediaMenu.tsx) | `modified` | **193 baris** | Mengubah tombol aksi menjadi ikon minimalis (`+`, `📋`, `↺`), menyematkan spinner loading di dalam tombol, dan memindahkan pesan status ke *floating toast pill*. |
| [features/applications/components/ApplicationModal/RawTextParserTab.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/applications/components/ApplicationModal/RawTextParserTab.tsx) | `modified` | **222 baris** | Menyelaraskan layout header pada tab teks modal lamaran dengan tombol *icon-only*, proteksi *anti-wrap*, dan *floating progress pill*. |

---

## 4. Statistik Perubahan Baris Kode (Git Diff Stats)

```text
 features/analyzer/components/JobInputCard.tsx      |  8 ++--
 features/analyzer/components/JobInputMediaMenu.tsx | 54 ++++++++++++++--------
 .../ApplicationModal/RawTextParserTab.tsx          | 49 ++++++++++++--------
 3 files changed, 68 insertions(+), 43 deletions(-)
```

---

## 5. Hasil Pengujian & Jaminan Mutu (Verification & QA)

1. **Kepatuhan Batas Baris Kode (*Bulk Lines Policy*)**:
   - Seluruh berkas yang dimodifikasi diverifikasi memiliki ukuran **< 225 baris** (memenuhi batas maksimal 250 baris per berkas):
     - `JobInputCard.tsx`: 213 baris
     - `JobInputMediaMenu.tsx`: 193 baris
     - `RawTextParserTab.tsx`: 222 baris
2. **Pemeriksaan Tipe TypeScript (`npx tsc --noEmit`)**:
   - Lulus 100% tanpa kesalahan tipe (*0 errors, exit code: 0*).
3. **Verifikasi Visual Browser**:
   - Header formulir berhasil diverifikasi bersih dan satu baris tanpa polusi teks pesan status.
   - Tombol *icon-only* responsif dan intuitif dengan panduan *tooltip* yang jelas.
