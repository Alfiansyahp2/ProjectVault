'use client';

import { useState } from 'react';

interface UseJobInputOcrProps {
  onInsertText: (text: string) => void;
  onSetJobTitle?: (title: string) => void;
  onSetCompanyName?: (company: string) => void;
}

// Client-side canvas preprocessing to enhance colored text (e.g. orange headings) against white cards
async function preprocessImageForOcr(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, img.width, img.height);
      const data = imgData.data;

      // Darken colored ink (orange, red, blue headings) so Tesseract doesn't drop them
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const isColored = Math.max(r, g, b) - Math.min(r, g, b) > 30;
        let gray = 0.299 * r + 0.587 * g + 0.114 * b;
        if (isColored && gray > 60 && gray < 210) {
          gray = Math.max(0, gray - 75);
        }
        const adjusted = Math.min(255, Math.max(0, 1.35 * (gray - 128) + 128));
        data[i] = adjusted;
        data[i + 1] = adjusted;
        data[i + 2] = adjusted;
      }

      ctx.putImageData(imgData, 0, 0);
      canvas.toBlob(blob => resolve(blob || file), 'image/png');
    };
    img.onerror = () => resolve(file);
    img.src = url;
  });
}

export function useJobInputOcr({
  onInsertText,
  onSetJobTitle,
  onSetCompanyName,
}: UseJobInputOcrProps) {
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const showStatus = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const isInvalidCompany = (name: string) => {
    if (!name || name === 'Perusahaan') return true;
    const lower = name.toLowerCase();
    return lower.includes('formulir') || lower.includes('screencapture') || lower.includes('screenshot');
  };

  const handleImageOcr = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;

    setOcrLoading(true);
    setOcrStatus('Mengoptimalkan kontras gambar...');

    try {
      const processedBlob = await preprocessImageForOcr(file);
      setOcrStatus('Memuat OCR Tesseract...');

      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng+ind', 1, {
        logger: m => {
          if (m.status === 'recognizing text' && typeof m.progress === 'number') {
            setOcrStatus(`Mengekstrak (${Math.round(m.progress * 100)}%)...`);
          }
        }
      });

      const ret = await worker.recognize(processedBlob);
      await worker.terminate();

      const extractedText = ret.data.text.trim();
      if (!extractedText) {
        showStatus('Tidak ada teks yang dapat dikenali dari gambar.');
        return;
      }

      onInsertText(extractedText);
      setOcrStatus('Membersihkan teks & ekstraksi entitas...');

      const res = await fetch('/api/applications/upload-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: extractedText, sourceHint: 'Tangkapan Layar Lowongan' }),
      });
      const resData = await res.json();
      if (resData.success && resData.data) {
        if (resData.data.cover_letter) {
          onInsertText(resData.data.cover_letter);
        }
        if (resData.data.job_title && onSetJobTitle) {
          onSetJobTitle(resData.data.job_title);
        }
        if (resData.data.company_name && !isInvalidCompany(resData.data.company_name) && onSetCompanyName) {
          onSetCompanyName(resData.data.company_name);
        }
      }
      showStatus('Berhasil mengekstrak & membersihkan teks lowongan!');
    } catch (err: any) {
      showStatus(`Gagal OCR: ${err.message || 'Kesalahan sistem'}`);
    } finally {
      setOcrLoading(false);
      setOcrStatus(null);
    }
  };

  const handleLoadLocalFile = async (file: { name: string; path: string }) => {
    setOcrLoading(true);
    setOcrStatus('Mengekstrak berkas lokal...');

    try {
      const res = await fetch('/api/applications/upload-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ localFilePath: file.path }),
      });
      const resData = await res.json();
      if (resData.success && resData.data) {
        const textToInsert = resData.data.cover_letter || resData.data.summary || '';
        if (textToInsert) onInsertText(textToInsert);
        if (resData.data.job_title && onSetJobTitle) {
          onSetJobTitle(resData.data.job_title);
        }
        if (resData.data.company_name && !isInvalidCompany(resData.data.company_name) && onSetCompanyName) {
          onSetCompanyName(resData.data.company_name);
        }
        showStatus(`Berhasil memuat berkas: ${file.name}`);
      } else {
        showStatus(resData.error || 'Gagal memuat berkas lokal');
      }
    } catch {
      showStatus('Gagal membaca berkas lokal.');
    } finally {
      setOcrLoading(false);
      setOcrStatus(null);
    }
  };

  const handleUploadDocument = async (file: File) => {
    if (!file) return;

    setOcrLoading(true);
    setOcrStatus(`Mengekstrak ${file.name}...`);

    try {
      if (file.name.toLowerCase().endsWith('.pdf')) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/applications/upload-parse', {
          method: 'POST',
          body: formData,
        });
        const resData = await res.json();
        if (resData.success && resData.data) {
          const textToInsert = resData.data.cover_letter || resData.data.summary || '';
          if (textToInsert) onInsertText(textToInsert);
          if (resData.data.job_title && onSetJobTitle) {
            onSetJobTitle(resData.data.job_title);
          }
          if (resData.data.company_name && !isInvalidCompany(resData.data.company_name) && onSetCompanyName) {
            onSetCompanyName(resData.data.company_name);
          }
          showStatus(`Berhasil mengekstrak: ${file.name}`);
        } else {
          showStatus(resData.error || 'Gagal mengekstrak berkas PDF');
        }
      } else if (file.type.startsWith('image/')) {
        await handleImageOcr(file);
      } else {
        const text = await file.text();
        onInsertText(text);
        const res = await fetch('/api/applications/upload-parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawText: text, sourceHint: file.name }),
        });
        const resData = await res.json();
        if (resData.success && resData.data) {
          if (resData.data.job_title && onSetJobTitle) {
            onSetJobTitle(resData.data.job_title);
          }
          if (resData.data.company_name && !isInvalidCompany(resData.data.company_name) && onSetCompanyName) {
            onSetCompanyName(resData.data.company_name);
          }
        }
        showStatus(`Berhasil memuat berkas: ${file.name}`);
      }
    } catch (err: any) {
      showStatus(`Gagal membaca berkas: ${err.message || 'Kesalahan'}`);
    } finally {
      setOcrLoading(false);
      setOcrStatus(null);
    }
  };

  return {
    ocrLoading,
    ocrStatus,
    statusMsg,
    showStatus,
    handleImageOcr,
    handleLoadLocalFile,
    handleUploadDocument,
  };
}
