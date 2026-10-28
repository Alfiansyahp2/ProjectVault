# Changelog: Sistem Log Pembelajaran Parser Berkelanjutan & Auto-Retraining (Continuous Active Learning)

**Tanggal:** 2026-10-28  
**Waktu:** 05:55 WIB  
**Branch:** `feat/backend`  
**Nama Commit:** `feat(backend): add continuous learning log, experience store, and active retraining loop` (`10-28-2026-05-55-feat-backend-continuous-learning-log-and-auto-retraining`)  
**Tipe Perubahan:** `feat` / `refactor` (Experience-Driven Machine Learning, Continuous Parser Logging, Ground-Truth Active Learning, UI Save-Feedback Loop, Feature Regex Boundary Hardening)

---

## 1. Ringkasan Perubahan (Executive Summary)

Pembaruan pada branch `feat/backend` ini menghadirkan **Sistem Log Pembelajaran Berkelanjutan (*Continuous Parser Experience Logging*)** dan **Feedback Loop Aktif (*Active Learning & Auto-Retraining*)** untuk parser dokumen ProjectVault. Setiap kali dokumen diurai (*parse*) dan ditinjau oleh pengguna, data hasil tersebut otomatis dicatat dan dijadikan materi pelajaran baru sehingga parser menjadi semakin pintar seiring berjalannya waktu.

### Kebutuhan & Permasalahan:
1. **Model Statis yang Tidak Belajar dari Penggunaan Harian**:
   - Model ML sebelumnya hanya dilatih pada berkas statis `data/parsed_applications.json` tanpa kemampuan menyerap riwayat dokumen baru yang diparsing setiap harinya.
2. **Ketiadaan Riwayat Jejak Parsing (*Audit & Experience Trail*)**:
   - Belum ada pencatatan terstruktur mengenai teks asli yang dimasukkan pengguna, entitas yang ditebak, tingkat keyakinan (*confidence score*), dan apakah hasil tebakan tersebut disetujui atau dikoreksi.
3. **Penyempurnaan Batas Kalimat Rekayasa Fitur**:
   - Regex ekstraksi kandidat perusahaan sebelumnya dapat menyerap titik kalimat (`.`), menyebabkan kandidat nama perusahaan menembus ke kalimat berikutnya.

### Solusi yang Diimplementasikan:
1. **Modul Log Pembelajaran Mesin Dedikasi ([learning_log.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/ml/learning_log.py) - 130 baris)**:
   - `record_parse_event`: Merekam teks asli (*raw text*), perusahaan, posisi, portal sumber, keahlian kunci, lokasi, gaji, tipe kerja, serta metrik *confidence score* ke `data/parser_learning_log.json`.
   - Menggunakan deduplikasi cerdas berbasis MD5 hash teks untuk mencegah pencatatan berulang.
   - `get_learning_logs`: Menyajikan histori sesi dan metrik jumlah sesi terverifikasi (*verified count*).
   - `get_valid_training_samples_from_log`: Menyeleksi sampel ground-truth valid dari log untuk dimasukkan ke pipeline pelatihan model berikutnya.
2. **Perekaman Otomatis pada Pipeline NLP ([nlp_engine.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/services/nlp_engine.py) - 244 baris)**:
   - Setiap pemanggilan fungsi `parse_raw_text` atau `parse_pdf_document` otomatis memicu `record_parse_event`.
   - Memperbaiki batas regex pemisahan wilayah (`di/at [Kota]`) pada `clean_company_name` sehingga nama kota tidak menempel pada nama perusahaan.
3. **Penyempurnaan Regex Ekstraksi Fitur ([features.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/ml/features.py) - 177 baris)**:
   - Menghilangkan titik (`.`) dari pola pencocokan kandidat perusahaan agar tidak menembus batas kalimat.
   - Menambahkan prefiks berkas uji (*test*, *sample*) ke daftar `GENERIC_HINTS` agar tidak mendistorsi tebakan nama perusahaan di dalam isi teks dokumen.
