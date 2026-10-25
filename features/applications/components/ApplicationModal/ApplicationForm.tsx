import React from 'react';
import { Building2, Briefcase, Calendar, DollarSign, Link as LinkIcon, FileText, CheckCircle2 } from 'lucide-react';
import { ApplicationStatus } from '@/lib/types';
import { ApplicationFormProps } from './types';

export const ApplicationForm: React.FC<ApplicationFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  hasAutoFilled,
}) => {
  const updateField = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
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
        {hasAutoFilled && (
          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Auto-fill aktif
          </span>
        )}
      </div>

      <form id="application-modal-form" onSubmit={onSubmit} className="space-y-4">
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
              value={formData.companyName}
              onChange={e => updateField('companyName', e.target.value)}
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
              value={formData.jobTitle}
              onChange={e => updateField('jobTitle', e.target.value)}
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
              value={formData.status}
              onChange={e => updateField('status', e.target.value as ApplicationStatus)}
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
              value={formData.appliedDate}
              onChange={e => updateField('appliedDate', e.target.value)}
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
              value={formData.salaryRange}
              onChange={e => updateField('salaryRange', e.target.value)}
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
              value={formData.jobLink}
              onChange={e => updateField('jobLink', e.target.value)}
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
            value={formData.notes}
            onChange={e => updateField('notes', e.target.value)}
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
            value={formData.jobDescription}
            onChange={e => updateField('jobDescription', e.target.value)}
            placeholder="Tempel kualifikasi lowongan pekerjaan di sini untuk mencocokkan portofolio secara otomatis..."
            className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-white/10 bg-[#070b14] text-white placeholder:text-slate-500 focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/40 outline-none transition leading-relaxed"
          />
        </div>

        {/* Cover Letter Saved */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Arsip Surat Lamaran (<em>Cover Letter</em>) yang Dikirim
            </label>
            {formData.coverLetter && (
              <span className="text-[10px] text-slate-400 font-mono">
                {formData.coverLetter.length} karakter
              </span>
            )}
          </div>
          <textarea
            rows={4}
            value={formData.coverLetter}
            onChange={e => updateField('coverLetter', e.target.value)}
            placeholder="Arsip draf surat lamaran spesifik yang telah Anda kirimkan ke perusahaan ini..."
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-[#070b14] text-white placeholder:text-slate-500 focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/40 outline-none transition leading-relaxed"
          />
        </div>
      </form>
    </div>
  );
};
