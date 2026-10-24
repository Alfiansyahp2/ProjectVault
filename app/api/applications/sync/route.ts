import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const execPromise = util.promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const cwd = process.cwd();
    const parsedJsonPath = path.join(cwd, 'data', 'parsed_applications.json');
    const parserScript = path.join(cwd, 'scratch', 'batch_parser.py');

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const batchSize = body?.batchSize;
    const isReset = Boolean(body?.reset);
    const resetLimit = typeof body?.resetLimit === 'number' ? body.resetLimit : 25;

    let cmd = `python "${parserScript}"`;

    if (isReset) {
      cmd += ` --reset ${resetLimit}`;
    } else if (batchSize === 'all') {
      cmd += ` --batch-size all`;
    } else if (typeof batchSize === 'number' && batchSize > 0) {
      cmd += ` --batch-size ${batchSize}`;
    } else {
      cmd += ` --batch-size 5`;
    }

    let batchResult: any = null;
    try {
      const { stdout } = await execPromise(cmd, { cwd });
      batchResult = JSON.parse(stdout.trim());
    } catch (execErr: any) {
      console.error('Python batch parser execution error:', execErr);
      return NextResponse.json(
        { success: false, error: execErr.message || 'Gagal menjalankan parser python' },
        { status: 500 }
      );
    }

    if (!fs.existsSync(parsedJsonPath)) {
      return NextResponse.json(
        { success: false, error: 'File data/parsed_applications.json belum tersedia.' },
        { status: 404 }
      );
    }

    const appsRaw = fs.readFileSync(parsedJsonPath, 'utf-8');
    const apps = JSON.parse(appsRaw);

    // Sync newly parsed applications to Appwrite Cloud with deterministic ID to prevent duplicates
    let appwriteSyncCount = 0;
    const appwriteEndpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const appwriteProjectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const appwriteDbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const appwriteAppsCol = process.env.NEXT_PUBLIC_APPWRITE_APPLICATIONS_COLLECTION;

    const itemsToSync = batchResult?.newlyParsed && batchResult.newlyParsed.length > 0
      ? batchResult.newlyParsed
      : (isReset ? apps : []);

    if (itemsToSync.length > 0 && appwriteEndpoint && appwriteProjectId && appwriteDbId && appwriteAppsCol) {
      try {
        const headers: Record<string, string> = {
          'X-Appwrite-Project': appwriteProjectId,
          'Content-Type': 'application/json'
        };

        for (const appItem of itemsToSync) {
          const comp = (appItem.company_name || '').trim();
          const jt = (appItem.job_title || '').trim();
          const fp = (appItem.file_path || '').trim();
          const key = fp || `${comp.toLowerCase()}::${jt.toLowerCase()}`;
          const hash = crypto.createHash('md5').update(key).digest('hex');
          const docId = `app_${hash.slice(0, 32)}`;

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

          try {
            const createRes = await fetch(
              `${appwriteEndpoint}/databases/${appwriteDbId}/collections/${appwriteAppsCol}/documents`,
              {
                method: 'POST',
                headers,
                body: JSON.stringify({
                  documentId: docId,
                  data: payload
                })
              }
            );

            if (createRes.status === 409) {
              await fetch(
                `${appwriteEndpoint}/databases/${appwriteDbId}/collections/${appwriteAppsCol}/documents/${docId}`,
                {
                  method: 'PATCH',
                  headers,
                  body: JSON.stringify({ data: payload })
                }
              );
            }
            appwriteSyncCount++;
          } catch (syncItemErr) {
            console.warn(`Failed to sync item ${comp}:`, syncItemErr);
          }
        }
      } catch (cloudErr) {
        console.warn('Appwrite cloud sync skipped:', cloudErr);
      }
    }

    // Portal stats
    const portalStats: Record<string, number> = {};
    apps.forEach((a: any) => {
      const p = a.source_portal || 'Direct / Other';
      portalStats[p] = (portalStats[p] || 0) + 1;
    });

    const newlyParsedCount = batchResult?.batchProcessed || batchResult?.newlyParsed?.length || 0;
    const unparsedRemaining = typeof batchResult?.unparsedCount === 'number'
      ? batchResult.unparsedCount
      : 0;

    return NextResponse.json({
      success: true,
      message: batchResult?.message || `Berhasil mem-parse ${newlyParsedCount} berkas baru!`,
      batchProcessed: newlyParsedCount,
      newlyParsed: batchResult?.newlyParsed || [],
      totalApplications: apps.length,
      unparsedCount: unparsedRemaining,
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
      { success: false, error: error.message || 'Gagal memproses berkas surat lamaran' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cwd = process.cwd();
    const parserScript = path.join(cwd, 'scratch', 'batch_parser.py');
    const parsedJsonPath = path.join(cwd, 'data', 'parsed_applications.json');

    let apps: any[] = [];
    if (fs.existsSync(parsedJsonPath)) {
      try {
        apps = JSON.parse(fs.readFileSync(parsedJsonPath, 'utf-8'));
      } catch {}
    }

    if (fs.existsSync(parserScript)) {
      const { stdout } = await execPromise(`python "${parserScript}" --status`, { cwd });
      const statusData = JSON.parse(stdout.trim());
      return NextResponse.json({
        status: 'ready',
        totalPdfFiles: statusData.totalFiles,
        parsedApplications: statusData.parsedCount,
        unparsedCount: statusData.unparsedCount,
        unparsedFiles: statusData.unparsedFiles || [],
        needsSync: statusData.unparsedCount > 0,
        applications: apps
      });
    }

    return NextResponse.json({
      status: 'ready',
      totalPdfFiles: 91,
      parsedApplications: apps.length,
      unparsedCount: Math.max(0, 91 - apps.length),
      needsSync: true,
      applications: apps
    });
  } catch (err: any) {
    return NextResponse.json({
      status: 'error',
      error: err.message
    }, { status: 500 });
  }
}
