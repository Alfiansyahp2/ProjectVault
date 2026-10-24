'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Building2, 
  FileText,
  AlertTriangle,
  LayoutGrid,
  ListFilter
} from 'lucide-react';
import { JobApplication, ApplicationStatus } from '@/lib/types';
import { getApplications, saveApplication, deleteApplication } from '@/lib/storage';
import ApplicationModal from '@/components/ApplicationModal';

const STATUS_COLUMNS: { key: ApplicationStatus; label: string; color: string; badge: string }[] = [
  { key: 'wishlist', label: 'Wishlist / Rencana', color: 'border-zinc-300 dark:border-zinc-700', badge: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' },
  { key: 'applied', label: 'Lamaran Terkirim', color: 'border-blue-400 dark:border-blue-800', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' },
  { key: 'interview', label: 'Tahap Wawancara', color: 'border-amber-400 dark:border-amber-800', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' },
  { key: 'offer', label: 'Diterima / Penawaran', color: 'border-emerald-400 dark:border-emerald-800', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
  { key: 'rejected', label: 'Belum Berhasil', color: 'border-rose-300 dark:border-rose-900', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' },
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<{ title: string; text: string } | null>(null);

  const loadData = async () => {
    const apps = await getApplications();
    setApplications(apps);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (app: JobApplication) => {
    await saveApplication(app);
    loadData();
  };

  const handleDelete = async (id: string, company: string) => {
    if (confirm(`Hapus catatan lamaran di "${company}"?`)) {
      await deleteApplication(id);
      loadData();
    }
  };

  const handleStatusChange = async (app: JobApplication, newStatus: ApplicationStatus) => {
    await saveApplication({ ...app, status: newStatus });
    loadData();
  };

  const calculateDaysAgo = (dateStr: string) => {
    if (!dateStr) return 0;
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  const filteredApps = applications.filter(a =>
    a.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.notes && a.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                Pelacak Lamaran Kerja (*Job Tracker*)
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500">
                Pantau setiap posisi yang Anda lamar, simpan cover letter yang dikirim, dan jangan lewatkan follow-up.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" /> Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <ListFilter className="w-4 h-4" /> Daftar
            </button>
          </div>

          <button
            onClick={() => {
              setEditingApp(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Catat Lamaran Baru
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Cari nama perusahaan, posisi pekerjaan, atau catatan..."
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {STATUS_COLUMNS.map((col) => {
            const items = filteredApps.filter(a => a.status === col.key);
            return (
              <div
                key={col.key}
                className="bg-zinc-100/60 dark:bg-zinc-900/40 rounded-2xl p-3 border border-zinc-200 dark:border-zinc-800 flex flex-col min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    {col.label}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${col.badge}`}>
                    {items.length}
                  </span>
                </div>

                {/* Cards in column */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {items.map((app) => {
                    const daysAgo = calculateDaysAgo(app.applied_date);
                    const isFollowUpDue = app.status === 'applied' && daysAgo >= 7;

                    return (
                      <div
                        key={app.id}
                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 transition"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                              {app.company_name}
                            </h4>
                            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300 mt-0.5">
                              {app.job_title}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <button
                              onClick={() => {
                                setEditingApp(app);
                                setIsModalOpen(true);
                              }}
                              className="p-1 text-zinc-400 hover:text-blue-600 rounded"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(app.id, app.company_name)}
                              className="p-1 text-zinc-400 hover:text-rose-600 rounded"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Date & Follow-up */}
                        <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {app.applied_date}
                          </span>
                          <span>{daysAgo === 0 ? 'Hari ini' : `${daysAgo} hari lalu`}</span>
                        </div>

                        {/* Alert if follow up due */}
                        {isFollowUpDue && (
                          <div className="mt-2 p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[10px] text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                            Saatnya follow up rekruter!
                          </div>
                        )}

                        {/* Notes */}
                        {app.notes && (
                          <p className="mt-2 text-[11px] text-zinc-500 line-clamp-2 bg-zinc-50 dark:bg-zinc-800/40 p-1.5 rounded">
                            {app.notes}
                          </p>
                        )}

                        {/* Quick Actions (Cover Letter & Analyze) */}
                        <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                          {app.cover_letter ? (
                            <button
                              onClick={() => setSelectedCoverLetter({ title: `${app.company_name} - ${app.job_title}`, text: app.cover_letter || '' })}
                              className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3" /> Cover Letter
                            </button>
                          ) : (
                            <span className="text-[10px] text-zinc-400">Tanpa arsip teks</span>
                          )}

                          <select
                            value={app.status}
                            onChange={e => handleStatusChange(app, e.target.value as ApplicationStatus)}
                            className="text-[10px] bg-transparent border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5 text-zinc-600 dark:text-zinc-300 outline-none"
                          >
                            <option value="wishlist">Wishlist</option>
                            <option value="applied">Terkirim</option>
                            <option value="interview">Wawancara</option>
                            <option value="offer">Diterima</option>
                            <option value="rejected">Ditolak</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}

                  {items.length === 0 && (
                    <div className="text-center py-8 text-zinc-400 text-xs">
                      Kosong
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Perusahaan & Posisi</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Tanggal Kirim</th>
                <th className="px-4 py-3 font-semibold">Catatan</th>
                <th className="px-4 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                  <td className="px-4 py-3">
                    <div className="font-bold text-zinc-900 dark:text-white">{app.company_name}</div>
                    <div className="text-xs text-zinc-500">{app.job_title}</div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={app.status}
                      onChange={e => handleStatusChange(app, e.target.value as ApplicationStatus)}
                      className="text-xs bg-zinc-100 dark:bg-zinc-800 rounded px-2 py-1 border border-zinc-300 dark:border-zinc-700 outline-none"
                    >
                      <option value="wishlist">Wishlist</option>
                      <option value="applied">Terkirim</option>
                      <option value="interview">Wawancara</option>
                      <option value="offer">Diterima</option>
                      <option value="rejected">Ditolak</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {app.applied_date}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs max-w-xs truncate">
                    {app.notes || '-'}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditingApp(app);
                        setIsModalOpen(true);
                      }}
                      className="p-1 text-zinc-500 hover:text-blue-600"
                    >
                      <Edit3 className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(app.id, app.company_name)}
                      className="p-1 text-zinc-500 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Cover Letter Modal */}
      {selectedCoverLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Arsip Surat Lamaran: {selectedCoverLetter.title}
              </h3>
              <button
                onClick={() => setSelectedCoverLetter(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs"
              >
                Tutup
              </button>
            </div>
            <textarea
              readOnly
              rows={12}
              value={selectedCoverLetter.text}
              className="w-full p-4 font-sans text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 outline-none select-all leading-relaxed"
            />
            <div className="flex justify-end">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedCoverLetter.text);
                  alert('Surat lamaran berhasil disalin ke clipboard!');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
              >
                Salin Teks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingApp(null);
        }}
        onSave={handleSave}
        initialData={editingApp}
      />
    </div>
  );
}
