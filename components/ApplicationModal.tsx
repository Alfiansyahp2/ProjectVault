'use client';

import React, { useState, useEffect } from 'react';
import { JobApplication, ApplicationStatus } from '@/lib/types';
import { X, Building2, Briefcase, Calendar, DollarSign, Link as LinkIcon, FileText } from 'lucide-react';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (app: JobApplication) => void;
  initialData?: JobApplication | null;
}

export default function ApplicationModal({ isOpen, onClose, onSave, initialData }: ApplicationModalProps) {
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('applied');
  const [appliedDate, setAppliedDate] = useState('');
  const [jobLink, setJobLink] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [notes, setNotes] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

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
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0b1220] border border-white/[0.12] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl shadow-sky-500/10 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08] bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shadow-inner">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {initialData ? 'Edit Data Lamaran Kerja' : 'Catat Lamaran Pekerjaan Baru'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Pantau siklus lamaran, arsipkan surat lamaran, dan catat follow-up rekruter.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Company & Job Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Arsip Surat Lamaran (*Cover Letter*) yang Dikirim
            </label>
            <textarea
              rows={4}
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
              placeholder="Arsip draf surat lamaran spesifik yang telah Anda kirimkan ke perusahaan ini..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-[#070b14] text-white placeholder:text-slate-500 focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/40 outline-none transition leading-relaxed"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white shadow-lg shadow-sky-500/25 transition active:scale-95"
            >
              {initialData ? 'Simpan Perubahan' : 'Catat ke Pelacak Lamaran'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
