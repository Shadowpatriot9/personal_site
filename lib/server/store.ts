import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { connectToDatabase, isDatabaseConfigured } from './db';
import { ProjectModel, normalizeProjectInput, buildProjectLookup } from './model';
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

// ---------------------------------------------------------------------------
// File-backed store (used when MONGO_URI is not set)
// ---------------------------------------------------------------------------

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'projects.json');

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

async function readFileStore(): Promise<StoredProject[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(raw) as StoredProject[];
  } catch {
    const seeded = seedProjects();
    await writeFileStore(seeded);
    return seeded;
  }
}

async function writeFileStore(projects: StoredProject[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(projects, null, 2), 'utf8');
}

const applyInput = (target: Partial<StoredProject>, input: Record<string, any>) => {
  const fields: (keyof StoredProject)[] = [
    'id',
    'title',
    'description',
    'category',
    'status',
    'route',
    'path',
    'component',
  ];
  fields.forEach((field) => {
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

const byOrder = (a: StoredProject, b: StoredProject) =>
  (a.order ?? 0) - (b.order ?? 0) ||
  new Date(b.dateCreated ?? 0).getTime() - new Date(a.dateCreated ?? 0).getTime();

// ---------------------------------------------------------------------------
// Public API — branches on the configured backend
// ---------------------------------------------------------------------------

export async function listAll(): Promise<StoredProject[]> {
  if (isDatabaseConfigured()) {
    await connectToDatabase();
    const docs = await ProjectModel.find().sort({ order: 1, dateCreated: -1 }).lean();
    return docs as unknown as StoredProject[];
  }
  const projects = await readFileStore();
  return [...projects].sort(byOrder);
}

export async function listPublished(): Promise<StoredProject[]> {
  const all = await listAll();
  return all.filter((project) => project.published !== false && project.isArchived !== true);
}

export async function getOne(identifier: string): Promise<StoredProject | null> {
  if (isDatabaseConfigured()) {
    await connectToDatabase();
    const lookup = buildProjectLookup(identifier);
    if (!lookup) return null;
    const doc = await ProjectModel.findOne(lookup).lean();
    return (doc as unknown as StoredProject) ?? null;
  }
  const projects = await readFileStore();
  return projects.find((p) => p._id === identifier || p.id === identifier) ?? null;
}

export async function createOne(input: Record<string, any>): Promise<StoredProject> {
  if (isDatabaseConfigured()) {
    await connectToDatabase();
    const payload = normalizeProjectInput(input);
    const doc = await ProjectModel.create(payload);
    return doc.toObject() as unknown as StoredProject;
  }
  const projects = await readFileStore();
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
  await writeFileStore(projects);
  return record;
}

export async function updateOne(
  identifier: string,
  input: Record<string, any>,
): Promise<StoredProject | null> {
  if (isDatabaseConfigured()) {
    await connectToDatabase();
    const lookup = buildProjectLookup(identifier);
    if (!lookup) return null;
    const payload = normalizeProjectInput(input);
    const doc = await ProjectModel.findOneAndUpdate(
      lookup,
      { $set: { ...payload, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).lean();
    return (doc as unknown as StoredProject) ?? null;
  }
  const projects = await readFileStore();
  const record = projects.find((p) => p._id === identifier || p.id === identifier);
  if (!record) return null;
  applyInput(record, input);
  record.updatedAt = now();
  await writeFileStore(projects);
  return record;
}

export async function deleteOne(identifier: string): Promise<boolean> {
  if (isDatabaseConfigured()) {
    await connectToDatabase();
    const lookup = buildProjectLookup(identifier);
    if (!lookup) return false;
    const result = await ProjectModel.findOneAndDelete(lookup);
    return Boolean(result);
  }
  const projects = await readFileStore();
  const next = projects.filter((p) => p._id !== identifier && p.id !== identifier);
  if (next.length === projects.length) return false;
  await writeFileStore(next);
  return true;
}

export async function reorder(updates: { _id: string; order: number }[]): Promise<StoredProject[]> {
  if (isDatabaseConfigured()) {
    await connectToDatabase();
    const operations = updates
      .filter((item) => item && item._id)
      .map((item) => ({
        updateOne: {
          filter: { _id: item._id },
          update: { $set: { order: Number(item.order) || 0 } },
        },
      }));
    if (operations.length > 0) {
      await ProjectModel.bulkWrite(operations);
    }
    return listAll();
  }
  const projects = await readFileStore();
  const orderById = new Map(updates.map((u) => [u._id, Number(u.order) || 0]));
  projects.forEach((project) => {
    if (orderById.has(project._id)) {
      project.order = orderById.get(project._id) as number;
    }
  });
  await writeFileStore(projects);
  return [...projects].sort(byOrder);
}

export function toPublicShape(project: StoredProject) {
  const route =
    project.route || project.path || (project.id ? `/projects/${project.id}` : '#');
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
