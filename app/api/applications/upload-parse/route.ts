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

// Helper to run python parse_raw_text on arbitrary long text
async function parseRawTextWithPython(text: string, cwd: string, hint: string = 'Teks Salinan') {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/py/resumes/parse-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, source_hint: hint }),
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'success' && data.result) {
        return data.result;
      }
    }
  } catch {
    // Fallback if FastAPI server is not responding directly
  }

  const uploadDir = path.join(cwd, 'scratch', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  const tempTxt = path.join(uploadDir, `tmp_${Date.now()}.txt`);
  fs.writeFileSync(tempTxt, text, 'utf-8');
  try {
    const pythonCmd = `python -c "import sys, json; from api.services.nlp_engine import parse_raw_text; f=open(r'${tempTxt.replace(/\\/g, '/')}', encoding='utf-8'); print(json.dumps(parse_raw_text(f.read(), '${hint}'), ensure_ascii=False))"`;
    const { stdout, stderr } = await execPromise(pythonCmd, { cwd });
    if (!stdout && stderr) throw new Error(stderr);
    return JSON.parse(stdout.trim());
  } finally {
    if (fs.existsSync(tempTxt)) {
      try { fs.unlinkSync(tempTxt); } catch {}
    }
  }
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

    // Mode A: JSON payload with rawText or localFilePath
    if (contentType.includes('application/json')) {
      const body = await req.json();

      if (typeof body?.rawText === 'string') {
        const rawText = body.rawText.trim();
        if (!rawText) {
          return NextResponse.json(
            { success: false, error: 'Teks masukan tidak boleh kosong.' },
            { status: 400 }
          );
        }
        const sourceHint = typeof body?.sourceHint === 'string' && body.sourceHint ? body.sourceHint : 'Teks Salinan';
        const parsedData = await parseRawTextWithPython(rawText, cwd, sourceHint);
        return NextResponse.json({
          success: true,
          source: 'raw_text',
          data: parsedData
        });
      }

      const localFilePath = body?.localFilePath;

      if (!localFilePath || typeof localFilePath !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Parameter localFilePath atau rawText wajib disertakan dalam format string.' },
          { status: 400 }
        );
      }

      // AUD-HIGH-03: Security boundary check to prevent arbitrary file reading & path traversal
      const safeDataDir = path.resolve(cwd, 'data');
      const absolutePath = path.isAbsolute(localFilePath) 
        ? path.resolve(localFilePath) 
        : path.resolve(cwd, localFilePath);

      if (!absolutePath.startsWith(safeDataDir) || !absolutePath.toLowerCase().endsWith('.pdf')) {
        return NextResponse.json(
          { success: false, error: 'Akses ditolak: Hanya berkas PDF di dalam direktori data/ yang diizinkan.' },
          { status: 403 }
        );
      }

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

      // Check upload size limit (max 15MB)
      const MAX_UPLOAD_SIZE = 15 * 1024 * 1024;
      if (file.size > MAX_UPLOAD_SIZE) {
        return NextResponse.json(
          { success: false, error: 'Ukuran berkas melebihi batas maksimum 15MB.' },
          { status: 400 }
        );
      }

      const originalName = file.name || 'uploaded_document.pdf';
      if (!originalName.toLowerCase().endsWith('.pdf')) {
        return NextResponse.json(
          { success: false, error: 'Hanya dokumen PDF (.pdf) yang didukung untuk ekstraksi teks.' },
          { status: 400 }
        );
      }

      const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const uploadDir = path.join(cwd, 'scratch', 'uploads');
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const targetPath = path.join(uploadDir, `${Date.now()}_${safeName}`);
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(targetPath, buffer);

      let parsedData: any = null;
      try {
        parsedData = await parsePdfWithPython(targetPath, cwd);
      } finally {
        // AUD-HIGH-04: Auto-cleanup uploaded temp file from disk to avoid disk leakage/bloat
        if (fs.existsSync(targetPath)) {
          try {
            fs.unlinkSync(targetPath);
          } catch (unlinkErr) {
            console.warn('Gagal menghapus berkas sementara upload:', targetPath, unlinkErr);
          }
        }
      }

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
