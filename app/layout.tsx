import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'ProjectVault - Pelacak Portofolio, Proyek & Surat Lamaran AI',
  description: 'Aplikasi manajemen portofolio proyek, pelacak lamaran kerja, dan pencocokan lowongan cerdas berbasis Next.js, Python, dan Appwrite.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans antialiased">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-6 text-center text-xs text-zinc-500">
          <div className="max-w-7xl mx-auto px-4">
            <p>
              ProjectVault &copy; {new Date().getFullYear()} &mdash; Dibangun dengan Next.js, Python (FastAPI), dan siap dihosting di Vercel + Appwrite.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
