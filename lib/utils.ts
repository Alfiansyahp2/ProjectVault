export function getPortalBadge(portal?: string): string {
  const p = (portal || '').toLowerCase();
  if (p.includes('jobstreet')) return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  if (p.includes('linkedin')) return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
  if (p.includes('glints')) return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
  if (p.includes('kalibrr')) return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
  if (p.includes('instagram')) return 'bg-pink-500/15 text-pink-300 border-pink-500/30';
  if (p.includes('website')) return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
}

export function getCompanyInitials(name: string): string {
  if (!name) return 'CO';
  const clean = name.replace(/^(PT|CV|PT\.|CV\.)\s+/i, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

export function getAvatarGradient(name: string): string {
  const gradients = [
    'from-indigo-500 to-purple-600',
    'from-blue-500 to-cyan-600',
    'from-sky-500 to-indigo-600',
    'from-purple-500 to-pink-600',
    'from-teal-500 to-emerald-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-red-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

export function calculateDaysAgo(dateStr: string): number {
  if (!dateStr) return 0;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}