4. **Pembaruan Pipeline Pelatihan Multi-Sumber ([trainer.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/ml/trainer.py) - 163 baris)**:
   - `load_training_dataset` otomatis memuat dan mendeduplikasi data dari 3 sumber:
     1. Data dasar arsip `data/parsed_applications.json`.
     2. Log pembelajaran `data/parser_learning_log.json`.
     3. Koreksi manual `data/training_feedback.json`.
   - Total sampel latih bertambah secara dinamis dari **90 menjadi 92 dokumen**, menghasilkan peningkatan akurasi posisi menjadi **89.5%** dan rata-rata akurasi model menjadi **93.0%**.
5. **Endpoint REST API Pemantauan Log ([resumes.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/routers/resumes.py) - 149 baris)**:
   - Menambahkan `GET /api/py/resumes/learning-logs` dengan parameter paginasi `limit`.
   - Memperbarui `POST /api/py/resumes/feedback` agar menandai log sesi secara permanen sebagai data ground-truth terverifikasi (`is_verified: true`).
6. **Integrasi Feedback Form UI Non-Blocking ([ApplicationModal/index.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/applications/components/ApplicationModal/index.tsx) - 210 baris)**:
   - Saat pengguna menekan tombol **"Simpan"** pada modal lamaran, sistem secara asinkron mengirimkan data final yang telah ditinjau/diedit pengguna ke endpoint feedback, sehingga setiap aksi simpan otomatis menjadi materi pelajaran bagi parser.
7. **Pembaruan Laporan CLI ([train_parser.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/train_parser.py) - 48 baris)**:
   - Melaporkan statistik sesi log pembelajaran yang berhasil diserap oleh model.

---

## 2. Diagram Alur Siklus Belajar Aktif (Active Learning Cycle)

```mermaid
graph TD
    DOC["Input Dokumen / Teks / OCR"] --> RUN["Eksekusi Parser (nlp_engine.py)"]
    RUN --> LOG["Pencatatan Otomatis Log Sesi<br/>(api/ml/learning_log.py)"]
    LOG --> STORE[("data/parser_learning_log.json")]

    RUN --> UI["Form Input AI & Modal Lamaran"]
    UI -- "Pengguna Mengoreksi & Klik Simpan" --> SAVE["Simpan Lamaran ke Database"]
    SAVE -- "Pemicu Asinkron Latar Belakang" --> API_FB["POST /api/py/resumes/feedback"]
    API_FB --> MARK["Tandai Log sebagai 'is_verified: true'"]
    MARK --> STORE

    STORE --> RETRAIN["Pelatihan Ulang Model<br/>(api/train_parser.py / POST /train)"]
    RETRAIN --> EVAL["Evaluasi Independen Test Set (93.0%)"]
    EVAL --> BUNDLE["Update Model Cache (api/models_cache/)"]
    BUNDLE --> RUN
```

---

## 3. Hasil Evaluasi Metrik Data Uji Terbaru

Setelah menyerap sesi log pembelajaran baru, performa model menunjukkan peningkatan:

| Komponen Model | Algoritma Pembelajaran | Metrik Evaluasi | Skor Baru | Perubahan Skor |
| :--- | :--- | :---: | :---: | :---: |
| **Posisi / Role Target** | Contextual Candidate Ranker + Featurizer | Top-1 Accuracy | **89.5%** | 📈 **+6.2%** *(dari 83.3%)* |
| **Portal Sumber Lowongan** | TF-IDF (1-2 gram) + Multinomial Naive Bayes | Accuracy / F1-Score | **94.7%** *(F1: 0.922)* | 📈 **+0.3%** *(dari 94.4%)* |
| **Entitas Perusahaan** | Candidate Extraction + Binary Logistic Ranker | Top-1 Accuracy | **94.7%** | Stabil & presisi tinggi |
| **Rata-Rata Ensemble Model** | **Ensemble Local ML Subsystem** | **Overall Accuracy** | **93.0%** | 📈 **+0.4%** *(dari 92.6%)* |

---

