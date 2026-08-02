import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { writeBinary, canWrite } from '@/lib/server/storage';
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

export async function GET(request: Request) {
  if (!verifyRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ enabled: canWrite() });
}

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

    // Committed under public/uploads (GitHub API in prod, working tree in dev)
    // and served as a static file. In prod it goes live with the next deploy —
    // the same one that publishes the project data referencing it.
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeBinary(`public/uploads/${filename}`, buffer, `admin: upload ${filename}`);
    return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
