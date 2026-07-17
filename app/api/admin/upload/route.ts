import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { put } from '@vercel/blob';
import { verifyRequest } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = new Map<string, string>([
  ['image/png', 'png'],
  ['image/jpeg', 'jpg'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
  ['image/svg+xml', 'svg'],
  ['image/avif', 'avif'],
]);

const UPLOAD_DIR = path.join(process.cwd(), '.data', 'uploads');
const blobToken = () => process.env.BLOB_READ_WRITE_TOKEN;

export async function POST(request: Request) {
  if (!verifyRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const file = form.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    const ext = ALLOWED.get(file.type);
    if (!ext) {
      return NextResponse.json(
        { error: 'Unsupported file type. Use PNG, JPG, WebP, GIF, AVIF, or SVG.' },
        { status: 415 },
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File is too large (max 8 MB).' }, { status: 413 });
    }

    const filename = `${crypto.randomUUID()}.${ext}`;

    // Production: persist to Vercel Blob. Local dev: write under .data/uploads
    // and serve it back through /api/uploads/[name].
    if (blobToken()) {
      const { url } = await put(`project-media/${filename}`, file, {
        access: 'public',
        contentType: file.type,
        token: blobToken(),
      });
      return NextResponse.json({ url }, { status: 201 });
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);
    return NextResponse.json({ url: `/api/uploads/${filename}` }, { status: 201 });
  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
