# Changelog: Resolusi Audit Menyeluruh Subsistem Backend, Parser ML, dan Sinkronisasi Data (AUD-CRIT-02, AUD-HIGH-05 s/d AUD-HIGH-07, AUD-MED-06 s/d AUD-MED-08, AUD-LOW-01/02)

**Tanggal:** 2026-10-28  
**Waktu:** 06:45 WIB  
**Branch:** `feat/backend-audit`  
**Nama Commit / Fitur:** `feat(backend/audit): resolve concurrency file io and ml subsystem flaws` (`10-28-2026-06-45-feat-backend-audit-resolve-concurrency-file-io-and-ml-subsystem-flaws`)  
**Tipe Perubahan:** `fix` / `perf` / `security` (Atomic File I/O, Subprocess Binary Resolution, ML Graceful Degradation, Race Condition Protection, Windows UTF-8 Support)

---

## 1. Ringkasan Temuan Audit & Resolusi (Executive Summary)

Audit menyeluruh ini mengidentifikasi dan menuntaskan **9 potensi risiko kegagalan runtime, race condition, dan diskrupsi logika** pada subsistem backend FastAPI, Next.js API Routes, serta modul Machine Learning lokal:

| Kode Temuan | Tingkat Keparahan | Komponen Terdampak | Deskripsi Masalah | Solusi yang Diterapkan |
| :--- | :--- | :--- | :--- | :--- |
| **AUD-CRIT-02** | **CRITICAL** | [sync/route.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/app/api/applications/sync/route.ts) | Subprocess `python` memanggil Python sistem tanpa modul `joblib`/`sklearn`, menyebabkan HTTP 500 saat sinkronisasi | Menambahkan `getPythonBin(cwd)` untuk memprioritaskan `.venv/Scripts/python.exe` secara otomatis |
| **AUD-HIGH-05** | **HIGH** | [learning_log.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/ml/learning_log.py), [trainer.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/ml/trainer.py), [resumes.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/routers/resumes.py) | Penulisan file JSON non-atomik (`open("w")`) berisiko mengosongkan/merusak data saat ada konkurensi | Mengimplementasikan `atomic_write_json` dengan temporary file + `os.replace` + `fsync` |
| **AUD-HIGH-06** | **HIGH** | [config.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/config.py), [learning_log.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/ml/learning_log.py) | Jalur relatif (`data/...`) bergantung pada CWD proses pemanggil, rentan `FileNotFoundError` | Sentralisasi `BASE_DIR` absolut dan anchor seluruh jalur data/cache ke project root |
| **AUD-HIGH-07** | **HIGH** | [ml_parser.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/services/ml_parser.py) | Import kaku `sklearn` & `joblib` menyebabkan kegagalan total parser heuristik jika library ML absen | Menambahkan blok `try...except ImportError` dengan fallback transparan (`HAS_ML_DEPS = False`) |
| **AUD-MED-06** | **MEDIUM** | [trainer.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/ml/trainer.py), [ml_parser.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/services/ml_parser.py) | `predict_proba` crash (`IndexError`) jika dataset biner hanya memiliki 1 kelas (`[:, 1]`) | Proteksi saldo kelas (`class balance guard`) dan indexing aman dimensi probabilitas |
| **AUD-MED-07** | **MEDIUM** | [features.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/ml/features.py) | `in_perihal` bug (`idx == -1` memicu slice `text[:-1]`) dan ekstraksi kandidat tanpa batas panjang teks | Memperbaiki kondisi `0 <= idx < 250` dan membatasi scan regex hingga 12.000 karakter awal |
| **AUD-MED-08** | **MEDIUM** | [resumes.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/routers/resumes.py) | Penumpukan umpan balik tanpa batas (unbounded feedback) berpotensi memicu lonjakan memori | Menerapkan sliding window maksimal 1.000 entri dan pemangkasan teks hingga 8.000 karakter |
| **AUD-LOW-01** | **LOW** | [batch_parser.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/batch_parser.py), [parse_single.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/parse_single.py) | Error encoding stdout pada console Windows non-UTF8 saat mencetak karakter tipografi (`—`, `•`) | Mengonfigurasi `sys.stdout.reconfigure(encoding="utf-8")` pada seluruh CLI runner |
| **AUD-LOW-02** | **LOW** | [ApplicationModal/index.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/applications/components/ApplicationModal/index.tsx) | Portal sumber terabaikan dan selalu fallback ke `'Direct / Other'` saat form disimpan | Memprioritaskan pengiriman `parsedResult.source_portal` ke endpoint feedback |

