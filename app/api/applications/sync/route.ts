import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

export const dynamic = 'force-dynamic';

const execPromise = util.promisify(exec);

export async function POST() {
  try {
    const cwd = process.cwd();
    const parsedJsonPath = path.join(cwd, 'data', 'parsed_applications.json');

    // Run the Python parser script to scan data/resume and data/resume/New folder
    const scriptPath = path.join(cwd, 'scratch', 'test_parse_all_91_resumes.py');
    if (fs.existsSync(scriptPath)) {
      try {
        await execPromise(`python "${scriptPath}"`, { cwd });
      } catch (execErr) {
        console.warn('Python parser exec warning:', execErr);
      }
    }

    if (!fs.existsSync(parsedJsonPath)) {
      return NextResponse.json(
        { success: false, error: 'File data/parsed_applications.json belum tersedia.' },
        { status: 404 }
      );
    }

    const appsRaw = fs.readFileSync(parsedJsonPath, 'utf-8');
    const apps = JSON.parse(appsRaw);

    // Sync to Appwrite Cloud if configured
    let appwriteSyncCount = 0;
    const appwriteEndpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const appwriteProjectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const appwriteDbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const appwriteAppsCol = process.env.NEXT_PUBLIC_APPWRITE_APPLICATIONS_COLLECTION;

    if (appwriteEndpoint && appwriteProjectId && appwriteDbId && appwriteAppsCol) {
      try {
        const headers: Record<string, string> = {
          'X-Appwrite-Project': appwriteProjectId,
          'Content-Type': 'application/json'
        };

        const res = await fetch(
          `${appwriteEndpoint}/databases/${appwriteDbId}/collections/${appwriteAppsCol}/documents?limit=100`,
          { headers, cache: 'no-store' }
        );

        if (res.ok) {
          const data = await res.json();
          const existingDocs = data.documents || [];
          const existingMap = new Map<string, any>();
          existingDocs.forEach((d: any) => {
            const comp = (d.company_name || '').trim().toLowerCase();
            const jt = (d.job_title || '').trim().toLowerCase();
            existingMap.set(`${comp}::${jt}`, d);
          });

          for (const appItem of apps) {
            const comp = (appItem.company_name || '').trim();
            const jt = (appItem.job_title || '').trim();
            const key = `${comp.toLowerCase()}::${jt.toLowerCase()}`;

            const payload: any = {
              company_name: comp,
              job_title: jt,
              status: appItem.status || 'applied',
              applied_date: appItem.applied_date || '2026-01-01',
              source_portal: appItem.source_portal || 'Direct',
              summary: appItem.summary || '',
              key_skills: appItem.key_skills || [],
              file_path: appItem.file_path || '',
              notes: appItem.notes || '',
              cover_letter: (appItem.cover_letter || '').slice(0, 1000)
            };

            if (existingMap.has(key)) {
              const docId = existingMap.get(key).$id;
              await fetch(
                `${appwriteEndpoint}/databases/${appwriteDbId}/collections/${appwriteAppsCol}/documents/${docId}`,
                {
                  method: 'PATCH',
                  headers,
                  body: JSON.stringify({ data: payload })
                }
              );
              appwriteSyncCount++;
            } else {
              await fetch(
                `${appwriteEndpoint}/databases/${appwriteDbId}/collections/${appwriteAppsCol}/documents`,
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

    // Portal stats
    const portalStats: Record<string, number> = {};
    apps.forEach((a: any) => {
      const p = a.source_portal || 'Direct / Other';
      portalStats[p] = (portalStats[p] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil memindai & menyinkronkan ${apps.length} berkas surat lamaran!`,
      stats: {
        totalApplications: apps.length,
        uniqueCompanies: new Set(apps.map((a: any) => a.company_name)).size,
        appwriteSynced: appwriteSyncCount,
        portals: portalStats
      },
      applications: apps
    });
  } catch (error: any) {
    console.error('Error in /api/applications/sync:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memindai surat lamaran' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const cwd = process.cwd();
  const parsedJsonPath = path.join(cwd, 'data', 'parsed_applications.json');
  const resumeDir = path.join(cwd, 'data', 'resume');
  const newFolderDir = path.join(cwd, 'data', 'resume', 'New folder');

  let fileCount = 0;
  if (fs.existsSync(resumeDir)) {
    fileCount += fs.readdirSync(resumeDir).filter(f => f.toLowerCase().endsWith('.pdf')).length;
  }
  if (fs.existsSync(newFolderDir)) {
    fileCount += fs.readdirSync(newFolderDir).filter(f => f.toLowerCase().endsWith('.pdf')).length;
  }

  let parsedCount = 0;
  if (fs.existsSync(parsedJsonPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(parsedJsonPath, 'utf-8'));
      parsedCount = data.length;
    } catch {}
  }

  return NextResponse.json({
    status: 'ready',
    totalPdfFiles: fileCount,
    parsedApplications: parsedCount,
    needsSync: fileCount !== parsedCount
  });
}
