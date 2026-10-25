import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

interface ParsedMdProject {
  title: string;
  category: string;
  slug: string;
  paths: string[];
  rawContent: string;
  descriptionBullets: string[];
}

// Map headings to standard categories
function normalizeCategory(raw: string): string {
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

// Parse project.md file
function parseProjectMarkdown(content: string): ParsedMdProject[] {
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

// Inspect a local project folder to infer tech stack, role, description
function inspectLocalDirectory(dirPath: string): {
  technologies: string[];
  role: string;
  description: string;
  achievements: string[];
  repoUrl: string;
} {
  const result = {
    technologies: [] as string[],
    role: 'Full Stack Web Developer',
    description: '',
    achievements: [] as string[],
    repoUrl: ''
  };

  if (!fs.existsSync(dirPath)) return result;

  try {
    // 1. Check git remote
    const gitConfigPath = path.join(dirPath, '.git', 'config');
    if (fs.existsSync(gitConfigPath)) {
      const gitConfig = fs.readFileSync(gitConfigPath, 'utf-8');
      const remoteMatch = gitConfig.match(/url\s*=\s*(https?:\/\/[^\s]+|git@[^\s]+)/);
      if (remoteMatch) {
        let u = remoteMatch[1].trim();
        if (u.startsWith('git@')) {
          u = u.replace('git@', 'https://').replace(':', '/');
        }
        result.repoUrl = u;
      }
    }

    // 2. Check package.json
    const pkgPath = path.join(dirPath, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
        if (deps['next']) result.technologies.push('Next.js');
        if (deps['react']) result.technologies.push('React');
        if (deps['vue'] || deps['nuxt']) result.technologies.push('Vue.js / Nuxt');
        if (deps['typescript']) result.technologies.push('TypeScript');
        if (deps['tailwindcss']) result.technologies.push('Tailwind CSS');
        if (deps['express']) result.technologies.push('Express.js');
        if (deps['@tanstack/react-query']) result.technologies.push('TanStack Query');
        if (deps['zustand']) result.technologies.push('Zustand');
        if (deps['framer-motion']) result.technologies.push('Framer Motion');
        if (deps['prisma'] || deps['@prisma/client']) result.technologies.push('Prisma ORM');
        if (pkg.description && !result.description) {
          result.description = pkg.description;
        }
      } catch {}
    }

    // 3. Check composer.json
    const compPath = path.join(dirPath, 'composer.json');
    if (fs.existsSync(compPath)) {
      try {
        const comp = JSON.parse(fs.readFileSync(compPath, 'utf-8'));
        const reqs = { ...(comp.require || {}) };
        if (reqs['laravel/framework']) result.technologies.push('Laravel');
        if (reqs['laravel/lumen-framework']) result.technologies.push('Lumen Microservice');
        if (reqs['livewire/livewire']) result.technologies.push('Livewire');
        if (reqs['php']) result.technologies.push('PHP');
        if (reqs['laravel/sanctum'] || reqs['laravel/passport']) result.technologies.push('Sanctum / Passport');
        if (comp.description && !result.description) {
          result.description = comp.description;
        }
      } catch {}
    }

    // 4. Check pubspec.yaml (Flutter)
    const pubPath = path.join(dirPath, 'pubspec.yaml');
    if (fs.existsSync(pubPath)) {
      result.technologies.push('Flutter', 'Dart');
      result.role = 'Mobile & Backend Developer';
    }

    // 5. Check Python (requirements.txt / pyproject.toml)
    const reqPath = path.join(dirPath, 'requirements.txt');
    if (fs.existsSync(reqPath)) {
      result.technologies.push('Python');
      const reqTxt = fs.readFileSync(reqPath, 'utf-8');
      if (reqTxt.includes('fastapi')) result.technologies.push('FastAPI');
      if (reqTxt.includes('django')) result.technologies.push('Django');
      if (reqTxt.includes('playwright') || reqTxt.includes('beautifulsoup4')) result.technologies.push('Playwright / Web Scraping');
      if (reqTxt.includes('google-genai') || reqTxt.includes('gemini')) result.technologies.push('Google Gemini AI');
    }

    // 6. Check README.md
    for (const rName of ['README.md', 'readme.md']) {
      const rPath = path.join(dirPath, rName);
      if (fs.existsSync(rPath)) {
        const readmeContent = fs.readFileSync(rPath, 'utf-8');
        const lines = readmeContent.split('\n');
        for (const l of lines) {
          const trimmed = l.trim();
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const ach = trimmed.replace(/^[-*]\s*/, '').trim();
            if (ach.length > 20 && result.achievements.length < 4) {
              result.achievements.push(ach);
            }
          }
        }
        if (!result.description) {
          const nonHeader = lines.find(l => l.trim().length > 30 && !l.startsWith('#') && !l.startsWith('!'));
          if (nonHeader) result.description = nonHeader.trim();
        }
        break;
      }
    }
  } catch (err) {
    console.error(`Error inspecting ${dirPath}:`, err);
  }

  return result;
}

