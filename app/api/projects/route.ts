import { NextResponse } from 'next/server';
import { listPublished, toPublicShape } from '@/lib/server/store';
import { fallbackProjects } from '@/lib/projects';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const projects = await listPublished();
    const payload = projects.length > 0 ? projects.map(toPublicShape) : fallbackProjects;
    return NextResponse.json({ projects: payload });
  } catch (error) {
    console.error('Public projects API error:', error);
    return NextResponse.json({ projects: fallbackProjects });
  }
}
