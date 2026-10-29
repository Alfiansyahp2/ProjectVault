# Changelog: Implementasi Sistem Rekomendasi Portofolio Berbasis Hibrida AHP-SAW

**Tanggal:** 2026-10-29  
**Waktu:** 20:40 WIB  
**Branch:** `feat/backend-ai-analysis`  
**Nama Fitur:** `feat(backend/ai-analysis): implement hybrid ahp-saw portfolio matching engine and criteria breakdown`  
**Tipe Perubahan:** `feat` / `refactor` / `docs` (Multi-Criteria Decision Analysis, AHP Weight Calibration, SAW Linear Aggregation, UI Componentization, Bulk Lines Guard)

---

## 1. Ringkasan & Latar Belakang (Executive Summary)

Sebelumnya, penentuan skor kesesuaian proyek portofolio terhadap lowongan kerja pada [api/services/match_engine.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/services/match_engine.py) menggunakan pembobotan heuristik ad-hoc (45%, 25%, 15%, 15%) tanpa pembuktian matematis serta tanpa memberikan transparansi rincian skor kepada pengguna.

Perubahan ini menerapkan metodologi **Multi-Criteria Decision Analysis (MCDA)** hibrida:
1. **Fase Desain (AHP - Analytic Hierarchy Process):** Menetapkan bobot ilmiah 4 kriteria benefit berlandaskan skala Saaty dengan uji rasio konsistensi $CR = 0.0023 \ll 0.10$.
2. **Fase Runtime (SAW - Simple Additive Weighting):** Menjalankan normalisasi benefit $r_{ij} \in [0, 1]$ dan agregasi skor linier instan $S_i = \sum w_j \cdot r_{ij} \times 100$ secara offline 100% tanpa external API.
3. **Transparansi UI:** Menyajikan visualisasi *Score Breakdown* 4 kriteria pada setiap kartu portofolio.

---

## 2. Rincian Perubahan Berkas & Komponen

| Berkas | Perubahan | Baris | Detail Implementasi |
| :--- | :---: | :---: | :--- |
| [api/models/job_analysis.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/models/job_analysis.py) | `modified` | 48 | Menambahkan model Pydantic `ScoreBreakdown` (tech_stack, description, role_domain, complexity) dan menyematkannya ke `MatchedProject`. |
| [api/services/match_engine.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/services/match_engine.py) | `modified` | 212 | Mendefinisikan konstanta `AHP_WEIGHTS`, normalisasi benefit $r_{\text{tech}}, r_{\text{desc}}, r_{\text{role}}, r_{\text{qual}}$, kalkulasi SAW, serta return `ScoreBreakdown`. |
| [api/services/analyzer.py](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/api/services/analyzer.py) | `modified` | 141 | Menangkap `breakdown` dari `calculate_project_match` dan menginjeksi ke respons `MatchedProject`. |
| [lib/types.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/lib/types.ts) | `modified` | 80 | Menambahkan antarmuka TypeScript `ScoreBreakdown` dan field opsional `score_breakdown?: ScoreBreakdown` pada `MatchedProject`. |
| [features/analyzer/components/MatchedProjectCard.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/analyzer/components/MatchedProjectCard.tsx) | `new` | 92 | Komponen modular kartu proyek yang menampilkan judul, peran, metrik skor, mini-badges 4 kriteria AHP-SAW, alasan relevansi, dan tautan demo/repo. |
| [features/analyzer/components/SkillsMatchBreakdown.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/features/analyzer/components/SkillsMatchBreakdown.tsx) | `refactor` | 194 | Memindahkan render kartu proyek ke `<MatchedProjectCard />`, merampingkan ukuran berkas dari 248 baris ke 194 baris (aman dari batas 250 baris). |
| [README.md](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/README.md) | `modified` | 87 | Menambahkan bab dokumentasi publik `🧠 Metode Perhitungan Kecocokan: Hibrida AHP-SAW` beserta tautan ke dokumen metodologi. |

---

## 3. Formulasi Matematis yang Diimplementasikan

### A. Vektor Bobot Prioritas AHP ($W$)
$$\mathbf{W} = \begin{bmatrix} w_1 \text{ (Core Tech Stack)} \\ w_2 \text{ (Feature \& Context)} \\ w_3 \text{ (Role \& Domain)} \\ w_4 \text{ (Complexity \& Quality)} \end{bmatrix} = \begin{bmatrix} 0.37 \\ 0.28 \\ 0.20 \\ 0.15 \end{bmatrix}, \quad \sum_{j=1}^{4} w_j = 1.00$$

### B. Normalisasi Kriteria Benefit ($R = [r_{ij}]$)
1. **$C_1$ (Tech Stack):**
   $$r_{\text{tech}} = \min\left(1.0, \frac{|\text{matched\_skills}|}{\max(|\text{job\_skills}|, 1)} \times 1.25\right)$$
2. **$C_2$ (Feature & Context):**
   $$r_{\text{desc}} = \min\left(1.0, \max\left(0.20, \frac{\text{domain\_overlap}}{12.0}\right)\right)$$
3. **$C_3$ (Role & Architecture):**
   - $r_{\text{role}} = 1.0$ (Kecocokan token spesialisasi ganda / judul persis)
   - $r_{\text{role}} = 0.85$ (Kecocokan 1 token peran inti)
   - $r_{\text{role}} = 0.70$ (Kecocokan kategori domain)
   - $r_{\text{role}} = 0.40$ (Baseline rekayasa perangkat lunak)
4. **$C_4$ (Complexity & Quality Proof):**
   - $base = 0.85$ (Jika memuat metrik kuantitatif efisiensi/persentase)
   - $base = 0.65$ (Jika memuat teks capaian > 20 karakter)
   - Bonus $+0.10$ untuk `repo_url` dan $+0.10$ untuk `demo_url` ($\max 1.0$)

### C. Agregasi Linier Model SAW ($S_i$)
$$S_i = (0.37 \cdot r_{i1} + 0.28 \cdot r_{i2} + 0.20 \cdot r_{i3} + 0.15 \cdot r_{i4}) \times 100$$
$$\text{Final Score} = \min(98, \max(20, \text{round}(S_i)))$$

---

## 4. Hasil Pengujian & Verifikasi

### A. Simulasi Multi-Alternatif Proyek
Pengujian dilakukan menggunakan runtime Python `.venv/Scripts/python.exe`:
- **Alternatif 1 (FlowForge API - Backend Spesifik):**
  - Skor: **78%** | Breakdown: Stack 100%, Konteks 20%, Role 100%, Kualitas 100%.
  - Terpilih sebagai rekomendasi prioritas 1.
- **Alternatif 2 (EduERP - Fullstack General):**
  - Skor: **46%** | Breakdown: Stack 25%, Konteks 20%, Role 85%, Kualitas 95%.
- **Alternatif 3 (Minimal Portfolio - Frontend):**
  - Skor: **23%** | Breakdown: Stack 0%, Konteks 20%, Role 40%, Kualitas 65%.

### B. Type Safety & Bulk Lines Guard
- **`npx tsc --noEmit`:** 0 error (Exit code 0).
- **Audit Baris Berkas:** Tidak ada berkas yang melanggar batas 250 baris (semua $\le 212$ baris).
- **Zero Cloud API:** 100% diproses secara deterministik dan offline di laptop pengguna.

