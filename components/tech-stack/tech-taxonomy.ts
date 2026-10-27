export type TechCategory =
  | 'Frontend'
  | 'Backend'
  | 'Database & Cache'
  | 'DevOps & Cloud'
  | 'AI & Machine Learning'
  | 'Mobile'
  | 'Testing & Tools'
  | 'Other';

export interface TechMeta {
  name: string;
  category: TechCategory;
  color: string;
  bgColor: string;
  borderColor: string;
}

/**
 * Intelligent categorization and color coding for any technology
 */
export function getTechMeta(rawName: string): TechMeta {
  const name = rawName.trim();
  const lower = name.toLowerCase();

  // 1. Mobile
  if (lower.includes('flutter') || lower.includes('dart') || lower.includes('react native') || lower.includes('android') || lower.includes('ios') || lower.includes('swift') || lower.includes('kotlin')) {
    return {
      name,
      category: 'Mobile',
      color: '#0284c7', // Sky
      bgColor: 'rgba(2, 132, 199, 0.12)',
      borderColor: 'rgba(2, 132, 199, 0.3)',
    };
  }

  // 2. AI / ML / Data Science / Scraping
  if (
    lower.includes('gemini') ||
    lower.includes('ai') ||
    lower.includes('machine learning') ||
    lower.includes('deep learning') ||
    lower.includes('pytorch') ||
    lower.includes('tensorflow') ||
    lower.includes('playwright') ||
    lower.includes('scraping') ||
    lower.includes('nlp') ||
    lower.includes('pandas') ||
    lower.includes('numpy') ||
    lower.includes('scikit') ||
    lower.includes('pgvector')
  ) {
    return {
      name,
      category: 'AI & Machine Learning',
      color: '#a855f7', // Purple
      bgColor: 'rgba(168, 85, 247, 0.12)',
      borderColor: 'rgba(168, 85, 247, 0.3)',
    };
  }

  // 3. Database & Caching
  if (
    lower.includes('postgres') ||
    lower.includes('mysql') ||
    lower.includes('redis') ||
    lower.includes('mongo') ||
    lower.includes('sqlite') ||
    lower.includes('database') ||
    lower.includes('sql') ||
    lower.includes('prisma') ||
    lower.includes('algolia') ||
    lower.includes('feeder')
  ) {
    return {
      name,
      category: 'Database & Cache',
      color: '#06b6d4', // Cyan
      bgColor: 'rgba(6, 182, 212, 0.12)',
      borderColor: 'rgba(6, 182, 212, 0.3)',
    };
  }

  // 4. DevOps & Cloud
  if (
    lower.includes('docker') ||
    lower.includes('aws') ||
    lower.includes('gcp') ||
    lower.includes('azure') ||
    lower.includes('ci/cd') ||
    lower.includes('github actions') ||
    lower.includes('vercel') ||
    lower.includes('nginx') ||
    lower.includes('linux') ||
    lower.includes('kubernetes') ||
    lower.includes('cloud') ||
    lower.includes('appwrite')
  ) {
    return {
      name,
      category: 'DevOps & Cloud',
      color: '#3b82f6', // Blue
      bgColor: 'rgba(59, 130, 246, 0.12)',
      borderColor: 'rgba(59, 130, 246, 0.3)',
    };
  }

  // 5. Testing & Architecture
  if (
    lower.includes('pest') ||
    lower.includes('phpunit') ||
    lower.includes('jest') ||
    lower.includes('cypress') ||
    lower.includes('clean architecture') ||
    lower.includes('design pattern') ||
    lower.includes('testing') ||
    lower.includes('tunit') ||
    lower.includes('git')
  ) {
    return {
      name,
      category: 'Testing & Tools',
      color: '#10b981', // Emerald
      bgColor: 'rgba(16, 185, 129, 0.12)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
    };
  }

  // 6. Backend
  if (
    lower.includes('laravel') ||
    lower.includes('php') ||
    lower.includes('python') ||
    lower.includes('fastapi') ||
    lower.includes('django') ||
    lower.includes('flask') ||
    lower.includes('golang') ||
    lower.includes('go ') ||
    lower.includes('node') ||
    lower.includes('express') ||
    lower.includes('nestjs') ||
    lower.includes('backend') ||
    lower.includes('api') ||
    lower.includes('passport') ||
    lower.includes('sanctum') ||
    lower.includes('celery') ||
    lower.includes('jwt') ||
    lower.includes('reverb') ||
    lower.includes('websocket')
  ) {
    return {
      name,
      category: 'Backend',
      color: '#f97316', // Orange
      bgColor: 'rgba(249, 115, 22, 0.12)',
      borderColor: 'rgba(249, 115, 22, 0.3)',
    };
  }

  // 7. Frontend
  if (
    lower.includes('react') ||
    lower.includes('next') ||
    lower.includes('vue') ||
    lower.includes('nuxt') ||
    lower.includes('typescript') ||
    lower.includes('javascript') ||
    lower.includes('tailwind') ||
    lower.includes('css') ||
    lower.includes('html') ||
    lower.includes('three') ||
    lower.includes('anime') ||
    lower.includes('gsap') ||
    lower.includes('framer') ||
    lower.includes('motion') ||
    lower.includes('material') ||
    lower.includes('mui') ||
    lower.includes('chart') ||
    lower.includes('recharts') ||
    lower.includes('redux') ||
    lower.includes('zustand') ||
    lower.includes('tanstack') ||
    lower.includes('query') ||
    lower.includes('dnd') ||
    lower.includes('vite') ||
    lower.includes('livewire') ||
    lower.includes('webgl') ||
    lower.includes('frontend')
  ) {
    return {
      name,
      category: 'Frontend',
      color: '#6366f1', // Indigo
      bgColor: 'rgba(99, 102, 241, 0.12)',
      borderColor: 'rgba(99, 102, 241, 0.3)',
    };
  }

  // Default
  return {
    name,
    category: 'Other',
    color: '#94a3b8', // Slate
    bgColor: 'rgba(148, 163, 184, 0.12)',
    borderColor: 'rgba(148, 163, 184, 0.25)',
  };
}
