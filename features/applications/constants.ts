import { Briefcase, Send, MessageSquare, Award, XCircle } from 'lucide-react';
import { ApplicationStatus } from '@/lib/types';

export interface KanbanColumnConfig {
  key: ApplicationStatus;
  label: string;
  icon: any;
  badge: string;
  glow: string;
  borderTop: string;
}

export const STATUS_COLUMNS: KanbanColumnConfig[] = [
  { 
    key: 'wishlist', 
    label: 'Wishlist / Rencana', 
    icon: Briefcase, 
    badge: 'bg-slate-500/15 text-slate-300 border-slate-500/30', 
    glow: 'group-hover:border-slate-500/40',
    borderTop: 'border-t-slate-400'
  },
  { 
    key: 'applied', 
    label: 'Lamaran Terkirim', 
    icon: Send, 
    badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30', 
    glow: 'group-hover:border-blue-500/40',
    borderTop: 'border-t-blue-500'
  },
  { 
    key: 'interview', 
    label: 'Tahap Wawancara', 
    icon: MessageSquare, 
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30', 
    glow: 'group-hover:border-amber-500/40',
    borderTop: 'border-t-amber-500'
  },
  { 
    key: 'offer', 
    label: 'Diterima / Penawaran', 
    icon: Award, 
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', 
    glow: 'group-hover:border-emerald-500/40',
    borderTop: 'border-t-emerald-500'
  },
  { 
    key: 'rejected', 
    label: 'Belum Berhasil', 
    icon: XCircle, 
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30', 
    glow: 'group-hover:border-rose-500/40',
    borderTop: 'border-t-rose-500'
  },
];
