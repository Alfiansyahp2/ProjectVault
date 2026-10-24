import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  title: 'ProjectVault — Portfolio Vault & AI Job Tracker',
  description: 'Single Source of Truth portofolio proyek, pelacak lamaran kerja Kanban, dan mesin analisis semantik lowongan kerja berbasis AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={jakarta.variable} suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        <div className="ambient-glow" aria-hidden="true" />
        <Navbar />
        <main className="flex-1 relative z-10">
          {children}
        </main>
        <footer className="relative z-10 border-t border-slate-800/80 bg-[#090d16]/90 backdrop-blur-xl py-6 text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-200">ProjectVault</span>
              <span className="text-slate-600">&bull;</span>
              <span>Personal Portfolio & AI Job Hunting Engine</span>
            </div>
            <p className="text-slate-400">
              Next.js 16 &bull; Python FastAPI &bull; Appwrite Cloud &bull; Local-First
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
