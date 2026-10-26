'use client';

import React from 'react';
import {
  Code2,
  Database,
  Server,
  Cpu,
  Globe,
  Terminal,
  Smartphone,
  Sparkles,
  Layers,
  Workflow,
  Shield,
  BarChart3,
  TestTube,
  Flame,
  Zap,
} from 'lucide-react';

export type TechCategory =
  | 'Frontend'
  | 'Backend'
  | 'Database & Cache'
  | 'DevOps & Cloud'
  | 'AI & Machine Learning'
  | 'Mobile'
  | 'Testing & Tools'
  | 'Other';

interface TechMeta {
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
    lower.includes('compose') ||
    lower.includes('kubernetes') ||
    lower.includes('aws') ||
    lower.includes('gcp') ||
    lower.includes('cloud') ||
    lower.includes('appwrite') ||
    lower.includes('cloudflare') ||
    lower.includes('turnstile') ||
    lower.includes('sentry') ||
    lower.includes('git') ||
    lower.includes('linux') ||
    lower.includes('nginx')
  ) {
    return {
      name,
      category: 'DevOps & Cloud',
      color: '#3b82f6', // Blue
      bgColor: 'rgba(59, 130, 246, 0.12)',
      borderColor: 'rgba(59, 130, 246, 0.3)',
    };
  }

  // 5. Testing & Quality
  if (
    lower.includes('pest') ||
    lower.includes('phpunit') ||
    lower.includes('test') ||
    lower.includes('jest') ||
    lower.includes('cypress') ||
    lower.includes('apm')
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
    lower.includes('lumen') ||
    lower.includes('python') ||
    lower.includes('fastapi') ||
    lower.includes('django') ||
    lower.includes('golang') ||
    lower.includes('go ') ||
    lower.includes('echo') ||
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

interface TechIconProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBackground?: boolean;
  className?: string;
}

const SIZE_MAP = {
  xs: { icon: 12, box: 'w-5 h-5 rounded-md' },
  sm: { icon: 14, box: 'w-6 h-6 rounded-lg' },
  md: { icon: 18, box: 'w-8 h-8 rounded-xl' },
  lg: { icon: 22, box: 'w-10 h-10 rounded-2xl' },
  xl: { icon: 28, box: 'w-13 h-13 rounded-2xl' },
};

/**
 * Dedicated Brand & Fallback SVG Icon Renderer
 */
