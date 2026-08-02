import { listPublished } from '@/lib/server/store';

export const baseUrl = 'https://mgds.me';

export default async function sitemap() {
  const lastModified = new Date().toISOString().split('T')[0];

  const staticRoutes = ['', '/admin'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
  }));

  const published = await listPublished();
  const projectRoutes = published.map((project) => ({
    url: `${baseUrl}/projects/${project.id}`,
    lastModified,
  }));

  return [...staticRoutes, ...projectRoutes];
}