---

## 2. Rincian Teknis Implementasi Perbaikan

### A. Subprocess Python Execution Resilience (AUD-CRIT-02)
Pada [app/api/applications/sync/route.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/app/api/applications/sync/route.ts), fungsi pembantu `getPythonBin(cwd)` ditambahkan. Jika file `.venv/Scripts/python.exe` (Windows) atau `.venv/bin/python` (Linux) ditemukan, subprocess dipaksa berjalan di lingkungan virtual environment proyek yang memuat pustaka machine learning.

### B. Atomic File Writing & CWD Independence (AUD-HIGH-05, AUD-HIGH-06)
Pada [api/config.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/config.py), dibuat helper `atomic_write_json(file_path, data)`. Pola penulisan menggunakan file temporer dengan PID proses, `f.flush()`, `os.fsync()`, lalu penggantian atomik dengan `os.replace()`. Seluruh path file didefinisikan secara absolut berbasis `BASE_DIR = os.path.abspath(...)`.

### C. Graceful ML Degradation (AUD-HIGH-07)
Pada [api/services/ml_parser.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/services/ml_parser.py), dependensi `sklearn` dan `joblib` dimuat dalam blok `try...except`. Apabila dependensi belum terpasang, flag `HAS_ML_DEPS = False` aktif dan `predict_with_ml` mengembalikan `{"ml_available": False}` tanpa error. Mesin NLP regex heuristik pada [nlp_engine.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/services/nlp_engine.py) tetap bekerja 100% normal.

### D. Single-Class Protection & Probability Bounds (AUD-MED-06)
Pada [api/ml/trainer.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/ml/trainer.py), target ranking biner divalidasi `if len(set(y_train)) < 2:` dan ditambahkan sampel penyeimbang sintetis untuk mencegah `ValueError` dari `LogisticRegression`. Indexing probabilitas diproteksi dengan `probs[:, 1] if probs.shape[1] > 1 else probs[:, 0]`.

### E. Bounds Sanitization & Indexing Fix (AUD-MED-07, AUD-MED-08)
Pada [api/ml/features.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/ml/features.py), parameter `text` dibatasi hingga 12.000 karakter awal untuk menghindari CPU overhead pada dokumen PDF besar. Kondisi `in_perihal` dikoreksi menjadi `0 <= idx < 250 and 'perihal' in text_l[:idx]`.

---

## 3. Hasil Pengujian & Verifikasi

1. **TypeScript Type Safety Check:**
   - Perintah: `npx tsc --noEmit`
   - Hasil: **Exit code 0** (0 errors / type mismatch).
2. **Evaluasi Pipeline Training Machine Learning:**
   - Perintah: `.venv\Scripts\python.exe api/train_parser.py`
   - Sampel Dilatih: 92 dokumen
   - Akurasi Posisi (Job Title): **89.5%**
   - Akurasi Portal Sumber: **94.7% (F1: 0.922)**
   - Akurasi Entitas Perusahaan: **94.7%**
   - Akurasi Rata-rata Model: **93.0%**
3. **Ekstraksi PDF Tunggal Terverifikasi:**
   - Perintah: `.venv\Scripts\python.exe api/parse_single.py "data/resume/surat lamaran_cmlabs.pdf"`
   - Hasil: Ekstraksi presisi (`cmlabs`, `Backend Developer`, `confidence: 0.8369`) tanpa galat decoding UTF-8.
4. **Verifikasi Endpoint FastAPI:**
   - `GET /api/py/health` -> HTTP 200 (`healthy`).
   - `GET /api/py/resumes/model-status` -> HTTP 200 (`is_trained: true`, akurasi 93.0%).
   - `GET /api/py/resumes/learning-logs` -> HTTP 200 (Menampilkan log terdaftar).

---

## 4. Kepatuhan Batasan Arsitektur
- Seluruh file yang dimodifikasi (`config.py`, `features.py`, `trainer.py`, `learning_log.py`, `ml_parser.py`, `resumes.py`, `batch_parser.py`, `parse_single.py`, `train_parser.py`, `sync/route.ts`, `ApplicationModal/index.tsx`) **terjaga ketat di bawah 250 baris kode**.
- Sistem beroperasi **100% lokal dan offline (Zero Cloud API)** tanpa ketergantungan API key eksternal.
