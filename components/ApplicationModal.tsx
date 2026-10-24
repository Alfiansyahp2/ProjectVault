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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
            {initialData ? 'Edit Data Lamaran Kerja' : 'Catat Lamaran Pekerjaan Baru'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Company & Job Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                <Building2 className="w-3.5 h-3.5" /> Nama Perusahaan *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="Contoh: PT Teknologi Masa Depan"
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                <Briefcase className="w-3.5 h-3.5" /> Posisi yang Dilamar *
              </label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                placeholder="Contoh: Senior Frontend Developer"
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Status & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Status Lamaran
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as ApplicationStatus)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="wishlist">Wishlist / Disimpan</option>
                <option value="applied">Terkirim (Applied)</option>
                <option value="interview">Wawancara (Interview)</option>
                <option value="offer">Diterima (Offer)</option>
                <option value="rejected">Belum Berhasil (Rejected)</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                <Calendar className="w-3.5 h-3.5" /> Tanggal Mengirim Lamaran
              </label>
              <input
                type="date"
                value={appliedDate}
                onChange={e => setAppliedDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Salary & Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                <DollarSign className="w-3.5 h-3.5" /> Ekspektasi / Kisaran Gaji
              </label>
              <input
                type="text"
                value={salaryRange}
                onChange={e => setSalaryRange(e.target.value)}
                placeholder="Contoh: 10 - 15 Juta / Bulan"
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                <LinkIcon className="w-3.5 h-3.5" /> Link Lowongan (Job Portal / Web)
              </label>
              <input
                type="url"
                value={jobLink}
                onChange={e => setJobLink(e.target.value)}
                placeholder="https://linkedin.com/jobs/..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Job Description (For Python matching) */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              <FileText className="w-3.5 h-3.5" /> Teks Deskripsi & Syarat Lowongan (Untuk Analisis Mesin Python)
            </label>
            <textarea
              rows={3}
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              placeholder="Tempel (paste) syarat dan kualifikasi lowongan pekerjaan di sini agar bisa dianalisis otomatis..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Catatan Pribadi & Follow-up
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Contoh: Sudah follow up via LinkedIn ke Pak Budi, menunggu feedback user."
              className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Cover Letter Saved */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Arsip Surat Lamaran (Cover Letter) yang Dikirim
            </label>
            <textarea
              rows={4}
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
              placeholder="Salin atau ketik teks surat lamaran yang Anda kirimkan ke perusahaan ini..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-sans text-xs"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition"
            >
              {initialData ? 'Simpan Perubahan' : 'Catat Lamaran'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
