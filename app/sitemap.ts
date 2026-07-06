import { fallbackProjects } from '@/lib/projects';

export const baseUrl = 'https://mgds.me';

export default async function sitemap() {
  const lastModified = new Date().toISOString().split('T')[0];

  const staticRoutes = ['', '/admin'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
  }));

  const projectRoutes = fallbackProjects.map((project) => ({
    url: `${baseUrl}${project.route}`,
    lastModified,
  }));

  return [...staticRoutes, ...projectRoutes];
}
