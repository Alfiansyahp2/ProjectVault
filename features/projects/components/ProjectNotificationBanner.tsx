import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { ProjectNotification } from '../types';

interface ProjectNotificationBannerProps {
  notification: ProjectNotification | null;
  onClose: () => void;
}

export const ProjectNotificationBanner: React.FC<ProjectNotificationBannerProps> = ({
  notification,
  onClose,
}) => {
  if (!notification) return null;

  return (
    <div
      className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all animate-in fade-in slide-in-from-top-2 ${
        notification.type === 'success'
          ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
          : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            notification.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/20 text-rose-400'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
        </div>
        <div>
          <p className="text-xs sm:text-sm font-semibold">{notification.message}</p>
          {notification.details && (
            <p className="text-[11px] text-emerald-300/80 mt-0.5">{notification.details}</p>
          )}
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
        aria-label="Tutup notifikasi"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
