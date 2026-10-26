# Changelog: AI Job Analyzer Multi-Factor NLP Matching, Interview Strategy, & Cover Letter Studio

**Tanggal:** 2026-10-26  
**Waktu:** 06:30 WIB  
**Branch:** `feat/backend-ai-analysis`  
**Nama Commit:** `feat(backend/ai_analysis): implement multi-factor matching, interview strategy tips, and interactive cover letter studio` (`10-26-2026-06-30-feat-backend-ai-analysis-advanced-matching-and-cover-letter-studio`)  
**Tipe Perubahan:** `feat` (Domain Taxonomy Expansion, Multi-Factor Scoring, Dynamic Cover Letter Studio, & Interactive Analyzer UX)

---

## 1. Ringkasan Perubahan (Executive Summary)

Perubahan pada branch `feat/backend-ai-analysis` ini menghadirkan peningkatan menyeluruh pada fitur **AI & Analisis** (`/analyzer`) baik pada mesin backend Python (FastAPI + NLP Engine) maupun pada antarmuka frontend Next.js 16. Pembaruan ini mengubah penganalisis lowongan sederhana menjadi **Career Intelligence & Tailored Cover Letter Studio** yang canggih:

1. **Taksonomi Terkategori & Normalisasi Sinonim 8 Domain ([api/config.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/config.py)):**
   - Menambahkan `CATEGORIZED_TAXONOMY` yang mengelompokkan ratusan kata kunci teknologi ke dalam 8 domain: *Languages, Frontend, Backend, Databases & Cache, Cloud & DevOps, AI & Data, Mobile,* dan *Architecture & Quality*.
   - Menyediakan kamus `KEYWORD_SYNONYMS` untuk menyelaraskan sinonim (misal: `nextjs` ↔ `next.js`, `postgres` ↔ `postgresql`, `go language` ↔ `golang`, `amazon web services` ↔ `aws`).

2. **Algoritma Kecocokan Multi-Faktor & Evaluasi Kualitatif ([api/services/analyzer.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/services/analyzer.py)):**
   - Mengganti pencocokan flat rasio sederhana dengan algoritma berbobot 4 pilar:
     - *Technical Stack Alignment (Bobot 45%)*
     - *Role & Seniority Relevance (Bobot 25%)*
     - *Quantifiable Achievements & Metrics (Bobot 15%)*
     - *Domain & Context Overlap (Bobot 15%)*
   - Menghasilkan tingkat kecocokan kualitatif (*Match Tier*: `Sangat Cocok`, `Peluang Kuat`, `Potensial`, `Tantangan Portofolio`) serta ringkasan eksekutif (*Match Summary*).

3. **Generator Strategi Wawancara & Poin Bicara (*Interview Talking Points*):**
   - Menghasilkan panduan taktis untuk pelamar:
     - Cara mengangkat proyek portofolio terbaik sebagai bukti konkret.
     - Cara percaya diri menjawab dan memitigasi *skill gaps* dengan narasi pemahaman fondasi dan adaptasi cepat.
     - Pertanyaan bernilai tinggi (*reverse interview question*) untuk diajukan ke tim rekruter/engineering lead.

4. **Studio Generator Surat Lamaran 4 Gaya Bahasa (*Multi-Tone & Multi-Language Engine*):**
   - Mendukung 4 gaya bahasa (*Tone*):
     - `profesional`: Formal, berwibawa, menekankan arsitektur dan hasil kerja.
     - `antusias`: Berenergi tinggi, motivasi produk, dan *ownership* kuat.
     - `ringkas`: Format poin-poin padat (*bullet-driven*), langsung ke inti, dapat dibaca dalam 30 detik.
     - `teknikal`: Pembahasan teknis mendalam mengenai arsitektur sistem, skalabilitas, dan *trade-offs*.
   - Mendukung dua bahasa: Bahasa Indonesia (`id`) dan English (`en`).
   - Menyediakan endpoint cepat `POST /api/py/generate-cover-letter` agar pengguna dapat berganti *tone* secara instan dalam hitungan milidetik.

