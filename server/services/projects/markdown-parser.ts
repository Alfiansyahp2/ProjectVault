export interface ParsedMdProject {
  title: string;
  category: string;
  slug: string;
  paths: string[];
  rawContent: string;
  descriptionBullets: string[];
}

export const CATEGORY_ORDER: Record<string, number> = {
  'Projek di SEVIMA': 1,
  'My Produk': 2,
  'Freelance': 3,
  'Research & Thesis': 4,
  'Test': 5
};

export function normalizeCategory(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes('sevima')) return 'Projek di SEVIMA';
  if (lower.includes('produk') || lower.includes('product')) return 'My Produk';
  if (lower.includes('freelance')) return 'Freelance';
  if (lower.includes('research') || lower.includes('thesis') || lower.includes('riset') || lower.includes('skripsi')) {
    return 'Research & Thesis';
  }
  if (lower.includes('test')) return 'Test';
  return raw.trim() || 'Lainnya';
}

export function parseProjectMarkdown(content: string): ParsedMdProject[] {
  const lines = content.split(/\r?\n/);
  const projects: ParsedMdProject[] = [];
  let currentCategory = 'Lainnya';
  let currentProj: ParsedMdProject | null = null;

  for (const line of lines) {
    const raw = line.trim();

    // Section Header: ## 1. Projek di SEVIMA (4 Proyek)
    const headerMatch = raw.match(/^##\s+(?:\d+\.\s*)?([^(]+)/);
    if (headerMatch) {
      if (currentProj) {
        projects.push(currentProj);
        currentProj = null;
      }
      currentCategory = normalizeCategory(headerMatch[1]);
      continue;
    }

    // Project Bullet: - **Title:** paths -> data/project/slug
    const projMatch = raw.match(/^-\s+\*\*([^*]+)\*\*:?\s*(.*)/);
    if (projMatch) {
      if (currentProj) {
        projects.push(currentProj);
      }

      const titleRaw = projMatch[1].replace(/:$/, '').trim();
      const contentRaw = projMatch[2].trim();

      // Target slug
      const slugMatch = contentRaw.match(/->\s*`?data\/project\/([a-zA-Z0-9_\-]+)`?/);
      let slug = '';
      if (slugMatch) {
        slug = slugMatch[1].trim();
      } else {
        slug = titleRaw.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }

      // Extract source paths inside backticks
      const pathMatches = contentRaw.match(/`([^`]+)`/g) || [];
      const cleanPaths = pathMatches
        .map(p => p.replace(/`/g, '').trim())
        .filter(p => !p.startsWith('data/project/'));

      currentProj = {
        title: titleRaw,
        category: currentCategory,
        slug,
        paths: cleanPaths,
        rawContent: contentRaw,
        descriptionBullets: []
      };
      continue;
    }

    // Description bullets
    if (currentProj && (line.startsWith('  - ') || line.startsWith('    - '))) {
      const bullet = line.trim().replace(/^-\s*/, '').trim();
      if (bullet) {
        currentProj.descriptionBullets.push(bullet);
      }
    }
  }

  if (currentProj) {
    projects.push(currentProj);
  }

  return projects;
}
