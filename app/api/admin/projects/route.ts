import { NextResponse } from 'next/server';
import { verifyRequest } from '@/lib/server/auth';
import { listAll, createOne, reorder, getOne } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

const unauthorized = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

export async function GET(request: Request) {
  if (!verifyRequest(request)) return unauthorized();
  try {
    const projects = await listAll();
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Failed to load projects:', error);
    return NextResponse.json({ error: 'Unable to load projects' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!verifyRequest(request)) return unauthorized();
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    if (!body.id || !body.title || !body.description) {
      return NextResponse.json(
        { error: 'id, title, and description are required' },
        { status: 400 },
      );
    }
    if (await getOne(body.id)) {
      return NextResponse.json({ error: 'A project with this id already exists' }, { status: 409 });
    }
    const project = await createOne(body);
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json({ error: 'Unable to create project' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!verifyRequest(request)) return unauthorized();
  try {
    const updates = await request.json();
    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }
    const projects = await reorder(updates);
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Failed to reorder projects:', error);
    return NextResponse.json({ error: 'Unable to reorder projects' }, { status: 500 });
  }
}
