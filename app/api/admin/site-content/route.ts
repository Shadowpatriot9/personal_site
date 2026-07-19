import { NextResponse } from 'next/server';
import { verifyRequest } from '@/lib/server/auth';
import { getSiteContent, saveSiteContent } from '@/lib/server/siteContent';

export const dynamic = 'force-dynamic';

const unauthorized = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

export async function GET(request: Request) {
  if (!verifyRequest(request)) return unauthorized();
  try {
    const content = await getSiteContent();
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Failed to load site content:', error);
    return NextResponse.json({ error: 'Unable to load site content' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!verifyRequest(request)) return unauthorized();
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    const content = await saveSiteContent(body as Record<string, unknown>);
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Failed to save site content:', error);
    return NextResponse.json({ error: 'Unable to save site content' }, { status: 500 });
  }
}
