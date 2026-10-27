'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Briefcase, Sparkles, X, CheckCircle2 } from 'lucide-react';
import { ApplicationModalProps, ApplicationFormData } from './types';
import { ApplicationForm } from './ApplicationForm';
import { ApplicationParserPanel } from './ApplicationParserPanel';
import { useResumeParser } from './use-resume-parser';

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

  const {
    isParsing,
    parsedResult,
    localFiles,
    selectedLocalFile,
    setSelectedLocalFile,
    parseSuccessMsg,
    parseErrorMsg,
    handleFileUpload,
    handleLocalFileParse,
    resetParserState,
  } = useResumeParser(isOpen, setFormData);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    } else {
      setFormData({
        ...INITIAL_FORM_DATA,
        appliedDate: new Date().toISOString().split('T')[0],
      });
      resetParserState();
    }
  }, [initialData, isOpen]);

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
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition shrink-0 ml-2 cursor-pointer"
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
              onResetParsed={() => resetParserState()}
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
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition cursor-pointer"
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
