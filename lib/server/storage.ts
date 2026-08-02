import { promises as fs } from 'fs';
import path from 'path';

/**
 * Storage backend: the git repo is the database.
 *
 * With GITHUB_TOKEN set (production), reads and writes go through the GitHub
 * Contents API — every write is a commit to the repo, which triggers a Vercel
 * redeploy that bakes the new data into the static pages. Without a token
 * (local dev), files are read and written directly in the working tree.
 *
 * Free forever, no metered operations: public pages are static and never
 * touch this module at runtime; only admin reads/writes hit the GitHub API.
 */

const token = () => process.env.GITHUB_TOKEN;
const repo = () => process.env.GITHUB_REPO || 'Shadowpatriot9/personal_site';
const branch = () => process.env.GITHUB_BRANCH || 'main';

export const usingGitHub = () => Boolean(token());

/** Whether writes can persist: GitHub in production, the working tree in dev. */
export const canWrite = () => usingGitHub() || process.env.NODE_ENV !== 'production';

const apiUrl = (repoPath: string) =>
  `https://api.github.com/repos/${repo()}/contents/${repoPath}`;

const ghHeaders = (accept: string): Record<string, string> => ({
  Authorization: `Bearer ${token()}`,
  Accept: accept,
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'personal-site-admin',
});

async function ghRead(repoPath: string): Promise<Buffer | null> {
  const res = await fetch(`${apiUrl(repoPath)}?ref=${branch()}`, {
    headers: ghHeaders('application/vnd.github.raw+json'),
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub read of ${repoPath} failed: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function ghSha(repoPath: string): Promise<string | null> {
  const res = await fetch(`${apiUrl(repoPath)}?ref=${branch()}`, {
    headers: ghHeaders('application/vnd.github+json'),
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub stat of ${repoPath} failed: ${res.status}`);
  const body = (await res.json()) as { sha?: string };
  return body.sha ?? null;
}

async function ghWrite(repoPath: string, content: Buffer, message: string): Promise<void> {
  // A concurrent commit between the sha lookup and the PUT yields a 409 —
  // refetch the sha and retry once.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const sha = await ghSha(repoPath);
    const res = await fetch(apiUrl(repoPath), {
      method: 'PUT',
      headers: ghHeaders('application/vnd.github+json'),
      body: JSON.stringify({
        message,
        content: content.toString('base64'),
        branch: branch(),
        ...(sha ? { sha } : {}),
      }),
    });
    if (res.ok) return;
    if (res.status !== 409 || attempt === 1) {
      throw new Error(`GitHub write of ${repoPath} failed: ${res.status}`);
    }
  }
}

const localPath = (repoPath: string) => path.join(process.cwd(), repoPath);

async function localRead(repoPath: string): Promise<Buffer | null> {
  try {
    return await fs.readFile(localPath(repoPath));
  } catch {
    return null;
  }
}

async function localWrite(repoPath: string, content: Buffer): Promise<void> {
  const target = localPath(repoPath);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, content);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Read the latest committed version (GitHub API in prod, working tree in dev). */
export async function readJsonFresh<T>(repoPath: string): Promise<T | null> {
  const raw = await (usingGitHub() ? ghRead(repoPath) : localRead(repoPath));
  if (!raw) return null;
  return JSON.parse(raw.toString('utf8')) as T;
}

export async function writeJson(repoPath: string, data: unknown, message: string): Promise<void> {
  const content = Buffer.from(JSON.stringify(data, null, 2) + '\n', 'utf8');
  await (usingGitHub() ? ghWrite(repoPath, content, message) : localWrite(repoPath, content));
}

export async function writeBinary(
  repoPath: string,
  content: Buffer,
  message: string,
): Promise<void> {
  await (usingGitHub() ? ghWrite(repoPath, content, message) : localWrite(repoPath, content));
}
