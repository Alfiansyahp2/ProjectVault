'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Briefcase, 
  FolderGit2, 
  Sparkles, 
  Settings, 
  LayoutDashboard, 
  CheckCircle2, 
  AlertCircle,
  Menu,
  X
} from 'lucide-react';
import { getAppwriteConfig } from '@/lib/appwrite';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pythonHealthy, setPythonHealthy] = useState<boolean | null>(null);
  const [appwriteConfigured, setAppwriteConfigured] = useState(false);

  useEffect(() => {
    // Check Appwrite status
    const aw = getAppwriteConfig();
    setAppwriteConfigured(aw.isEnabled);

    // Check Python API health
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/py/health');
        if (res.ok) {
          setPythonHealthy(true);
        } else {
          setPythonHealthy(false);
        }
      } catch (err) {
        setPythonHealthy(false);
      }
    };

    checkHealth();
  }, [pathname]);

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/projects', label: 'Bank Proyek', icon: FolderGit2 },
    { href: '/applications', label: 'Pelacak Lamaran', icon: Briefcase },
    { href: '/analyzer', label: 'AI & Analisis', icon: Sparkles },
    { href: '/settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-zinc-900 dark:text-white tracking-tight">
                Project<span className="text-blue-600 dark:text-blue-400">Vault</span>
              </span>
              <span className="text-[10px] font-medium ml-1.5 px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                Next.js + Python
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Status Badges */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Python Engine Badge */}
            <div 
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                pythonHealthy === true
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                  : pythonHealthy === false
                  ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                  : 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
              }`}
              title={pythonHealthy ? "Python FastAPI aktif & responsif" : "Python backend belum terdeteksi (jalankan fastapi-dev)"}
            >
              <span className={`w-2 h-2 rounded-full ${pythonHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              Python AI: {pythonHealthy ? 'Siap' : 'Offline'}
            </div>

            {/* Appwrite Badge */}
            <Link
              href="/settings"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                appwriteConfigured
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800'
                  : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
              }`}
            >
              {appwriteConfigured ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Appwrite: Terhubung
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-zinc-400" />
                  Mode: Lokal (Storage)
                </>
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
                    : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
