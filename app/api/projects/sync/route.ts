import { NextResponse } from 'next/server';
import { ProjectScannerService } from '@/server/services/projects/project-scanner.service';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const result = await ProjectScannerService.syncFromMarkdown();
    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Error in /api/projects/sync:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal menyinkronkan project.md' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const status = ProjectScannerService.getSyncStatus();
  return NextResponse.json(status);
}