// Category ordering map
const CATEGORY_ORDER: Record<string, number> = {
  'Projek di SEVIMA': 1,
  'My Produk': 2,
  'Freelance': 3,
  'Research & Thesis': 4,
  'Test': 5
};

export async function POST() {
  try {
    const cwd = process.cwd();
    const projectMdPath = path.join(cwd, 'data', 'project', 'project.md');
    const projectsBaseDir = path.join(cwd, 'data', 'project');
    const allProjectsJsonPath = path.join(cwd, 'data', 'all_projects.json');

    if (!fs.existsSync(projectMdPath)) {
      return NextResponse.json(
        { success: false, error: 'File data/project/project.md tidak ditemukan.' },
        { status: 404 }
      );
    }

    const mdContent = fs.readFileSync(projectMdPath, 'utf-8');
    const mdProjects = parseProjectMarkdown(mdContent);

    const generatedProjects: string[] = [];
    const updatedProjects: string[] = [];

    // Process each project found in project.md
    for (const item of mdProjects) {
      const projDir = path.join(projectsBaseDir, item.slug);
      const jsonPath = path.join(projDir, 'project.json');
      const auditPath = path.join(projDir, 'audit.md');

      if (!fs.existsSync(projDir)) {
        fs.mkdirSync(projDir, { recursive: true });
      }

      let projectData: any = null;

      if (fs.existsSync(jsonPath)) {
        // Existing project: Check for category sync or metadata update
        try {
          projectData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
          let changed = false;

          if (projectData.category !== item.category) {
            projectData.category = item.category;
            changed = true;
          }

          if (changed) {
            fs.writeFileSync(jsonPath, JSON.stringify(projectData, null, 2), 'utf-8');
            if (fs.existsSync(auditPath)) {
              let auditContent = fs.readFileSync(auditPath, 'utf-8');
              auditContent = auditContent.replace(
                /"category":\s*"[^"]+"/,
                `"category": "${item.category}"`
              );
              fs.writeFileSync(auditPath, auditContent, 'utf-8');
            }
            updatedProjects.push(`${item.title} (Kategori: ${item.category})`);
          }
        } catch (e) {
          console.error(`Error reading ${jsonPath}:`, e);
        }
      } else {
        // NEW project: Automatically inspect local folder and generate schemas!
        let inspected = {
          technologies: [] as string[],
          role: 'Full Stack Engineer',
          description: '',
          achievements: [] as string[],
          repoUrl: ''
        };

        for (const p of item.paths) {
          if (fs.existsSync(p)) {
            const insp = inspectLocalDirectory(p);
            inspected.technologies.push(...insp.technologies);
            if (insp.role) inspected.role = insp.role;
            if (insp.description && !inspected.description) inspected.description = insp.description;
            if (insp.achievements.length > 0) inspected.achievements.push(...insp.achievements);
            if (insp.repoUrl && !inspected.repoUrl) inspected.repoUrl = insp.repoUrl;
          }
        }

        // Deduplicate tech
        const techList = Array.from(new Set(inspected.technologies));
        if (techList.length === 0) techList.push('TypeScript', 'React', 'Node.js');

        const desc = item.descriptionBullets.join(' ') || inspected.description || `Sistem ${item.title} dengan arsitektur terintegrasi dan performa tinggi.`;
        const achievementsStr = inspected.achievements.length > 0
          ? inspected.achievements.map(a => `• ${a}`).join('\n')
          : (item.descriptionBullets.length > 0 ? item.descriptionBullets.map(b => `• ${b}`).join('\n') : `• Mengembangkan dan mengimplementasikan fitur inti sistem ${item.title}.`);

        projectData = {
          title: item.title,
          role: inspected.role,
          category: item.category,
          technologies: techList,
          description: desc,
          achievements: achievementsStr,
          repo_url: inspected.repoUrl || '',
          demo_url: '',
          date: '2026'
        };

        // Write project.json
        fs.writeFileSync(jsonPath, JSON.stringify(projectData, null, 2), 'utf-8');

        // Write audit.md
        const auditMarkdown = `# Audit Proyek: ${item.title}

## 1. Metadata Proyek
- **Slug:** \`${item.slug}\`
- **Path Sumber:** ${item.paths.map(p => `\`${p}\``).join(', ') || 'N/A'}
- **Repository Git:** ${projectData.repo_url || 'N/A'}
- **Tanggal/Tahun:** 2026
- **Kategori:** ${item.category}
- **Status Audit:** Auto-Generated dari project.md

---

## 2. Profil Portofolio

\`\`\`json
${JSON.stringify(projectData, null, 2)}
\`\`\`

---

## 3. Detail Arsitektur & Catatan
${item.descriptionBullets.map(b => `- ${b}`).join('\n') || '- Proyek siap untuk integrasi dan pengayaan teknis lanjutan.'}
`;
        fs.writeFileSync(auditPath, auditMarkdown, 'utf-8');
        generatedProjects.push(`${item.title} (${item.category})`);
      }
    }

    // Recompile data/all_projects.json
    const allProjects: any[] = [];
    const entries = fs.readdirSync(projectsBaseDir, { withFileTypes: true });

    for (const ent of entries) {
      if (ent.isDirectory()) {
        const pJson = path.join(projectsBaseDir, ent.name, 'project.json');
        if (fs.existsSync(pJson)) {
          try {
            const data = JSON.parse(fs.readFileSync(pJson, 'utf-8'));
            data.id = ent.name;
            if (!data.createdAt) {
              data.createdAt = new Date().toISOString();
            }
            allProjects.push(data);
          } catch {}
        }
      }
    }

    // Sort by category order then title
    allProjects.sort((a, b) => {
      const orderA = CATEGORY_ORDER[a.category] || 99;
      const orderB = CATEGORY_ORDER[b.category] || 99;
      if (orderA !== orderB) return orderA - orderB;
      return (a.title || '').localeCompare(b.title || '');
    });

    fs.writeFileSync(allProjectsJsonPath, JSON.stringify(allProjects, null, 2), 'utf-8');

    // Optional Appwrite Sync if environment variables are set
    let appwriteSyncCount = 0;
    const appwriteEndpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const appwriteProjectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const appwriteDbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const appwriteProjectsCol = process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION;

    if (appwriteEndpoint && appwriteProjectId && appwriteDbId && appwriteProjectsCol) {
      try {
        const headers: Record<string, string> = {
          'X-Appwrite-Project': appwriteProjectId,
          'Content-Type': 'application/json'
        };

        const res = await fetch(
          `${appwriteEndpoint}/databases/${appwriteDbId}/collections/${appwriteProjectsCol}/documents?limit=100`,
          { headers, cache: 'no-store' }
        );

        if (res.ok) {
          const data = await res.json();
          const existingDocs = data.documents || [];
          const existingMap = new Map<string, any>();
          existingDocs.forEach((d: any) => {
            existingMap.set((d.title || '').trim().toLowerCase(), d);
          });

          for (const p of allProjects) {
            const key = (p.title || '').trim().toLowerCase();
            const payload: any = {
              title: p.title,
              role: p.role,
              category: p.category,
              technologies: p.technologies,
              description: p.description,
              achievements: p.achievements,
              date: p.date || '2026'
            };

            if (p.repo_url && p.repo_url.startsWith('http')) {
              payload.repo_url = p.repo_url;
            }
            if (p.demo_url && p.demo_url.startsWith('http')) {
              payload.demo_url = p.demo_url;
            }

            if (existingMap.has(key)) {
              const docId = existingMap.get(key).$id;
              await fetch(
                `${appwriteEndpoint}/databases/${appwriteDbId}/collections/${appwriteProjectsCol}/documents/${docId}`,
                {
                  method: 'PATCH',
                  headers,
                  body: JSON.stringify({ data: payload })
                }
              );
              appwriteSyncCount++;
            } else {
              await fetch(
                `${appwriteEndpoint}/databases/${appwriteDbId}/collections/${appwriteProjectsCol}/documents`,
                {
                  method: 'POST',
                  headers,
                  body: JSON.stringify({
                    documentId: 'unique()',
                    data: payload
                  })
                }
              );
              appwriteSyncCount++;
            }
          }
        }
      } catch (cloudErr) {
        console.warn('Appwrite cloud sync skipped or timed out:', cloudErr);
      }
    }

    // Category summary stats
    const catStats: Record<string, number> = {};
    allProjects.forEach(p => {
      const c = p.category || 'Lainnya';
      catStats[c] = (catStats[c] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      message: `Sinkronisasi project.md selesai! ${allProjects.length} proyek aktif.`,
      stats: {
        total: allProjects.length,
        newGenerated: generatedProjects.length,
        updated: updatedProjects.length,
        appwriteSynced: appwriteSyncCount,
        categories: catStats
      },
      details: {
        newProjects: generatedProjects,
        updatedProjects: updatedProjects
      },
      projects: allProjects
    });
  } catch (error: any) {
    console.error('API Error in /api/projects/sync:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal menyinkronkan project.md' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const cwd = process.cwd();
  const projectMdPath = path.join(cwd, 'data', 'project', 'project.md');
  const allProjectsJsonPath = path.join(cwd, 'data', 'all_projects.json');

  const exists = fs.existsSync(projectMdPath);
  let totalInMd = 0;
  let totalInJson = 0;

  if (exists) {
    const mdContent = fs.readFileSync(projectMdPath, 'utf-8');
    totalInMd = parseProjectMarkdown(mdContent).length;
  }

  if (fs.existsSync(allProjectsJsonPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(allProjectsJsonPath, 'utf-8'));
      totalInJson = data.length;
    } catch {}
  }

  return NextResponse.json({
    status: 'ready',
    projectMdExists: exists,
    projectsInMarkdown: totalInMd,
    projectsCompiled: totalInJson,
    needsSync: totalInMd !== totalInJson
  });
}
