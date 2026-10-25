'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Briefcase, Sparkles, X, CheckCircle2 } from 'lucide-react';
import { ApplicationModalProps, ApplicationFormData, LocalResumeFile } from './types';
import { ApplicationForm } from './ApplicationForm';
import { ApplicationParserPanel } from './ApplicationParserPanel';

const INITIAL_FORM_DATA: ApplicationFormData = {
  companyName: '',
  jobTitle: '',
  status: 'applied',
  appliedDate: '',
  jobLink: '',
  salaryRange: '',
  notes: '',
  jobDescription: '',
  coverLetter: '',
};

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<ApplicationFormData>(INITIAL_FORM_DATA);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<any>(null);
  const [localFiles, setLocalFiles] = useState<LocalResumeFile[]>([]);
  const [selectedLocalFile, setSelectedLocalFile] = useState<string>('');
  const [parseSuccessMsg, setParseSuccessMsg] = useState<string | null>(null);
  const [parseErrorMsg, setParseErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Reset or populate form state
  useEffect(() => {
    if (initialData) {
      setFormData({
        companyName: initialData.company_name || '',
        jobTitle: initialData.job_title || '',
        status: initialData.status || 'applied',
        appliedDate: initialData.applied_date || new Date().toISOString().split('T')[0],
        jobLink: initialData.job_link || '',
        salaryRange: initialData.salary_range || '',
        notes: initialData.notes || '',
        jobDescription: initialData.job_description || '',
        coverLetter: initialData.cover_letter || '',
      });
      setParsedResult(null);
    } else {
      setFormData({
        ...INITIAL_FORM_DATA,
        appliedDate: new Date().toISOString().split('T')[0],
      });
      setParsedResult(null);
      setSelectedLocalFile('');
    }
    setParseSuccessMsg(null);
    setParseErrorMsg(null);
  }, [initialData, isOpen]);

  // Apply parsed entity data into left form
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

  // Upload and parse from drag & drop / file picker
  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setParseErrorMsg('Hanya berkas format .PDF yang didukung.');
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
      setParseErrorMsg('Terjadi kesalahan saat memproses berkas: ' + err.message);
    } finally {
      setIsParsing(false);
    }
  };

  // Parse from local folder selection
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
        const fileName = filePath.split(/[\\/]/).pop() || filePath;
        applyParsedData(json.data, fileName);
      } else {
        setParseErrorMsg(json.error || 'Gagal mem-parse berkas lokal');
      }
    } catch (err: any) {
      setParseErrorMsg('Terjadi kesalahan saat memproses berkas lokal: ' + err.message);
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim() || !formData.jobTitle.trim()) {
      alert('Nama perusahaan dan posisi pekerjaan wajib diisi.');
      return;
    }

    onSave({
      id: initialData?.id || '',
      company_name: formData.companyName.trim(),
      job_title: formData.jobTitle.trim(),
      status: formData.status,
      applied_date: formData.appliedDate,
      job_link: formData.jobLink.trim(),
      salary_range: formData.salaryRange.trim(),
      notes: formData.notes.trim(),
      job_description: formData.jobDescription.trim(),
      cover_letter: formData.coverLetter.trim(),
      createdAt: initialData?.createdAt || new Date().toISOString(),
    });
    onClose();
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#0b1220] border border-white/[0.12] rounded-3xl shadow-2xl shadow-sky-500/10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header - ALWAYS FIXED AT TOP */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-slate-900/70 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shadow-inner shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base font-bold text-white tracking-tight">
                  {initialData ? 'Edit Data Lamaran Kerja' : 'Catat Lamaran Pekerjaan Baru'}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-sky-400" /> Dual-Pane AI Ingestion
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                Isi formulir secara manual atau tarik berkas PDF di sisi kanan untuk pengisian otomatis.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition shrink-0 ml-2"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dual-Pane Body: Left (Form) & Right (Dropzone & Parser) */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-full divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
            <ApplicationForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              hasAutoFilled={Boolean(parsedResult)}
            />
            <ApplicationParserPanel
              isParsing={isParsing}
              parsedResult={parsedResult}
              parseSuccessMsg={parseSuccessMsg}
              parseErrorMsg={parseErrorMsg}
              localFiles={localFiles}
              selectedLocalFile={selectedLocalFile}
              setSelectedLocalFile={setSelectedLocalFile}
              onFileUpload={handleFileUpload}
              onLocalFileParse={handleLocalFileParse}
              onResetParsed={() => setParsedResult(null)}
            />
          </div>
        </div>

        {/* Footer - ALWAYS FIXED AT BOTTOM */}
        <div className="shrink-0 px-6 py-4 border-t border-white/[0.08] bg-slate-900/70 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="text-indigo-400 font-semibold">ProjectVault AI Tracker:</span>
            <span>Semua data tersimpan aman ke database lokal &amp; cloud.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition"
            >
              Batal
            </button>
            <button
              type="submit"
              form="application-modal-form"
              className="px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white shadow-lg shadow-sky-500/25 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{initialData ? 'Simpan Perubahan' : 'Catat ke Pelacak Lamaran'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default ApplicationModal;
