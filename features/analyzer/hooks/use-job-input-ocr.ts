'use client';

import { useState } from 'react';

interface UseJobInputOcrProps {
  onInsertText: (text: string) => void;
  onSetJobTitle?: (title: string) => void;
  onSetCompanyName?: (company: string) => void;
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

  const handleImageOcr = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;

    setOcrLoading(true);
    setOcrStatus('Memuat OCR Tesseract...');

    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng+ind', 1, {
        logger: m => {
          if (m.status === 'recognizing text' && typeof m.progress === 'number') {
            setOcrStatus(`Mengekstrak (${Math.round(m.progress * 100)}%)...`);
          }
        }
      });

      const ret = await worker.recognize(file);
      await worker.terminate();

      const extractedText = ret.data.text.trim();
      if (!extractedText) {
        showStatus('Tidak ada teks yang dapat dikenali dari gambar.');
        return;
      }

      onInsertText(extractedText);
      showStatus('Berhasil mengekstrak teks gambar!');

      // Run entity extraction via backend NLP
      fetch('/api/applications/upload-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: extractedText, sourceHint: file.name }),
      })
        .then(res => res.json())
        .then(resData => {
          if (resData.success && resData.data) {
            if (resData.data.job_title && onSetJobTitle) {
              onSetJobTitle(resData.data.job_title);
            }
            if (resData.data.company_name && resData.data.company_name !== 'Perusahaan' && onSetCompanyName) {
              onSetCompanyName(resData.data.company_name);
            }
          }
        })
        .catch(() => {});

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
        if (textToInsert) {
          onInsertText(textToInsert);
        }
        if (resData.data.job_title && onSetJobTitle) {
          onSetJobTitle(resData.data.job_title);
        }
        if (resData.data.company_name && resData.data.company_name !== 'Perusahaan' && onSetCompanyName) {
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

  return {
    ocrLoading,
    ocrStatus,
    statusMsg,
    showStatus,
    handleImageOcr,
    handleLoadLocalFile,
  };
}
