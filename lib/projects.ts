export interface Project {
  id: string;
  slug?: string;
  title: string;
  description: string;
  category: string;
  status: string;
  technology: string[];
  tags: string[];
  route: string;
  path?: string;
  dateCreated: string | null;
  updatedAt?: string | null;
  raw?: Record<string, unknown>;
}

export const PROJECT_STATUS_OPTIONS = [
  'Active',
  'In Progress',
  'Completed',
  'Paused',
  'Discontinued',
];

export const PROJECT_CATEGORY_OPTIONS = [
  'Software',
  'Hardware',
  'Research',
  'Creative',
  'Community',
  'Other',
];

// Route must start with a forward slash and may include alphanumeric characters,
// forward slashes, underscores, or hyphens.
export const PROJECT_ROUTE_PATTERN = /^\/[A-Za-z0-9/_-]+$/;

export const DEFAULT_PROJECT_CATEGORY = PROJECT_CATEGORY_OPTIONS[0];
export const DEFAULT_PROJECT_STATUS = PROJECT_STATUS_OPTIONS[0];

export const fallbackProjects: Project[] = [
  {
    id: 'sim',
    title: 'S_im',
    description: 'Shadow Simulator',
    category: 'Software',
    status: 'In Progress',
    technology: ['Simulation', 'Software'],
    tags: ['simulation', 'software', 'development'],
    route: '/projects/sim',
    dateCreated: '2024-01-01',
  },
  {
    id: 'sos',
    title: 'sOS',
    description: 'Shadow Operating System',
    category: 'Software',
    status: 'In Progress',
    technology: ['Operating System', 'Low-level'],
    tags: ['os', 'system', 'low-level', 'kernel'],
    route: '/projects/sos',
    dateCreated: '2023-06-15',
  },
  {
    id: 's9',
    title: 'S9',
    description: 'Shadow Home Server',
    category: 'Hardware',
    status: 'Active',
    technology: ['Server', 'Networking', 'Linux'],
    tags: ['server', 'networking', 'nas', 'ubuntu', 'homelab'],
    route: '/projects/s9',
    dateCreated: '2024-10-01',
  },
  {
    id: 'nfi',
    title: 'NFI',
    description: 'Rocket Propulsion System',
    category: 'Hardware',
    status: 'Completed',
    technology: ['Aerospace', 'Engineering'],
    tags: ['rocket', 'propulsion', 'aerospace', 'engineering'],
    route: '/projects/nfi',
    dateCreated: '2022-03-01',
  },
  {
    id: 'muse',
    title: 'Muse',
    description: 'Automated Audio Equalizer',
    category: 'Hardware',
    status: 'Discontinued',
    technology: ['Audio', 'Electronics'],
    tags: ['audio', 'music', 'equalizer', 'electronics'],
    route: '/projects/muse',
    dateCreated: '2018-03-01',
  },
  {
    id: 'el',
    title: 'EyeLearn',
    description: 'Academia AR/VR Headset',
    category: 'Hardware',
    status: 'Paused',
    technology: ['AR/VR', 'Education'],
    tags: ['ar', 'vr', 'education', 'headset', 'learning'],
    route: '/projects/el',
    dateCreated: '2021-09-01',
  },
  {
    id: 'naton',
    title: 'Naton',
    description: 'Element Converter',
    category: 'Hardware',
    status: 'Completed',
    technology: ['Chemistry', 'Physics'],
    tags: ['chemistry', 'physics', 'converter', 'elements'],
    route: '/projects/naton',
    dateCreated: '2020-01-15',
  },
];

export const normalizeProject = (source: any): Project | null => {
  if (!source) {
    return null;
  }

  const id = source.id || source.slug || source._id || '';
  const derivedRoute = source.route || source.path || (id ? `/projects/${id}` : '#');
  const slugFromRoute = derivedRoute?.split?.('/')?.filter(Boolean).pop();
  const slug = (source.slug || slugFromRoute || id || '').toLowerCase();

  const tags = Array.isArray(source.tags)
    ? source.tags
    : Array.isArray(source.technology)
      ? source.technology
      : [];

  const technology = Array.isArray(source.technology) ? source.technology : tags;

  return {
    id,
    slug,
    title: source.title || 'Untitled Project',
    description: source.description || '',
    category: source.category || source.type || 'Uncategorized',
    status: source.status || source.stage || 'Unknown',
    tags,
    technology,
    dateCreated: source.dateCreated || source.createdAt || null,
    updatedAt: source.updatedAt || null,
    route: derivedRoute,
    path: source.path || derivedRoute,
    raw: source,
  };
};