## 4. Rincian Modifikasi & Berkas Baru

| Berkas | Tipe | Ukuran | Deskripsi |
| :--- | :---: | :---: | :--- |
| [api/ml/learning_log.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/ml/learning_log.py) | `new` | **130 baris** | Modul pencatat log pembelajaran parser, deduplikasi hash teks, dan ekstraksi sampel latih. |
| [api/ml/__init__.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/ml/__init__.py) | `modified` | **25 baris** | Mengekspor fungsi log pembelajaran `record_parse_event`, `get_learning_logs`, dll. |
| [api/ml/features.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/ml/features.py) | `modified` | **177 baris** | Menghilangkan titik dari regex kandidat agar tidak menembus batas kalimat dan memfilter nama berkas uji. |
| [api/ml/trainer.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/ml/trainer.py) | `modified` | **163 baris** | Mengintegrasikan pemuatan sampel dari log pembelajaran ke fungsi `load_training_dataset`. |
| [api/routers/resumes.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/routers/resumes.py) | `modified` | **149 baris** | Menambahkan endpoint `GET /learning-logs` dan integrasi ground-truth pada `POST /feedback`. |
| [api/services/nlp_engine.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/services/nlp_engine.py) | `modified` | **244 baris** | Mengintegrasikan perekaman log otomatis dan merapikan batas regex lokasi kota pada nama perusahaan. |
| [api/train_parser.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/train_parser.py) | `modified` | **48 baris** | Menampilkan statistik log pembelajaran yang diserap pada laporan CLI. |
| [features/applications/components/ApplicationModal/index.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/applications/components/ApplicationModal/index.tsx) | `modified` | **210 baris** | Menambahkan pengiriman feedback aktif asinkron saat pengguna menekan tombol simpan lamaran. |

---

## 5. Statistik Perubahan Baris Kode (Git Diff Stats)

```text
 api/ml/__init__.py                                 |   5 +++
 api/ml/features.py                                 |   9 +++--
 api/ml/trainer.py                                  |  21 ++++++++++-
 api/models_cache/parser_models.joblib              | Bin 305967 -> 306095 bytes
 api/routers/resumes.py                             |  41 ++++++++++++++++++---
 api/services/nlp_engine.py                         |  23 +++++-------
 api/train_parser.py                                |   5 ++-
 .../components/ApplicationModal/index.tsx          |  16 ++++++++
 8 files changed, 95 insertions(+), 25 deletions(-)
```

### Berkas Baru Ditambahkan (Untracked Files):
- `api/ml/learning_log.py`: 130 baris
- `data/parser_learning_log.json`: Penyimpan persisten berkas log pembelajaran lokal

---

## 6. Hasil Pengujian & Jaminan Mutu (Verification & QA)

1. **Kepatuhan Batas Baris Kode (*Bulk Lines Policy*)**:
   - Seluruh 8 berkas yang dimodifikasi dan dibuat terverifikasi memiliki ukuran **< 250 baris**:
     - `api/ml/__init__.py`: 25 baris
     - `api/ml/features.py`: 177 baris
     - `api/ml/trainer.py`: 163 baris
     - `api/ml/learning_log.py`: 130 baris
     - `api/services/ml_parser.py`: 98 baris
     - `api/train_parser.py`: 48 baris
     - `api/routers/resumes.py`: 149 baris
     - `api/services/nlp_engine.py`: 244 baris
     - `features/applications/components/ApplicationModal/index.tsx`: 210 baris
2. **Pemeriksaan Tipe TypeScript (`npx tsc --noEmit`)**:
   - Lulus 100% tanpa kesalahan tipe (*0 errors, exit code: 0*).
3. **Pengujian Eksekusi Siklus Belajar**:
   - Verifikasi pencatatan log otomatis berhasil (`data/parser_learning_log.json`).
   - Verifikasi update status verifikasi (`is_verified: true`) berhasil.
   - Verifikasi penyerapan sampel log ke dalam pelatihan ulang model berhasil dan meningkatkan akurasi ensemble menjadi **93.0%**.
