import fs from 'fs';
import path from 'path';

export interface InspectedProjectDetails {
  technologies: string[];
  role: string;
  description: string;
  achievements: string[];
  repoUrl: string;
}

/**
 * Inspect a local project folder to infer tech stack, role, description, and achievements.
 */
export function inspectLocalDirectory(dirPath: string): InspectedProjectDetails {
  const result: InspectedProjectDetails = {
    technologies: [],
    role: 'Full Stack Web Developer',
    description: '',
    achievements: [],
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
