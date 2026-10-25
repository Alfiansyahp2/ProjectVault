'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { JobApplication, ApplicationStatus } from '@/lib/types';
import { 
  X, 
  Building2, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  Link as LinkIcon, 
  FileText, 
  UploadCloud, 
  Sparkles, 
  CheckCircle2, 
  FileUp, 
  RefreshCw, 
  Tag, 
  Layers, 
  FileCheck2, 
  ChevronDown, 
  ArrowRight,
  RotateCcw,
  AlertCircle
} from 'lucide-react';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (app: JobApplication) => void;
  initialData?: JobApplication | null;
}

export default function ApplicationModal({ isOpen, onClose, onSave, initialData }: ApplicationModalProps) {
  const [mounted, setMounted] = useState(false);
  
  // Left side: Form fields
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('applied');
  const [appliedDate, setAppliedDate] = useState('');
  const [jobLink, setJobLink] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [notes, setNotes] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  // Right side: Drag & Drop & Local Parse State
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<any>(null);
  const [localFiles, setLocalFiles] = useState<Array<{ name: string; path: string; size: number; folder: string }>>([]);
  const [selectedLocalFile, setSelectedLocalFile] = useState<string>('');
  const [parseSuccessMsg, setParseSuccessMsg] = useState<string | null>(null);
  const [parseErrorMsg, setParseErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setCompanyName(initialData.company_name || '');
      setJobTitle(initialData.job_title || '');
      setStatus(initialData.status || 'applied');
      setAppliedDate(initialData.applied_date || new Date().toISOString().split('T')[0]);
      setJobLink(initialData.job_link || '');
      setSalaryRange(initialData.salary_range || '');
      setNotes(initialData.notes || '');
      setJobDescription(initialData.job_description || '');
      setCoverLetter(initialData.cover_letter || '');
      setParsedResult(null);
    } else {
      setCompanyName('');
      setJobTitle('');
      setStatus('applied');
      setAppliedDate(new Date().toISOString().split('T')[0]);
      setJobLink('');
      setSalaryRange('');
      setNotes('');
      setJobDescription('');
      setCoverLetter('');
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

    if (data.company_name && data.company_name !== 'Perusahaan') {
      setCompanyName(data.company_name);
    }
    if (data.job_title) {
      setJobTitle(data.job_title);
    }
    if (data.applied_date) {
      setAppliedDate(data.applied_date);
    }
    if (data.cover_letter) {
      setCoverLetter(data.cover_letter);
    } else if (data.cover_letter_preview) {
      setCoverLetter(data.cover_letter_preview);
    }
    if (data.summary) {
      const skillsSuffix = data.key_skills?.length 
        ? `\n\nKeahlian Kunci Terdeteksi: ${data.key_skills.join(', ')}` 
        : '';
      setJobDescription(data.summary + skillsSuffix);
    }
    if (data.source_portal && data.source_portal !== 'Direct / Other') {
      setNotes(prev => prev ? `${prev} • Sumber: ${data.source_portal}` : `Sumber Lowongan: ${data.source_portal}`);
    }

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
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/applications/upload-parse', {
        method: 'POST',
        body: formData,
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

  // Drag and drop event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileUpload(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !jobTitle.trim()) {
      alert('Nama perusahaan dan posisi pekerjaan wajib diisi.');
      return;
    }

    onSave({
      id: initialData?.id || '',
      company_name: companyName.trim(),
      job_title: jobTitle.trim(),
      status,
      applied_date: appliedDate,
      job_link: jobLink.trim(),
      salary_range: salaryRange.trim(),
      notes: notes.trim(),
      job_description: jobDescription.trim(),
      cover_letter: coverLetter.trim(),
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
            
            {/* SISI KIRI: Formulir Input Detail Lamaran */}
            <div className="lg:col-span-7 p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Formulir Lamaran
                  </span>
                  <span className="text-[11px] text-slate-400">
                    (Dapat disesuaikan)
                  </span>
                </div>
                {parsedResult && (
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Auto-fill aktif
                  </span>
                )}
              </div>

              <form id="application-modal-form" onSubmit={handleSubmit} className="space-y-4">
                {/* Company & Job Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                      <Building2 className="w-3.5 h-3.5 text-sky-400" />
                      <span>Nama Perusahaan *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      placeholder="Contoh: PT Teknologi Masa Depan"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-white/10 bg-[#070b14] text-white placeholder:text-slate-500 focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/40 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-sky-400" />
                      <span>Posisi yang Dilamar *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={jobTitle}
                      onChange={e => setJobTitle(e.target.value)}
                      placeholder="Contoh: Senior Fullstack Engineer"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-white/10 bg-[#070b14] text-white placeholder:text-slate-500 focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/40 outline-none transition"
                    />
                  </div>
                </div>

                {/* Status & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Status Lamaran Saat Ini
                    </label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value as ApplicationStatus)}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-white/10 bg-[#070b14] text-white focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/40 outline-none transition"
                    >
                      <option value="wishlist" className="bg-[#0b1220]">Wishlist / Disimpan</option>
                      <option value="applied" className="bg-[#0b1220]">Terkirim (Applied)</option>
                      <option value="interview" className="bg-[#0b1220]">Wawancara (Interview)</option>
                      <option value="offer" className="bg-[#0b1220]">Penawaran Kerja (Offer)</option>
                      <option value="rejected" className="bg-[#0b1220]">Belum Berhasil (Rejected)</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Tanggal Mengirim Berkas</span>
                    </label>
                    <input
                      type="date"
                      value={appliedDate}
                      onChange={e => setAppliedDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-white/10 bg-[#070b14] text-white focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/40 outline-none transition"
                    />
                  </div>
                </div>

                {/* Salary & Link */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Ekspektasi / Kisaran Gaji</span>
                    </label>
                    <input
                      type="text"
                      value={salaryRange}
                      onChange={e => setSalaryRange(e.target.value)}
                      placeholder="Contoh: Rp 12.000.000 - Rp 15.000.000"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-white/10 bg-[#070b14] text-white placeholder:text-slate-500 focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/40 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                      <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Link Postingan Lowongan</span>
                    </label>
                    <input
                      type="url"
                      value={jobLink}
                      onChange={e => setJobLink(e.target.value)}
                      placeholder="https://linkedin.com/jobs/..."
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-white/10 bg-[#070b14] text-white placeholder:text-slate-500 focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/40 outline-none transition"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Catatan Rekruter / Jadwal Interview
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Contoh: Lolos screening, jadwal live coding hari Kamis jam 14:00."
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-white/10 bg-[#070b14] text-white placeholder:text-slate-500 focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/40 outline-none transition"
                  />
                </div>

                {/* Job Description (For Python matching) */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                    <FileText className="w-3.5 h-3.5 text-sky-400" />
                    <span>Teks Kriteria &amp; Deskripsi Lowongan (Untuk Analisis Semantik AI)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={jobDescription}
                    onChange={e => setJobDescription(e.target.value)}
                    placeholder="Tempel kualifikasi lowongan pekerjaan di sini untuk mencocokkan portofolio secara otomatis..."
                    className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-white/10 bg-[#070b14] text-white placeholder:text-slate-500 focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/40 outline-none transition leading-relaxed"
                  />
                </div>

                {/* Cover Letter Saved */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Arsip Surat Lamaran (*Cover Letter*) yang Dikirim
                    </label>
                    {coverLetter && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {coverLetter.length} karakter
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={4}
                    value={coverLetter}
                    onChange={e => setCoverLetter(e.target.value)}
                    placeholder="Arsip draf surat lamaran spesifik yang telah Anda kirimkan ke perusahaan ini..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-[#070b14] text-white placeholder:text-slate-500 focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/40 outline-none transition leading-relaxed"
                  />
                </div>
              </form>
            </div>

            {/* SISI KANAN: AI Document Intelligence & Dropzone */}
            <div className="lg:col-span-5 p-5 sm:p-6 space-y-4 bg-white/[0.015] flex flex-col justify-between min-w-0 max-w-full overflow-hidden">
              <div className="space-y-4 min-w-0 max-w-full">
                
                {/* Section Header */}
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider truncate">
                        AI Document Parser
                      </h3>
                      <p className="text-[10px] text-slate-400 truncate">
                        Ekstraksi otomatis teks &amp; entitas PDF
                      </p>
                    </div>
                  </div>

                  {parsedResult && (
                    <button
                      type="button"
                      onClick={() => setParsedResult(null)}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition shrink-0 ml-2"
                      title="Reset hasil ekstraksi"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                  )}
                </div>

                {/* Notifications Banner */}
                {parseSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span className="truncate">{parseSuccessMsg}</span>
                  </div>
                )}

                {parseErrorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span className="truncate">{parseErrorMsg}</span>
                  </div>
                )}

                {/* Drag & Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                    isDragging
                      ? 'border-indigo-400 bg-indigo-500/15 scale-[1.01]'
                      : 'border-white/15 hover:border-indigo-500/40 bg-white/[0.02] hover:bg-white/[0.04]'
                  } ${isParsing ? 'pointer-events-none opacity-60' : ''}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />

                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-sky-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/10">
                      {isParsing ? (
                        <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
                      ) : (
                        <UploadCloud className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-white">
                        {isParsing ? 'Mengekstrak Berkas PDF...' : 'Tarik & Lepaskan PDF ke Sini'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        atau <span className="text-indigo-400 font-semibold underline underline-offset-2">jelajahi file</span> dari komputer Anda (.pdf)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Local File Picker */}
                <div className="bg-slate-900/60 border border-white/[0.08] rounded-2xl p-3.5 space-y-2.5 min-w-0 max-w-full">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider truncate">
                      <FileUp className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>Ambil dari Berkas Lokal ({localFiles.length})</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">data/resume</span>
                  </div>

                  <div className="space-y-2 w-full min-w-0">
                    <div className="w-full min-w-0">
                      <select
                        value={selectedLocalFile}
                        onChange={e => {
                          const val = e.target.value;
                          setSelectedLocalFile(val);
                          if (val) handleLocalFileParse(val);
                        }}
                        className="w-full max-w-full px-3 py-2.5 text-xs rounded-xl border border-white/10 bg-[#070b14] text-white focus:border-sky-500/60 outline-none transition truncate cursor-pointer"
                      >
                        <option value="">-- Pilih Berkas Surat Lamaran ({localFiles.length} berkas) --</option>
                        {localFiles.map((f, idx) => (
                          <option key={idx} value={f.path} className="bg-[#0b1220]">
                            {f.name} ({Math.round(f.size / 1024)} KB)
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      disabled={!selectedLocalFile || isParsing}
                      onClick={() => handleLocalFileParse(selectedLocalFile)}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition shadow-md shadow-indigo-500/20 active:scale-[0.98] cursor-pointer"
                    >
                      {isParsing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Mengekstrak Teks Dokumen...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-sky-200" />
                          <span>Ekstrak Berkas Ini ke Formulir</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Parsed Result Insight Card */}
                {parsedResult ? (
                  <div className="bg-[#070b14] border border-indigo-500/30 rounded-2xl p-4 space-y-3 shadow-lg shadow-indigo-500/5 animate-in fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-xs font-bold text-white truncate">
                          {parsedResult.sourceFileName || parsedResult.file_name}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
                        Ter-parse
                      </span>
                    </div>

                    {/* Detected Entity Chips */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white/[0.03] p-2 rounded-xl border border-white/[0.06]">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Perusahaan</p>
                        <p className="font-semibold text-white truncate mt-0.5">{parsedResult.company_name}</p>
                      </div>
                      <div className="bg-white/[0.03] p-2 rounded-xl border border-white/[0.06]">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Posisi</p>
                        <p className="font-semibold text-white truncate mt-0.5">{parsedResult.job_title}</p>
                      </div>
                      <div className="bg-white/[0.03] p-2 rounded-xl border border-white/[0.06]">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Tanggal</p>
                        <p className="font-mono text-slate-300 truncate mt-0.5">{parsedResult.applied_date}</p>
                      </div>
                      <div className="bg-white/[0.03] p-2 rounded-xl border border-white/[0.06]">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Kanal</p>
                        <p className="font-semibold text-indigo-300 truncate mt-0.5">{parsedResult.source_portal}</p>
                      </div>
                    </div>

                    {/* Key skills if detected */}
                    {parsedResult.key_skills && parsedResult.key_skills.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                          <Tag className="w-3 h-3 text-indigo-400" />
                          <span>Keahlian Terdeteksi ({parsedResult.key_skills.length}):</span>
                        </p>
                        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                          {parsedResult.key_skills.map((s: string, idx: number) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border border-white/[0.06] rounded-2xl p-4 text-center space-y-1 bg-white/[0.01]">
                    <p className="text-xs font-semibold text-slate-300">
                      💡 Mengapa Menggunakan Fitur Ini?
                    </p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Sistem menggunakan NLP lokal untuk mengekstrak nama PT/perusahaan, posisi, tanggal, kanal, serta isi surat lamaran secara instan tanpa mengetik manual.
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom tip info */}
              <div className="pt-3 border-t border-white/[0.06] flex items-center gap-2 text-[11px] text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                <span>Pemrosesan berjalan 100% di mesin lokal tanpa API eksternal.</span>
              </div>
            </div>

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
}
