import HomeClient from '@/components/HomeClient';
import { listPublished, toPublicShape } from '@/lib/server/store';
import { fallbackProjects, type Project } from '@/lib/projects';

export const dynamic = 'force-dynamic';

export default async function Page() {
  let projects: Project[];
  try {
    const stored = await listPublished();
    projects = stored.length > 0 ? (stored.map(toPublicShape) as Project[]) : fallbackProjects;
  } catch {
    projects = fallbackProjects;
  }
  return <HomeClient initialProjects={projects} />;
}