export const TechIcon: React.FC<TechIconProps> = ({
  name,
  size = 'md',
  showBackground = true,
  className = '',
}) => {
  const meta = getTechMeta(name);
  const lower = name.toLowerCase();
  const { icon: iconSize, box: boxClass } = SIZE_MAP[size];

  // Specific high-fidelity SVG icons for major tech
  const renderSvg = () => {
    // 1. React
    if (lower.includes('react') && !lower.includes('flow')) {
      return (
        <svg viewBox="-11.5 -10.23174 23 20.46348" width={iconSize} height={iconSize} fill="none">
          <circle cx="0" cy="0" r="2.05" fill="#61DAFB" />
          <g stroke="#61DAFB" strokeWidth="1" fill="none">
            <ellipse rx="11" ry="4.2" />
            <ellipse rx="11" ry="4.2" transform="rotate(60)" />
            <ellipse rx="11" ry="4.2" transform="rotate(120)" />
          </g>
        </svg>
      );
    }

    // 2. Next.js
    if (lower.includes('next.js') || lower.includes('next')) {
      return (
        <svg viewBox="0 0 180 180" width={iconSize} height={iconSize} fill="none">
          <mask height="180" id="mask0" maskUnits="userSpaceOnUse" width="180" x="0" y="0">
            <circle cx="90" cy="90" fill="white" r="90" />
          </mask>
          <g mask="url(#mask0)">
            <circle cx="90" cy="90" fill="#000000" r="90" stroke="white" strokeWidth="6" />
            <path
              d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z"
              fill="white"
            />
            <rect fill="white" height="72" width="12" x="115" y="54" />
          </g>
        </svg>
      );
    }

    // 3. TypeScript
    if (lower.includes('typescript') || lower === 'ts') {
      return (
        <svg viewBox="0 0 24 24" width={iconSize} height={iconSize} fill="none">
          <rect width="24" height="24" rx="4" fill="#3178C6" />
          <path
            d="M12.8 17.5c.8.5 1.8.8 2.8.8 1.4 0 2.2-.6 2.2-1.5 0-1-.8-1.5-2.2-2.1-1.8-.7-3-1.6-3-3.4 0-2 1.6-3.4 3.9-3.4 1.1 0 2 .3 2.7.7l-.6 1.8c-.6-.4-1.3-.6-2.1-.6-1.1 0-1.8.6-1.8 1.4 0 .9.7 1.3 2.1 1.9 1.9.8 3.1 1.7 3.1 3.6 0 2.2-1.7 3.6-4.3 3.6-1.3 0-2.5-.4-3.4-.9l.6-1.9zM5.5 10.1h7v2.1H9.8v7.4H7.5v-7.4H5.5v-2.1z"
            fill="white"
          />
        </svg>
      );
    }

    // 4. JavaScript
    if (lower.includes('javascript') || lower === 'js') {
      return (
        <svg viewBox="0 0 24 24" width={iconSize} height={iconSize} fill="none">
          <rect width="24" height="24" rx="4" fill="#F7DF1E" />
          <path
            d="M13.5 17.5c.8.5 1.7.8 2.7.8 1.3 0 2.1-.6 2.1-1.5 0-1-.8-1.5-2.1-2.1-1.8-.7-2.9-1.6-2.9-3.4 0-2 1.5-3.4 3.7-3.4 1.1 0 1.9.3 2.6.7l-.6 1.8c-.6-.4-1.2-.6-2-.6-1 0-1.7.6-1.7 1.4 0 .9.7 1.3 2 1.9 1.8.8 3 1.7 3 3.6 0 2.2-1.6 3.6-4.1 3.6-1.2 0-2.4-.4-3.3-.9l.6-1.9zM7.5 10.1h2.2v7.2c0 1.5-.7 2.2-2.2 2.2-.6 0-1.2-.1-1.6-.3l.3-1.8c.3.1.6.2.9.2.7 0 1-.3 1-1V10.1z"
            fill="#000000"
          />
        </svg>
      );
    }

    // 5. Python
    if (lower.includes('python')) {
      return (
        <svg viewBox="0 0 24 24" width={iconSize} height={iconSize}>
          <path
            d="M11.9 2c-3.1 0-5 .6-5 2.6v2h5.1v.7H4.4C2.4 7.3 2 9.2 2 12.3c0 3.3.6 5 2.4 5h1.5v-2.2c0-2.3 2-4.1 4.3-4.1h5.1v-.8c0-2.7-1.7-8.2-3.4-8.2zm-2.2 1.5c.5 0 .9.4.9.9s-.4.9-.9.9-.9-.4-.9-.9.4-.9.9-.9z"
            fill="#3776AB"
          />
          <path
            d="M12.1 22c3.1 0 5-.6 5-2.6v-2H12v-.7h7.6c2 0 2.4-1.9 2.4-5 0-3.3-.6-5-2.4-5h-1.5v2.2c0 2.3-2 4.1-4.3 4.1H8.7v.8c0 2.7 1.7 8.2 3.4 8.2zm2.2-1.5c-.5 0-.9-.4-.9-.9s.4-.9.9-.9.9.4.9.9-.4.9-.9.9z"
            fill="#FFD43B"
          />
        </svg>
      );
    }

    // 6. Tailwind CSS
    if (lower.includes('tailwind')) {
      return (
        <svg viewBox="0 0 24 24" width={iconSize} height={iconSize} fill="#06B6D4">
          <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.335 6.182 14.975 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.335 13.382 8.975 12 6.001 12z" />
        </svg>
      );
    }

    // 7. Laravel
    if (lower.includes('laravel')) {
      return (
        <svg viewBox="0 0 24 24" width={iconSize} height={iconSize} fill="#FF2D20">
          <path d="M10.8 2.7l7.8 4.5c.4.2.6.6.6 1v8.8c0 .4-.2.8-.6 1l-7.8 4.5c-.4.2-.8.2-1.2 0L1.8 18c-.4-.2-.6-.6-.6-1V8.2c0-.4.2-.8.6-1l7.8-4.5c.4-.2.8-.2 1.2 0zm-1 16.5l6.5-3.8V8.1l-6.5-3.7-6.5 3.7v7.3l6.5 3.8z" />
          <path d="M9.8 15.5l4.5-2.6v-5l-4.5-2.6-4.5 2.6v5l4.5 2.6z" opacity="0.6" />
        </svg>
      );
    }

    // 8. Go / Golang
    if (lower.includes('go') || lower.includes('golang') || lower.includes('echo')) {
      return (
        <svg viewBox="0 0 24 24" width={iconSize} height={iconSize} fill="#00ADD8">
          <path d="M1.5 8.5h4.2c.4 0 .7.3.7.7v1.1c0 .4-.3.7-.7.7H3.4c-.2 0-.3.1-.3.3v1.4c0 .2.1.3.3.3h1.8c.4 0 .7.3.7.7v1.1c0 .4-.3.7-.7.7H1.5c-.4 0-.7-.3-.7-.7V9.2c0-.4.3-.7.7-.7zm6.7 0h3.2c1.9 0 3.4 1.5 3.4 3.4v.7c0 1.9-1.5 3.4-3.4 3.4H8.2c-.4 0-.7-.3-.7-.7V9.2c0-.4.3-.7.7-.7zm1.9 2v3.5h1.3c.8 0 1.4-.6 1.4-1.4v-.7c0-.8-.6-1.4-1.4-1.4h-1.3zm6.6 0c0-1.1.9-2 2-2s2 .9 2 2v4c0 1.1-.9 2-2 2s-2-.9-2-2v-4z" />
        </svg>
      );
    }

    // 9. PHP
    if (lower === 'php' || lower.includes('php 8') || lower.includes('phpunit')) {
      return (
        <svg viewBox="0 0 24 24" width={iconSize} height={iconSize} fill="#777BB4">
          <ellipse cx="12" cy="12" rx="11" ry="6.5" stroke="#777BB4" strokeWidth="1.5" fill="none" />
          <path
            d="M6 14.5l.8-5h2.2c1 0 1.7.5 1.7 1.5 0 1.2-.8 2-2 2H7.4l-.4 1.5H6zm1.9-3.2h.9c.5 0 .8-.2.8-.6 0-.3-.2-.5-.6-.5H8.2l-.3 1.1zm3.8 3.2l.8-5h1.5l-.3 1.8h.1c.3-.5.8-.8 1.4-.8.9 0 1.4.6 1.4 1.7 0 .2 0 .4-.1.7l-.4 1.6H15l.4-1.6c0-.2.1-.4.1-.5 0-.5-.3-.7-.7-.7-.4 0-.7.3-.8.7l-.4 2.1h-1.9zm5.5 0l.8-5h2.2c1 0 1.7.5 1.7 1.5 0 1.2-.8 2-2 2h-1.3l-.4 1.5h-1zm1.9-3.2h.9c.5 0 .8-.2.8-.6 0-.3-.2-.5-.6-.5h-.7l-.4 1.1z"
            fill="#777BB4"
          />
        </svg>
      );
    }

    // 10. PostgreSQL
    if (lower.includes('postgres') || lower.includes('pgvector')) {
      return (
        <svg viewBox="0 0 24 24" width={iconSize} height={iconSize} fill="#336791">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16.93V15.5c0-.83-.67-1.5-1.5-1.5S10 14.67 10 15.5v3.43c-3.39-.49-6-3.39-6-6.93 0-3.86 3.14-7 7-7s7 3.14 7 7c0 3.54-2.61 6.44-6 6.93z" />
          <circle cx="8.5" cy="10.5" r="1.5" fill="#336791" />
          <circle cx="15.5" cy="10.5" r="1.5" fill="#336791" />
        </svg>
      );
    }

    // 11. Redis
    if (lower.includes('redis')) {
      return (
        <svg viewBox="0 0 24 24" width={iconSize} height={iconSize} fill="#DC382D">
          <path d="M2 7l10-4 10 4-10 4-10-4zm0 5l10 4 10-4v2l-10 4-10-4v-2zm0 5l10 4 10-4v2l-10 4-10-4v-2z" />
        </svg>
      );
    }

    // 12. Docker
    if (lower.includes('docker')) {
      return (
        <svg viewBox="0 0 24 24" width={iconSize} height={iconSize} fill="#2496ED">
          <path d="M13 5h2v2h-2V5zm-3 0h2v2h-2V5zm6 0h2v2h-2V5zm-9 3h2v2H7V8zm3 0h2v2h-2V8zm3 0h2v2h-2V8zm3 0h2v2h-2V8zM1 12.5C1 16.64 4.36 20 8.5 20c4.14 0 7.5-3.36 7.5-7.5H1v-.01c0 .01.01.01.01.01H1v-.01c.21-1.39 1.15-2.58 2.47-3.08C3.15 8.94 3 8.39 3 7.8c0-1.88 1.52-3.4 3.4-3.4.67 0 1.3.2 1.83.54C9.17 3.73 10.96 3 13 3c4.97 0 9 4.03 9 9 0 .68-.08 1.35-.23 1.99 1.4.88 2.23 2.45 2.23 4.14 0 .3-.03.6-.08.9-1.2.66-2.58 1.02-4.04 1.02-.92 0-1.81-.14-2.65-.41C16.14 20.48 14.4 21 12.5 21 7.25 21 3 16.75 3 11.5H1v1z" />
        </svg>
      );
    }

    // 13. Flutter / Dart
    if (lower.includes('flutter') || lower.includes('dart')) {
      return (
        <svg viewBox="0 0 24 24" width={iconSize} height={iconSize} fill="#02569B">
          <path d="M14.3 2L5 11.3l2.8 2.8L19.9 2h-5.6zm0 10.3l-5.6 5.6 2.8 2.8 8.4-8.4h-5.6z" />
          <path d="M8.7 17.9L11.5 20.7 17.1 15.1 14.3 12.3z" fill="#0175C2" />
        </svg>
      );
    }

    // 14. FastAPI / Lightning
    if (lower.includes('fastapi')) {
      return (
        <svg viewBox="0 0 24 24" width={iconSize} height={iconSize} fill="#009688">
          <circle cx="12" cy="12" r="10" stroke="#009688" strokeWidth="2" fill="none" />
          <path d="M11 4L6 13h5l-1 7 7-10h-6l1-6z" fill="#009688" />
        </svg>
      );
    }

    // 15. Three.js / WebGL
    if (lower.includes('three') || lower.includes('webgl') || lower.includes('3d')) {
      return (
        <svg viewBox="0 0 24 24" width={iconSize} height={iconSize} stroke="#ffffff" strokeWidth="1.5" fill="none">
          <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" />
          <path d="M12 22V12" />
          <path d="M21 7l-9 5-9-5" />
        </svg>
      );
    }

    // 16. Appwrite
    if (lower.includes('appwrite')) {
      return (
        <svg viewBox="0 0 24 24" width={iconSize} height={iconSize} fill="#FD366E">
          <path d="M12 2L2 22h5l2.5-5.5h5L17 22h5L12 2zm0 6l1.8 4h-3.6L12 8z" />
        </svg>
      );
    }

    // Category-based Lucide fallback
    switch (meta.category) {
      case 'Frontend':
        return <Code2 size={iconSize} style={{ color: meta.color }} />;
      case 'Backend':
        return <Server size={iconSize} style={{ color: meta.color }} />;
      case 'Database & Cache':
        return <Database size={iconSize} style={{ color: meta.color }} />;
      case 'DevOps & Cloud':
        return <Layers size={iconSize} style={{ color: meta.color }} />;
      case 'AI & Machine Learning':
        return <Sparkles size={iconSize} style={{ color: meta.color }} />;
      case 'Mobile':
        return <Smartphone size={iconSize} style={{ color: meta.color }} />;
      case 'Testing & Tools':
        return <TestTube size={iconSize} style={{ color: meta.color }} />;
      default:
        return <Globe size={iconSize} style={{ color: meta.color }} />;
    }
  };

  if (!showBackground) {
    return <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>{renderSvg()}</span>;
  }

  return (
    <div
      className={`inline-flex items-center justify-center border shrink-0 transition-transform ${boxClass} ${className}`}
      style={{
        backgroundColor: meta.bgColor,
        borderColor: meta.borderColor,
      }}
      title={`${meta.name} (${meta.category})`}
    >
      {renderSvg()}
    </div>
  );
};
