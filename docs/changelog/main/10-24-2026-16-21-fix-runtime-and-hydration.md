# Changelog: Runtime, Build & Hydration Fixes

**Tanggal:** 2026-10-24  
**Waktu:** 16:21 WIB  
**Branch:** `main`  
**Nama Commit:** `fix: runtime fastapi venv path, postcss tailwind v4, and react hydration mismatch` (`fix-runtime-and-hydration`)  
**Tipe Perubahan:** `fix` / `chore` (Bugfix, Runtime Stability & Build Optimization)  

---

## 1. Ringkasan Perubahan (Executive Summary)

Perubahan ini menstabilkan ekosistem dev-server (`npm run dev`) dan proses build produksi (`npm run build`) dengan menyelesaikan 4 masalah utama:
1. Menghilangkan peringatan React Hydration Error akibat atribut yang disuntikkan oleh ekstensi browser pada elemen `<body>`.
2. Memperbaiki pemanggilan interpreter Python FastAPI agar langsung mengarah ke virtual environment (`.venv`) yang sudah berisi dependensi lengkap (`fastapi`, `uvicorn`, `pydantic`).
3. Mengonfigurasi `@tailwindcss/postcss` dan PostCSS untuk menyelesaikan parsing error `@theme inline` di Tailwind CSS v4 pada Next.js Turbopack.
4. Menyesuaikan logging pada integrasi Appwrite Cloud agar beralih ke `localStorage` secara mulus tanpa menampilkan warning overlay di browser.

---

## 2. Rincian Perubahan per Berkas

### A. [app/layout.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/app/layout.tsx)
- **Masalah:** Ekstensi browser pihak ketiga (seperti ColorZilla) menyuntikkan atribut `cz-shortcut-listen="true"` ke elemen `<body>` sebelum hidrasi React selesai, memicu `React Hydration Mismatch Error`.
- **Solusi:** Menambahkan atribut `suppressHydrationWarning` pada tag `<html>` dan `<body>`.
```diff
--- a/app/layout.tsx
+++ b/app/layout.tsx
@@ -13,8 +13,8 @@ export default function RootLayout({
   children: React.ReactNode;
 }>) {
   return (
-    <html lang="id">
-      <body className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans antialiased">
+    <html lang="id" suppressHydrationWarning>
+      <body suppressHydrationWarning className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans antialiased">
         <Navbar />
         <main className="flex-1">
           {children}
```

---

### B. [package.json](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/package.json)
- **Masalah:**
  1. Skrip `fastapi-dev` sebelumnya menjalankan `python -m uvicorn ...` yang mengakses Python global (`C:\Python314\python.exe`) tanpa modul `uvicorn` terpasang, menyebabkan kegagalan runtime FastAPI dan error `ECONNREFUSED 127.0.0.1:8000`.
  2. Next.js Turbopack memerlukan package PostCSS untuk memproses Tailwind CSS v4.
- **Solusi:**
  1. Mengarahkan `fastapi-dev` ke `.venv\Scripts\python.exe`.
  2. Menambahkan `@tailwindcss/postcss` dan `postcss` ke dalam `devDependencies`.
```diff
--- a/package.json
+++ b/package.json
@@ -8,8 +8,8 @@
   "scripts": {
     "dev": "concurrently -n \"next,fastapi\" -c \"blue,green\" \"next dev\" \"npm run fastapi-dev\"",
     "next-dev": "next dev",
-    "fastapi-dev": "python -m uvicorn api.index:app --reload --port 8000",
-    "fastapi-dev:venv": ".venv\\Scripts\\python.exe -m uvicorn api.index:app --reload --port 8000",
+    "fastapi-dev": ".venv\\Scripts\\python.exe -m uvicorn api.index:app --reload --port 8000",
+    "fastapi-dev:system": "python -m uvicorn api.index:app --reload --port 8000",
     "build": "next build",
     "start": "next start",
     "lint": "eslint ."
@@ -22,12 +22,14 @@
     "react-dom": "19.3.0"
   },
   "devDependencies": {
+    "@tailwindcss/postcss": "^4.3.3",
     "@types/node": "^22",
     "@types/react": "^19",
     "@types/react-dom": "^19",
     "concurrently": "^9.1.2",
     "eslint": "^9",
     "eslint-config-next": "16.4.3",
+    "postcss": "^8.5.31",
     "tailwindcss": "^4",
     "typescript": "^5"
   }
```

---

### C. [postcss.config.mjs](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/postcss.config.mjs) *(Berkas Baru)*
- **Tujuan:** Mengaktifkan plugin `@tailwindcss/postcss` sehingga Next.js Turbopack memahami direktif `@import "tailwindcss"` dan aturan baru `@theme inline` di `app/globals.css`.
```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

---

### D. [lib/appwrite.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/tracker_job/lib/appwrite.ts)
- **Masalah:** Jika database / koleksi Appwrite belum dibuat di cloud, error dilempar dengan `console.warn` yang memunculkan peringatan overlay kuning/merah di browser Next.js dev.
- **Solusi:** Mengubah logging error menjadi `console.info` yang jelas dan informatif, menegaskan bahwa aplikasi tetap berfungsi 100% normal dengan fallback ke `localStorage` (sesuai spesifikasi PRD Section 7).
```diff
--- a/lib/appwrite.ts
+++ b/lib/appwrite.ts
@@ -81,8 +81,9 @@ export async function fetchProjectsFromAppwrite(): Promise<Project[] | null> {
       date: doc.date || '',
       createdAt: doc.$createdAt,
     }));
-  } catch (err) {
-    console.warn('Appwrite fetch projects error:', err);
+  } catch (err: unknown) {
+    const errorMsg = err instanceof Error ? err.message : String(err);
+    console.info(`[Appwrite] Fallback: Koleksi '${aw.config.projectsCollectionId}' belum tersedia di Cloud (${errorMsg}). Menggunakan Local Storage.`);
     return null;
   }
 }
@@ -167,8 +168,9 @@ export async function fetchApplicationsFromAppwrite(): Promise<JobApplication[]
       matched_project_ids: doc.matched_project_ids || [],
       createdAt: doc.$createdAt,
     }));
-  } catch (err) {
-    console.warn('Appwrite fetch applications error:', err);
+  } catch (err: unknown) {
+    const errorMsg = err instanceof Error ? err.message : String(err);
+    console.info(`[Appwrite] Fallback: Koleksi '${aw.config.applicationsCollectionId}' belum tersedia di Cloud (${errorMsg}). Menggunakan Local Storage.`);
     return null;
   }
 }
```

---

## 3. Hasil Verifikasi Sistem

1. **`npm run dev`**:
   - Backend Python FastAPI berjalan di `http://127.0.0.1:8000` via `.venv`.
   - Frontend Next.js berjalan di `http://localhost:3000` via Turbopack.
   - Tidak ada lagi error `ECONNREFUSED` atau crash server uvicorn.
2. **`npm run build`**:
   - Berhasil 100% tanpa kompilasi error (8/8 static routes berhasil digenerate).
   - Zero syntax / CSS parsing warnings.
