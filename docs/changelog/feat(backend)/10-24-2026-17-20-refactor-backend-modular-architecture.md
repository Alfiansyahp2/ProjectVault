# Changelog: Python Backend Modular Architecture Refactoring

**Tanggal:** 2026-10-24  
**Waktu:** 17:20 WIB  
**Branch:** `feat/backend`  
**Nama Commit:** `refactor(backend): modularize python api into models, services, and routers architecture` (`10-24-2026-17-20-refactor-backend-modular-architecture`)  
**Tipe Perubahan:** `refactor` (Clean Architecture, Separation of Concerns & Code Modularization)

---

## 1. Ringkasan Perubahan (Executive Summary)

Perubahan ini melakukan perombakan arsitektural menyeluruh (*comprehensive refactoring*) pada kode Python backend di folder `api/`. Kode yang sebelumnya terakumulasi secara monolitik (*bulk lines*) di [api/index.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/index.py) (**436 baris**) kini dipecah secara elegan mengikuti prinsip desain *Single Responsibility Principle* (SRP) dan *Separation of Concerns* (SoC):

1. **Pemangkasan Berkas Monolitik (*Bulk Reduction*):**
   - Berkas [api/index.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/index.py) dipangkas dari **436 baris** menjadi **hanya 47 baris**, difokuskan murni sebagai *application entrypoint* FastAPI.
2. **Pemisahan Lapisan Domain Bersih (*Clean Layered Separation*):**
   - **`api/config.py`**: Menyimpan konfigurasi dan konstanta taksonomi domain terpusat.
   - **`api/models/`**: Memisahkan skema data Pydantic berdasarkan domain fungsional (*projects*, *job analysis*, dan *resumes*).
   - **`api/services/`**: Memisahkan seluruh algoritma cerdas, pemrosesan teks, scoring kecocokan portofolio, dan Document Intelligence.
   - **`api/routers/`**: Memisahkan kontroler endpoint HTTP FastAPI per domain modul.
3. **Kompatibilitas Penuh (*Backward Compatibility*):**
   - Berkas [api/nlp_engine.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/nlp_engine.py) dipertahankan sebagai modul pembungkus (*re-export wrapper*) agar skrip pengujian atau import yang sudah ada tetap berjalan tanpa modifikasi.

---

## 2. Struktur Arsitektur Baru

```
api/
├── __init__.py               # Inisialisasi package API
├── index.py                  # Entrypoint FastAPI (<48 baris: init app, CORS, mount router)
├── config.py                 # Konstanta taksonomi, kamus bulan multi-bahasa & portal
├── models/                   # Definisi Pydantic schemas terpisah per domain
│   ├── __init__.py           # Unified model export
│   ├── project.py            # ProjectItem, MasterPromptRequest
│   ├── job_analysis.py       # AnalyzeJobRequest, MatchedProject, AnalyzeJobResponse
│   └── resume.py             # ResumeItem, ParseSinglePdfRequest, ExportResumesRequest
├── services/                 # Core AI, NLP & business logic
│   ├── __init__.py           # Unified service export
│   ├── analyzer.py           # Ekstraksi skill, scoring proyek & generator cover letter
│   ├── prompt_builder.py     # Generator master prompt anti-lupa AI
│   └── nlp_engine.py         # Document Intelligence, PDF extraction & entity parser
├── routers/                  # Kontroler rute FastAPI modular
│   ├── __init__.py           # Unified router export
│   ├── analyzer.py           # POST /api/py/analyze-job, POST /api/py/master-prompt
│   └── resumes.py            # GET /scan, POST /export, POST /parse-file
└── nlp_engine.py             # Backward-compatible wrapper (agar import lama tidak rusak)
```

---

## 3. Rincian Perubahan per Berkas

### A. [api/index.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/index.py) *(Direfaktor Menjadi 47 Baris)*
- Bertanggung jawab hanya untuk:
  - Inisialisasi objek `app = FastAPI(...)`.
  - Pemasangan middleware CORS.
  - Pendaftaran router terpusat via `app.include_router(analyzer_router)` dan `app.include_router(resumes_router)`.
  - Handler endpoint kesehatan `GET /api/py/health`.