5. **Penyempurnaan Antarmuka Pengguna (*UI/UX Modernization*):**
   - Menyediakan **Preset Lowongan Cepat (Uji 1-Klik)** untuk skenario Fullstack, Backend Go/Python, Frontend React UI, dan AI Engineer.
   - Tombol cepat **Tempel dari Clipboard** dan **Reset Form**.
   - Indikator visual meter lingkaran (*animated circular SVG gauge*) dengan warna dinamis sesuai tier skor.
   - Akordeon taksonomi domain keahlian terdeteksi vs kesenjangan (*skill gaps*).
   - Fitur **Unduh (.txt)** surat lamaran dan tombol **Simpan ke Pelacak Lamaran** dengan konfirmasi sukses.
   - Pratinjau *Mega-Prompt* anti-halusinasi yang dapat dibuka/tutup untuk AI eksternal (ChatGPT, Claude 3.7, DeepSeek, Gemini).

---

## 2. Rincian Modifikasi Kode

| Komponen | Berkas | Deskripsi Perubahan |
| :--- | :--- | :--- |
| **Backend Config** | [api/config.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/config.py) | Menambahkan `CATEGORIZED_TAXONOMY`, `KEYWORD_SYNONYMS`, dan ekspansi kata kunci modern. |
| **Backend Models** | [api/models/job_analysis.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/models/job_analysis.py) | Menambahkan skema `GenerateCoverLetterRequest` dan memperluas `AnalyzeJobResponse` (`match_tier`, `match_summary`, `categorized_skills`, `interview_tips`). |
| **Backend Service** | [api/services/analyzer.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/services/analyzer.py) | Mengimplementasikan algoritma multi-faktor, taksonomi grouping, generator interview tips, dan 4 template gaya bahasa surat dwibahasa. |
| **Backend Router** | [api/routers/analyzer.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/routers/analyzer.py) | Mengekspos endpoint baru `POST /api/py/generate-cover-letter` untuk re-toning instan. |
| **Frontend Constants** | [features/analyzer/constants.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/analyzer/constants.ts) | Mendefinisikan preset lowongan uji 1-klik (`SAMPLE_JOB_PRESETS`), opsi tone, dan bahasa. |
| **Frontend Card** | [features/analyzer/components/JobInputCard.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/analyzer/components/JobInputCard.tsx) | Menambahkan chip preset 1-klik, tempel clipboard, reset form, serta penghitung karakter/kata. |
| **Frontend Breakdown** | [features/analyzer/components/SkillsMatchBreakdown.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/analyzer/components/SkillsMatchBreakdown.tsx) | Menambahkan visual gauge SVG melingkar, tier badge, kartu strategi interview, dan akordeon kategori domain. |
| **Frontend Studio** | [features/analyzer/components/CoverLetterGeneratorCard.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/analyzer/components/CoverLetterGeneratorCard.tsx) | Menambahkan toolbar tone switcher, language switcher, tombol unduh berkas .txt, dan animasi re-toning. |
| **Frontend AI Prompt** | [features/analyzer/components/ExternalAiPromptCard.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/analyzer/components/ExternalAiPromptCard.tsx) | Menambahkan pratinjau teks prompt yang dapat dilipat (*collapsible preview*) dan instruksi pemakaian. |
| **Frontend Controller** | [features/analyzer/components/AnalyzerView.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/analyzer/components/AnalyzerView.tsx) | Mengintegrasikan state re-toning cepat, download text blob, dan pencatatan lamaran ke Kanban. |

---

## 3. Hasil Pengujian & Verifikasi

1. **Uji API Python Endpoint:**
   - `POST /api/py/analyze-job`: Berhasil mengembalikan status HTTP 200, ekstraksi 21 skills, pengelompokan domain, perhitungan multi-faktor skor, dan draf surat lamaran.
   - `POST /api/py/generate-cover-letter`: Berhasil mengembalikan draf baru dalam gaya bahasa *Ringkas* dalam waktu < 200ms tanpa menghitung ulang NLP.
2. **Uji Kompilasi TypeScript & Next.js Build:**
   - Perintah `npm run build` sukses 100% tanpa error (`Exit Code: 0`). Seluruh rute statis termasuk `/analyzer` ter-prerender dengan optimal.
3. **Uji Interaktif End-to-End di Browser:**
   - Berhasil memuat halaman `/analyzer`.
   - Menekan preset "Fullstack Next.js & Node" langsung mengisi seluruh kolom form.
   - Analisis menghasilkan skor kecocokan visual lengkap dengan gauge dan tier.
   - Mengganti gaya bahasa surat ke "Ringkas" secara *live* langsung memperbarui textarea draf.
   - Menekan tombol "Simpan ke Pelacak" berhasil mencatat entitas baru ke Kanban board.
