import { promises as fs } from 'fs';
import path from 'path';
import { put, list, del } from '@vercel/blob';
import { defaultSiteContent, type ContactLink, type SiteContent } from '@/lib/siteContent';

// ---------------------------------------------------------------------------
// Persistence backends: Vercel Blob in production, a local JSON file in dev —
// the same pattern as the projects store (see lib/server/store.ts).
// ---------------------------------------------------------------------------

const BLOB_PATHNAME = 'site-content.json';
const BLOB_PREFIX = 'site-content';
const blobToken = () => process.env.BLOB_READ_WRITE_TOKEN;
const usingBlob = () => Boolean(blobToken());

const newestFirst = (a: { uploadedAt: string | Date }, b: { uploadedAt: string | Date }) =>
  new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();

async function blobRead(): Promise<Partial<SiteContent> | null> {
  const token = blobToken() as string;
  const { blobs } = await list({ token, prefix: BLOB_PREFIX });
  if (blobs.length === 0) {
    return null;
  }
  const newest = [...blobs].sort(newestFirst)[0];
  const res = await fetch(newest.url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Blob read failed: ${res.status}`);
  }
  return (await res.json()) as Partial<SiteContent>;
}

async function blobWrite(content: SiteContent): Promise<void> {
  const token = blobToken() as string;
  const before = await list({ token, prefix: BLOB_PREFIX });
  const { url } = await put(BLOB_PATHNAME, JSON.stringify(content), {
    access: 'public',
    addRandomSuffix: true,
    contentType: 'application/json',
    cacheControlMaxAge: 0,
    token,
  });
  const stale = before.blobs.map((b) => b.url).filter((u) => u !== url);
  if (stale.length > 0) {
    await del(stale, { token });
  }
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'site-content.json');

async function fileRead(): Promise<Partial<SiteContent> | null> {
  try {
    return JSON.parse(await fs.readFile(DATA_FILE, 'utf8')) as Partial<SiteContent>;
  } catch {
    return null;
  }
}

async function fileWrite(content: SiteContent): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(content, null, 2), 'utf8');
}

// ---------------------------------------------------------------------------
// Sanitizing
// ---------------------------------------------------------------------------

const clip = (value: unknown, max: number): string =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

const toLinks = (value: unknown): ContactLink[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((link) => ({
      label: clip((link as ContactLink)?.label, 120),
      href: clip((link as ContactLink)?.href, 300),
    }))
    .filter((link) => link.label && link.href)
    .slice(0, 10);
};

/** Merge a stored/incoming partial over the defaults so old data stays valid. */
const withDefaults = (input: Partial<SiteContent>): SiteContent => ({
  // The homepage h1 should never be empty — fall back to the default name.
  name: clip(input.name, 80) || defaultSiteContent.name,
  tagline: input.tagline === undefined ? defaultSiteContent.tagline : clip(input.tagline, 500),
  note: input.note === undefined ? defaultSiteContent.note : clip(input.note, 500),
  // Headings are structural (anchors, nav labels) — empty falls back too.
  projectsHeading: clip(input.projectsHeading, 60) || defaultSiteContent.projectsHeading,
  contactHeading: clip(input.contactHeading, 60) || defaultSiteContent.contactHeading,
  footer: input.footer === undefined ? defaultSiteContent.footer : clip(input.footer, 200),
  contactLinks:
    input.contactLinks === undefined ? defaultSiteContent.contactLinks : toLinks(input.contactLinks),
});

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getSiteContent(): Promise<SiteContent> {
  const stored = await (usingBlob() ? blobRead() : fileRead());
  return stored ? withDefaults(stored) : defaultSiteContent;
}

export async function saveSiteContent(input: Record<string, unknown>): Promise<SiteContent> {
  const content = withDefaults({
    name: input.name as string,
    tagline: (input.tagline ?? '') as string,
    note: (input.note ?? '') as string,
    projectsHeading: (input.projectsHeading ?? '') as string,
    contactHeading: (input.contactHeading ?? '') as string,
    footer: (input.footer ?? '') as string,
    contactLinks: (input.contactLinks ?? []) as ContactLink[],
  });
  await (usingBlob() ? blobWrite(content) : fileWrite(content));
  return content;
}
