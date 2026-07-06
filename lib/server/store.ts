import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { put, list } from '@vercel/blob';
import { fallbackProjects } from '@/lib/projects';

export interface StoredProject {
  _id: string;
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  technology: string[];
  tags: string[];
  route: string;
  path: string;
  component: string;
  dateCreated: string | null;
  order: number;
  published: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

const now = () => new Date().toISOString();

const seedProjects = (): StoredProject[] =>
  fallbackProjects.map((project, index) => ({
    _id: crypto.randomUUID(),
    id: project.id,
    title: project.title,
    description: project.description,
    category: project.category,
    status: project.status,
    technology: project.technology ?? [],
    tags: project.tags ?? [],
    route: project.route,
    path: project.route,
    component: '',
    dateCreated: project.dateCreated,
    order: index,
    published: true,
    isArchived: false,
    createdAt: now(),
    updatedAt: now(),
  }));

// ---------------------------------------------------------------------------
// Persistence backends: Vercel Blob in production, a local JSON file in dev.
// ---------------------------------------------------------------------------

const BLOB_KEY = 'projects.json';
const blobToken = () => process.env.BLOB_READ_WRITE_TOKEN;
const useBlob = () => Boolean(blobToken());

async function blobRead(): Promise<StoredProject[] | null> {
  const token = blobToken() as string;
  const { blobs } = await list({ token, prefix: BLOB_KEY });
  if (blobs.length === 0) {
    return null;
  }
  // Private blobs require the token as a Bearer header.
  const res = await fetch(blobs[0].url, {
    headers: { authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Blob read failed: ${res.status}`);
  }
  return (await res.json()) as StoredProject[];
}

async function blobWrite(projects: StoredProject[]): Promise<void> {
  await put(BLOB_KEY, JSON.stringify(projects), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    token: blobToken() as string,
  });
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'projects.json');

async function fileRead(): Promise<StoredProject[] | null> {
  try {
    return JSON.parse(await fs.readFile(DATA_FILE, 'utf8')) as StoredProject[];
  } catch {
    return null;
  }
}

async function fileWrite(projects: StoredProject[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(projects, null, 2), 'utf8');
}

async function loadAll(): Promise<StoredProject[]> {
  const existing = await (useBlob() ? blobRead() : fileRead());
  if (existing) {
    return existing;
  }
  const seeded = seedProjects();
  await saveAll(seeded);
  return seeded;
}

async function saveAll(projects: StoredProject[]): Promise<void> {
  await (useBlob() ? blobWrite(projects) : fileWrite(projects));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const byOrder = (a: StoredProject, b: StoredProject) =>
  (a.order ?? 0) - (b.order ?? 0) ||
  new Date(b.dateCreated ?? 0).getTime() - new Date(a.dateCreated ?? 0).getTime();

const applyInput = (target: StoredProject, input: Record<string, any>) => {
  const stringFields: (keyof StoredProject)[] = [
    'id',
    'title',
    'description',
    'category',
    'status',
    'route',
    'path',
    'component',
  ];
  stringFields.forEach((field) => {
    if (input[field] !== undefined && input[field] !== null) {
      (target as any)[field] = String(input[field]).trim();
    }
  });
  if (Array.isArray(input.technology)) target.technology = input.technology;
  if (Array.isArray(input.tags)) target.tags = input.tags;
  if (typeof input.published === 'boolean') target.published = input.published;
  if (typeof input.order === 'number') target.order = input.order;
  if (input.dateCreated !== undefined) target.dateCreated = input.dateCreated;

  if (!target.route && target.path) target.route = target.path;
  if (!target.path && target.route) target.path = target.route;
  if (!target.route && target.id) {
    target.route = `/projects/${target.id}`;
    target.path = target.route;
  }
};

const find = (projects: StoredProject[], identifier: string) =>
  projects.find((p) => p._id === identifier || p.id === identifier);

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function listAll(): Promise<StoredProject[]> {
  const projects = await loadAll();
  return [...projects].sort(byOrder);
}

export async function listPublished(): Promise<StoredProject[]> {
  const all = await listAll();
  return all.filter((p) => p.published !== false && p.isArchived !== true);
}

export async function getOne(identifier: string): Promise<StoredProject | null> {
  const projects = await loadAll();
  return find(projects, identifier) ?? null;
}

export async function createOne(input: Record<string, any>): Promise<StoredProject> {
  const projects = await loadAll();
  const record: StoredProject = {
    _id: crypto.randomUUID(),
    id: '',
    title: '',
    description: '',
    category: 'Software',
    status: 'Active',
    technology: [],
    tags: [],
    route: '',
    path: '',
    component: '',
    dateCreated: now(),
    order: projects.length,
    published: true,
    isArchived: false,
    createdAt: now(),
    updatedAt: now(),
  };
  applyInput(record, input);
  projects.push(record);
  await saveAll(projects);
  return record;
}

export async function updateOne(
  identifier: string,
  input: Record<string, any>,
): Promise<StoredProject | null> {
  const projects = await loadAll();
  const record = find(projects, identifier);
  if (!record) return null;
  applyInput(record, input);
  record.updatedAt = now();
  await saveAll(projects);
  return record;
}

export async function deleteOne(identifier: string): Promise<boolean> {
  const projects = await loadAll();
  const next = projects.filter((p) => p._id !== identifier && p.id !== identifier);
  if (next.length === projects.length) return false;
  await saveAll(next);
  return true;
}

export async function reorder(updates: { _id: string; order: number }[]): Promise<StoredProject[]> {
  const projects = await loadAll();
  const orderById = new Map(updates.map((u) => [u._id, Number(u.order) || 0]));
  projects.forEach((project) => {
    if (orderById.has(project._id)) {
      project.order = orderById.get(project._id) as number;
    }
  });
  await saveAll(projects);
  return [...projects].sort(byOrder);
}

export function toPublicShape(project: StoredProject) {
  const route = project.route || project.path || (project.id ? `/projects/${project.id}` : '#');
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    route,
    path: project.path || route,
    category: project.category || 'General',
    status: project.status || 'Unknown',
    technology: Array.isArray(project.technology) ? project.technology : [],
    tags: Array.isArray(project.tags) ? project.tags : [],
    dateCreated: project.dateCreated,
    updatedAt: project.updatedAt,
    order: project.order ?? 0,
    published: project.published ?? true,
  };
}
