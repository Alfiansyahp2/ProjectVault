import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

export const dynamic = 'force-dynamic';

const execPromise = util.promisify(exec);

// Helper to run python parse_pdf_document via standalone script
async function parsePdfWithPython(filePath: string, cwd: string) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  const scriptPath = path.join(cwd, 'api', 'parse_single.py').replace(/\\/g, '/');
  const pythonCmd = `python "${scriptPath}" "${normalizedPath}"`;
  
  const { stdout, stderr } = await execPromise(pythonCmd, { cwd });
  if (!stdout && stderr) {
    throw new Error(stderr);
  }
  return JSON.parse(stdout.trim());
}

// GET: List available local resume PDFs from data/resume and data/resume/New folder
export async function GET() {
  try {
    const cwd = process.cwd();
    const resumeDirs = [
      path.join(cwd, 'data', 'resume'),
      path.join(cwd, 'data', 'resume', 'New folder')
    ];

    const localFiles: Array<{ name: string; path: string; size: number; folder: string }> = [];

    for (const dir of resumeDirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          if (file.toLowerCase().endsWith('.pdf') && !file.startsWith('CV_')) {
            const fullPath = path.join(dir, file);
            const stats = fs.statSync(fullPath);
            if (stats.isFile()) {
              localFiles.push({
                name: file,
                path: path.relative(cwd, fullPath).replace(/\\/g, '/'),
                size: stats.size,
                folder: path.basename(dir)
              });
            }
          }
        }
      }
    }

    localFiles.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      success: true,
      total: localFiles.length,
      files: localFiles
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memindai berkas lokal' },
      { status: 500 }
    );
  }
}

// POST: Parse an uploaded file or an existing local file
export async function POST(req: NextRequest) {
  try {
    const cwd = process.cwd();
    const contentType = req.headers.get('content-type') || '';

    // Mode A: JSON payload with localFilePath
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const localFilePath = body?.localFilePath;

      if (!localFilePath) {
        return NextResponse.json(
          { success: false, error: 'Parameter localFilePath wajib disertakan.' },
          { status: 400 }
        );
      }

      const absolutePath = path.isAbsolute(localFilePath) 
        ? localFilePath 
        : path.join(cwd, localFilePath);

      if (!fs.existsSync(absolutePath)) {
        return NextResponse.json(
          { success: false, error: `Berkas tidak ditemukan: ${localFilePath}` },
          { status: 404 }
        );
      }

      const parsedData = await parsePdfWithPython(absolutePath, cwd);
      return NextResponse.json({
        success: true,
        source: 'local',
        data: parsedData
      });
    }

    // Mode B: multipart/form-data with uploaded file
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'Berkas PDF tidak ditemukan dalam request upload.' },
          { status: 400 }
        );
      }

      const originalName = file.name || 'uploaded_document.pdf';
      const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const uploadDir = path.join(cwd, 'scratch', 'uploads');
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const targetPath = path.join(uploadDir, `${Date.now()}_${safeName}`);
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(targetPath, buffer);

      const parsedData = await parsePdfWithPython(targetPath, cwd);

      return NextResponse.json({
        success: true,
        source: 'upload',
        fileName: originalName,
        fileSize: file.size,
        data: parsedData
      });
    }

    return NextResponse.json(
      { success: false, error: 'Content-Type tidak didukung. Gunakan multipart/form-data atau application/json.' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Upload parse error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal mem-parse dokumen PDF.' },
      { status: 500 }
    );
  }
}
