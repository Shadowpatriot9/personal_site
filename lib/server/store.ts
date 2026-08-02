import crypto from 'crypto';
import { readJsonFresh, writeJson } from '@/lib/server/storage';
import { fallbackProjects } from '@/lib/projects';
import bundledProjects from '@/data/projects.json';

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
  link: string;
  body: string;
  image: string;
  gallery: string[];
  dateCreated: string | null;
  order: number;
  published: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

const DATA_PATH = 'data/projects.json';

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
    link: project.link ?? '',
    body: project.body ?? '',
    image: project.image ?? '',
    gallery: Array.isArray(project.gallery) ? project.gallery : [],
    dateCreated: project.dateCreated,
    order: index,
    published: true,
    isArchived: false,
    createdAt: now(),
    updatedAt: now(),
  }));

// ---------------------------------------------------------------------------
// Two read paths, one write path (see lib/server/storage.ts):
//  - Public pages are static and read the bundled data/projects.json snapshot,
//    baked in at build time. Zero runtime storage calls.
//  - Admin routes read the latest commit and write new ones; each write
//    triggers a redeploy that refreshes the static snapshot.
// ---------------------------------------------------------------------------

const bundled = (): StoredProject[] => bundledProjects as unknown as StoredProject[];

async function loadAll(): Promise<StoredProject[]> {
  return (await readJsonFresh<StoredProject[]>(DATA_PATH)) ?? seedProjects();
}

async function saveAll(projects: StoredProject[]): Promise<void> {
  await writeJson(DATA_PATH, projects, 'admin: update projects');
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const byOrder = (a: StoredProject, b: StoredProject) =>
  (a.order ?? 0) - (b.order ?? 0) ||
  new Date(b.dateCreated ?? 0).getTime() - new Date(a.dateCreated ?? 0).getTime();

const isPublished = (p: StoredProject) => p.published !== false && p.isArchived !== true;

const toStringList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
};

const applyInput = (target: StoredProject, input: Record<string, any>) => {
  const stringFields: (keyof StoredProject)[] = [
    'id',
    'title',
    'description',
    'category',
    'status',
    'link',
    'body',
    'image',
  ];
  stringFields.forEach((field) => {
    if (input[field] !== undefined && input[field] !== null) {
      (target as any)[field] = String(input[field]).trim();
    }
  });
  if (input.technology !== undefined) target.technology = toStringList(input.technology);
  if (input.tags !== undefined) target.tags = toStringList(input.tags);
  if (input.gallery !== undefined) {
    // Gallery arrives as an array of URLs; fall back to newline-splitting a string.
    target.gallery = Array.isArray(input.gallery)
      ? input.gallery.map((v: unknown) => String(v).trim()).filter(Boolean)
      : String(input.gallery)
          .split('\n')
          .map((v) => v.trim())
          .filter(Boolean);
  }
  if (typeof input.published === 'boolean') target.published = input.published;
  if (typeof input.order === 'number') target.order = input.order;
  if (input.dateCreated !== undefined) target.dateCreated = input.dateCreated;

  // Route is always derived from the id — never user-set.
  if (target.id) {
    target.route = `/projects/${target.id}`;
  }
};

const find = (projects: StoredProject[], identifier: string) =>
  projects.find((p) => p._id === identifier || p.id === identifier);

// ---------------------------------------------------------------------------
// Public (static) reads — served from the build-time snapshot
// ---------------------------------------------------------------------------

export async function listPublished(): Promise<StoredProject[]> {
  return bundled().filter(isPublished).sort(byOrder);
}

export async function getPublished(identifier: string): Promise<StoredProject | null> {
  const project = find(bundled(), identifier);
  return project && isPublished(project) ? project : null;
}

// ---------------------------------------------------------------------------
// Admin reads and writes — always against the latest commit
// ---------------------------------------------------------------------------

export async function listAll(): Promise<StoredProject[]> {
  const projects = await loadAll();
  return [...projects].sort(byOrder);
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
    link: '',
    body: '',
    image: '',
    gallery: [],
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
  const route = project.route || (project.id ? `/projects/${project.id}` : '#');
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    route,
    category: project.category || 'General',
    status: project.status || 'Unknown',
    technology: Array.isArray(project.technology) ? project.technology : [],
    tags: Array.isArray(project.tags) ? project.tags : [],
    image: project.image || '',
    gallery: Array.isArray(project.gallery) ? project.gallery : [],
    dateCreated: project.dateCreated,
    updatedAt: project.updatedAt,
    order: project.order ?? 0,
    published: project.published ?? true,
  };
}
