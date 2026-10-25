import fs from 'fs';
import path from 'path';
import { parseProjectMarkdown, CATEGORY_ORDER } from './markdown-parser';
import { inspectLocalDirectory } from './tech-detector';
import { syncProjectsToAppwrite } from './cloud-sync';

export interface ProjectSyncResult {
  success: boolean;
  message?: string;
  error?: string;
  stats?: {
    total: number;
    newGenerated: number;
    updated: number;
    appwriteSynced: number;
    categories: Record<string, number>;
  };
  details?: {
    newProjects: string[];
    updatedProjects: string[];
  };
  projects?: any[];
}

export interface ProjectSyncStatus {
  status: string;
  projectMdExists: boolean;
  projectsInMarkdown: number;
  projectsCompiled: number;
  needsSync: boolean;
}

export class ProjectScannerService {
  private static getPaths() {
    const cwd = process.cwd();
    return {
      projectMdPath: path.join(cwd, 'data', 'project', 'project.md'),
      projectsBaseDir: path.join(cwd, 'data', 'project'),
      allProjectsJsonPath: path.join(cwd, 'data', 'all_projects.json')
    };
  }

  public static async syncFromMarkdown(): Promise<ProjectSyncResult> {
    const { projectMdPath, projectsBaseDir, allProjectsJsonPath } = this.getPaths();

    if (!fs.existsSync(projectMdPath)) {
      return {
        success: false,
        error: 'File data/project/project.md tidak ditemukan.'
      };
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
        // NEW project: Automatically inspect local folder and generate schemas
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

    // Appwrite sync if configured
    const appwriteSyncCount = await syncProjectsToAppwrite(allProjects);

    // Category summary stats
    const catStats: Record<string, number> = {};
    allProjects.forEach(p => {
      const c = p.category || 'Lainnya';
      catStats[c] = (catStats[c] || 0) + 1;
    });

    return {
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
    };
  }

  public static getSyncStatus(): ProjectSyncStatus {
    const { projectMdPath, allProjectsJsonPath } = this.getPaths();
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

    return {
      status: 'ready',
      projectMdExists: exists,
      projectsInMarkdown: totalInMd,
      projectsCompiled: totalInJson,
      needsSync: totalInMd !== totalInJson
    };
  }
}
