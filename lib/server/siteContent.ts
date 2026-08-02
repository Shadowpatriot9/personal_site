import { readJsonFresh, writeJson } from '@/lib/server/storage';
import { defaultSiteContent, type ContactLink, type SiteContent } from '@/lib/siteContent';
import bundledContent from '@/data/site-content.json';

// ---------------------------------------------------------------------------
// Same split as the projects store (see lib/server/store.ts): public pages
// read the bundled data/site-content.json snapshot at build time; admin
// routes read/write the latest commit via lib/server/storage.ts.
// ---------------------------------------------------------------------------

const DATA_PATH = 'data/site-content.json';

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

/** Public/static read — the build-time snapshot. */
export async function getSiteContent(): Promise<SiteContent> {
  return withDefaults(bundledContent as Partial<SiteContent>);
}

/** Admin read — the latest commit, so edits never work from stale data. */
export async function getSiteContentFresh(): Promise<SiteContent> {
  const stored = await readJsonFresh<Partial<SiteContent>>(DATA_PATH);
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
  await writeJson(DATA_PATH, content, 'admin: update site content');
  return content;
}