### B. [api/config.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/config.py) *(Berkas Baru - 55 Baris)*
- `TECH_KEYWORDS`: Taksonomi komprehensif lebih dari 100 bahasa pemrograman, framework, basis data, tools DevOps, dan keahlian data/AI.
- `MONTHS_MAP`: Pemetaan normalisasi nama bulan bahasa Indonesia dan Inggris ke angka dua digit.
- `PORTALS`: Pola deteksi multi-kelas portal rekrutmen (*Jobstreet*, *LinkedIn*, *Glints*, *Kalibrr*, dll).

### C. Modul Skema Data `api/models/` *(Berkas Baru)*
- [project.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/models/project.py): Mendefinisikan `ProjectItem` dan `MasterPromptRequest`.
- [job_analysis.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/models/job_analysis.py): Mendefinisikan `AnalyzeJobRequest`, `MatchedProject`, dan `AnalyzeJobResponse`.
- [resume.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/models/resume.py): Mendefinisikan `ResumeItem`, `ParseSinglePdfRequest`, dan `ExportResumesRequest`.
- [__init__.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/models/__init__.py): Mengekspor seluruh model secara terpadu.

### D. Modul Layanan Domain `api/services/` *(Berkas Baru)*
- [analyzer.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/services/analyzer.py):
  - `extract_keywords_from_text()`: Ekstraksi skill teknis berbasis regex word-boundary.
  - `calculate_project_match()`: Algoritma scoring relevansi proyek portofolio terhadap syarat lowongan.
  - `generate_cover_letter()`: Penyusun draf surat lamaran berbasis bukti proyek.
  - `analyze_job_posting()`: Orkestrator analisis lowongan kerja dan identifikasi skill gap.
- [prompt_builder.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/services/prompt_builder.py):
  - `build_ai_prompt()`: Penyusun mega-prompt kontekstual untuk simulasi interview dan review CV.
  - `build_master_prompt()`: Penyusun database prompt portofolio resmi pelamar.
- [nlp_engine.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/services/nlp_engine.py):
  - Seluruh logika Document Intelligence, ekstraksi PDF layout-aware via `pypdf`, normalizer tanggal ISO, NER perusahaan & posisi, serta ringkasan AI ekstraktif.
- [__init__.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/services/__init__.py): Unified re-export layanan domain.

### E. Modul Kontroler Rute `api/routers/` *(Berkas Baru)*
- [analyzer.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/routers/analyzer.py): Menangani endpoint analisis lowongan kerja dan master prompt generator.
- [resumes.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/routers/resumes.py): Menangani endpoint scanning berkas PDF resume, ekspor batch ke JSON, dan parsing on-demand berkas tunggal.
- [__init__.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/routers/__init__.py): Unified export router FastAPI.

### F. [api/nlp_engine.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/nlp_engine.py) *(Wrapper)*
- Disederhanakan menjadi 47 baris sebagai pembungkus kompatibilitas yang meneruskan pemanggilan ke `api.services.nlp_engine`.

---

## 4. Hasil Verifikasi & Uji Kinerja

1. **Uji Validasi OpenAPI Endpoint:**
   Seluruh 6 rute API terdaftar sempurna pada skema OpenAPI FastAPI:
   - `POST /api/py/analyze-job`
   - `POST /api/py/master-prompt`
   - `GET  /api/py/resumes/scan`
   - `POST /api/py/resumes/export`
   - `POST /api/py/resumes/parse-file`
   - `GET  /api/py/health`
2. **Uji Fungsional Service & Scanning:**
   - Evaluasi pencocokan skill menghasilkan kalkulasi yang akurat (`Match: 80%`).
   - Pemindaian berkas PDF `data/` sukses mengenali seluruh 91 berkas tanpa *runtime exception*.
3. **Uji Kompilasi Frontend (`npm run build`):**
   - Kompilasi Turbopack Next.js 16.4.3 sukses dalam **2.4 detik**.
   - Pengecekan TypeScript selesai tanpa *error* dalam **4.8 detik**.
   - Seluruh 8 rute halaman statis ter-prerender sempurna.
