import { Project } from '@/lib/types';

// Helper to parse bullet points cleanly from text
export function parseAchievements(text?: string): string[] {
  if (!text) return [];
  return text
    .split(/\n|•|\*/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

// Category color badges with tailored dark-mode aesthetics
export function getCategoryBadge(category?: string): string {
  const cat = (category || '').toLowerCase();
  if (cat.includes('sevima')) {
    return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
  }
  if (cat.includes('produk') || cat.includes('product')) {
    return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  }
  if (cat.includes('freelance')) {
    return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  }
  if (cat.includes('research') || cat.includes('thesis') || cat.includes('riset') || cat.includes('skripsi')) {
    return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
  }
  if (cat.includes('test')) {
    return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
  }
  return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25';
}

export function formatProjectForClipboard(p: Project): string {
  const bullets = parseAchievements(p.achievements);
  let text = `### Proyek: ${p.title} (${p.role})\nKategori: ${p.category}\nTeknologi: ${p.technologies.join(', ')}\nDeskripsi: ${p.description}`;
  if (bullets.length > 0) {
    text += `\nCapaian & Dampak Terukur:\n` + bullets.map(b => `- ${b}`).join('\n');
  }
  if (p.repo_url) text += `\nRepo: ${p.repo_url}`;
  if (p.demo_url) text += `\nDemo: ${p.demo_url}`;
  return text;
}
