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
  Menu,
  X,
  Database,
  TerminalSquare
} from 'lucide-react';
import { getAppwriteConfig } from '@/lib/appwrite';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pythonHealthy, setPythonHealthy] = useState<boolean | null>(null);
  const [appwriteConfigured, setAppwriteConfigured] = useState(false);

  useEffect(() => {
    const aw = getAppwriteConfig();
    setAppwriteConfigured(aw.isEnabled);

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
    <header className="sticky top-0 z-50 bg-[#090d16]/80 backdrop-blur-xl border-b border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20 group-hover:scale-105 transition-transform duration-200">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  Project<span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-purple-400 bg-clip-text text-transparent">Vault</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/[0.07] border border-white/[0.1] text-indigo-300">
                  AI v1.0
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/40 p-1 rounded-xl border border-white/[0.06] backdrop-blur-md">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Status Badges */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            {/* Python Engine Badge */}
            <div 
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                pythonHealthy === true
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25 shadow-sm shadow-emerald-500/10'
                  : pythonHealthy === false
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/25 shadow-sm shadow-amber-500/10'
                  : 'bg-slate-800/50 text-slate-400 border-white/10'
              }`}
              title={pythonHealthy ? "Python FastAPI backend aktif & siap menganalisis lowongan" : "Python backend offline (sedang memuat atau jalankan fastapi-dev)"}
            >
              <span className="relative flex h-2 w-2">
                {pythonHealthy && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${pythonHealthy ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              </span>
              <span className="flex items-center gap-1 font-medium">
                <TerminalSquare className="w-3 h-3 opacity-70" />
                Python: {pythonHealthy ? 'Siap' : 'Offline'}
              </span>
            </div>

            {/* Appwrite Badge */}
            <Link
              href="/settings"
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                appwriteConfigured
                  ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/25 hover:bg-indigo-500/20 shadow-sm shadow-indigo-500/10'
                  : 'bg-slate-800/60 text-slate-300 border-white/10 hover:border-white/20 hover:bg-slate-800'
              }`}
              title={appwriteConfigured ? "Data disinkronkan ke Appwrite Cloud" : "Mode Offline / Local-First (tersimpan di browser)"}
            >
              <Database className="w-3 h-3 opacity-80" />
              <span>{appwriteConfigured ? 'Appwrite Cloud' : 'Mode Lokal'}</span>
              {appwriteConfigured && <CheckCircle2 className="w-3 h-3 text-indigo-400" />}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/60 border border-white/10"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/[0.08] bg-[#090d16]/95 backdrop-blur-2xl px-4 pt-3 pb-5 space-y-1.5 shadow-2xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-300 hover:bg-white/[0.05]'
                }`}
              >
                <Icon className="w-4 h-4 text-indigo-400" />
                {link.label}
              </Link>
            );
          })}

          <div className="pt-3 mt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
            <span>Status: {pythonHealthy ? 'Python AI Siap' : 'Python Offline'}</span>
            <span>{appwriteConfigured ? 'Appwrite Cloud' : 'Storage Lokal'}</span>
          </div>
        </div>
      )}
    </header>
  );
}
