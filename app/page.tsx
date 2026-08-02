import HomeClient from '@/components/HomeClient';
import { listPublished, toPublicShape } from '@/lib/server/store';
import { fallbackProjects, type Project } from '@/lib/projects';
import { getSiteContent } from '@/lib/server/siteContent';

// Fully static: data is baked in from data/*.json at build time, and every
// admin edit commits to the repo, which redeploys with the fresh snapshot.

export default async function Page() {
  const stored = await listPublished();
  const projects =
    stored.length > 0 ? (stored.map(toPublicShape) as Project[]) : fallbackProjects;
  const content = await getSiteContent();

  return <HomeClient initialProjects={projects} content={content} />;
}
