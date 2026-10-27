'use client';

import { useState, useEffect } from 'react';
import { LocalResumeFile, ApplicationFormData } from './types';

export function useResumeParser(
  isOpen: boolean,
  setFormData: React.Dispatch<React.SetStateAction<ApplicationFormData>>
) {
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<any>(null);
  const [localFiles, setLocalFiles] = useState<LocalResumeFile[]>([]);
  const [selectedLocalFile, setSelectedLocalFile] = useState<string>('');
  const [parseSuccessMsg, setParseSuccessMsg] = useState<string | null>(null);
  const [parseErrorMsg, setParseErrorMsg] = useState<string | null>(null);
  const [ocrProgress, setOcrProgress] = useState<number | null>(null);
  const [ocrStatus, setOcrStatus] = useState<string | null>(null);

  // Fetch list of local files when modal opens
  useEffect(() => {
    if (isOpen) {
      fetch('/api/applications/upload-parse')
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.files)) {
            setLocalFiles(data.files);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const applyParsedData = (data: any, fileName: string) => {
    setParsedResult({ ...data, sourceFileName: fileName });
    setParseErrorMsg(null);

    setFormData(prev => {
      const updated = { ...prev };
      if (data.company_name && data.company_name !== 'Perusahaan') {
        updated.companyName = data.company_name;
      }
      if (data.job_title) {
        updated.jobTitle = data.job_title;
      }
      if (data.applied_date) {
        updated.appliedDate = data.applied_date;
      }
      if (data.cover_letter) {
        updated.coverLetter = data.cover_letter;
      } else if (data.cover_letter_preview) {
        updated.coverLetter = data.cover_letter_preview;
      }
      if (data.summary) {
        const skillsSuffix = data.key_skills?.length 
          ? `\n\nKeahlian Kunci Terdeteksi: ${data.key_skills.join(', ')}` 
          : '';
        updated.jobDescription = data.summary + skillsSuffix;
      }
      if (data.source_portal && data.source_portal !== 'Direct / Other') {
        updated.notes = updated.notes 
          ? `${updated.notes} • Sumber: ${data.source_portal}` 
          : `Sumber Lowongan: ${data.source_portal}`;
      }
      return updated;
    });

    setParseSuccessMsg(`Berhasil mengekstrak entitas dari: ${fileName}`);
    setTimeout(() => setParseSuccessMsg(null), 5000);
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setParseErrorMsg('Hanya berkas format .PDF yang didukung pada tab PDF.');
      return;
    }
    setIsParsing(true);
    setParseErrorMsg(null);
    try {
      const formPayload = new FormData();
      formPayload.append('file', file);
      const res = await fetch('/api/applications/upload-parse', {
        method: 'POST',
        body: formPayload,
      });
      const json = await res.json();
      if (json.success && json.data) {
        applyParsedData(json.data, file.name);
      } else {
        setParseErrorMsg(json.error || 'Gagal mem-parse berkas PDF');
      }
    } catch (err: any) {
      setParseErrorMsg(err.message || 'Terjadi kesalahan koneksi server');
    } finally {
      setIsParsing(false);
    }
  };

  const handleLocalFileParse = async (filePath: string) => {
    if (!filePath) return;
    setIsParsing(true);
    setParseErrorMsg(null);
    try {
      const res = await fetch('/api/applications/upload-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ localFilePath: filePath }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const fileName = filePath.split(/[/\\]/).pop() || filePath;
        applyParsedData(json.data, fileName);
      } else {
        setParseErrorMsg(json.error || 'Gagal mem-parse berkas lokal');
      }
    } catch (err: any) {
      setParseErrorMsg(err.message || 'Terjadi kesalahan saat memproses');
    } finally {
      setIsParsing(false);
    }
  };

  const handleRawTextParse = async (text: string, sourceHint: string = 'Teks Salinan') => {
    if (!text || !text.trim()) {
      setParseErrorMsg('Teks masukan tidak boleh kosong.');
      return;
    }
    setIsParsing(true);
    setParseErrorMsg(null);
    try {
      const res = await fetch('/api/applications/upload-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: text, sourceHint }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        applyParsedData(json.data, sourceHint);
      } else {
        setParseErrorMsg(json.error || 'Gagal mem-parse teks');
      }
    } catch (err: any) {
      setParseErrorMsg(err.message || 'Terjadi kesalahan koneksi server');
    } finally {
      setIsParsing(false);
    }
  };

  const handleImageOcrParse = async (fileOrBlob: File | Blob, customName?: string) => {
    setIsParsing(true);
    setParseErrorMsg(null);
    setOcrProgress(10);
    setOcrStatus('Memuat modul OCR Tesseract lokal...');

    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng+ind', 1, {
        logger: m => {
          if (m.status === 'recognizing text' && typeof m.progress === 'number') {
            setOcrProgress(Math.round(20 + m.progress * 65));
            setOcrStatus(`Mengekstrak teks (${Math.round(m.progress * 100)}%)...`);
          }
        }
      });

      const ret = await worker.recognize(fileOrBlob);
      await worker.terminate();

      const extractedText = ret.data.text.trim();
      if (!extractedText) {
        throw new Error('Tidak ada teks yang dapat dikenali dari gambar ini.');
      }

      setOcrProgress(90);
      setOcrStatus('Menganalisis entitas teks dengan NLP Engine...');

      const rawName = customName || ('name' in fileOrBlob ? (fileOrBlob as File).name : 'Tangkapan Layar');
      const isScreenshot = /screencapture|screenshot|capture|image|img_|responsepage|\.aspx/i.test(rawName);
      const hint = isScreenshot ? 'Tangkapan Layar Lowongan' : `Gambar: ${rawName}`;
      await handleRawTextParse(extractedText, hint);
    } catch (err: any) {
      setParseErrorMsg(err.message || 'Gagal melakukan OCR pada gambar');
      setIsParsing(false);
    } finally {
      setOcrProgress(null);
      setOcrStatus(null);
    }
  };

  const resetParserState = () => {
    setParsedResult(null);
    setSelectedLocalFile('');
    setParseSuccessMsg(null);
    setParseErrorMsg(null);
    setOcrProgress(null);
    setOcrStatus(null);
  };

  return {
    isParsing,
    parsedResult,
    localFiles,
    selectedLocalFile,
    setSelectedLocalFile,
    parseSuccessMsg,
    parseErrorMsg,
    ocrProgress,
    ocrStatus,
    handleFileUpload,
    handleLocalFileParse,
    handleRawTextParse,
    handleImageOcrParse,
    resetParserState,
  };
}
