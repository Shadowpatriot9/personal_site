import { NextResponse } from 'next/server';
import { verifyRequest } from '@/lib/server/auth';
import { getOne, updateOne, deleteOne } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

const unauthorized = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  if (!verifyRequest(request)) return unauthorized();
  const { id } = await params;
  try {
    const project = await getOne(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json({ project });
  } catch (error) {
    console.error('Failed to load project:', error);
    return NextResponse.json({ error: 'Unable to load project' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  if (!verifyRequest(request)) return unauthorized();
  const { id } = await params;
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    const updated = await updateOne(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json({ project: updated });
  } catch (error) {
    console.error('Failed to update project:', error);
    return NextResponse.json({ error: 'Unable to update project' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  if (!verifyRequest(request)) return unauthorized();
  const { id } = await params;
  try {
    const removed = await deleteOne(id);
    if (!removed) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete project:', error);
    return NextResponse.json({ error: 'Unable to delete project' }, { status: 500 });
  }
}
