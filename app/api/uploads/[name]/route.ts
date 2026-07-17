import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const UPLOAD_DIR = path.join(process.cwd(), '.data', 'uploads');

const CONTENT_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  avif: 'image/avif',
};

// Serves images written to .data/uploads in local development (no Blob token).
// In production, uploads live on Vercel Blob and are fetched by their own URL.
export async function GET(request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;

  // Reject anything that isn't a plain, safe filename (blocks path traversal).
  if (!/^[a-zA-Z0-9._-]+$/.test(name) || name.includes('..')) {
    return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
  }

  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) {
    return NextResponse.json({ error: 'Unsupported type' }, { status: 415 });
  }

  try {
    const file = await fs.readFile(path.join(UPLOAD_DIR, name));
    return new NextResponse(new Uint8Array(file), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
