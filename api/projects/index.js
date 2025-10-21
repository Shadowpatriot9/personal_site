import { connectToDatabase, ProjectModel } from '../../lib/adminProjects';

const sanitizeProject = (projectDoc) => {
  const project = projectDoc.toObject({ getters: false, virtuals: false });
  const route = project.route || project.path || (project.id ? `/projects/${project.id}` : '#');

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
    dateCreated: project.dateCreated || project.createdAt || project.updatedAt,
    updatedAt: project.updatedAt,
  };
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    const projects = await ProjectModel.find({ isArchived: { $ne: true } })
      .sort({ dateCreated: -1, createdAt: -1 })
      .limit(100);

    const sanitizedProjects = projects.map(sanitizeProject);

    const cacheControl = 's-maxage=60, stale-while-revalidate=300';
    res.setHeader('Cache-Control', cacheControl);
    res.setHeader('CDN-Cache-Control', cacheControl);
    res.setHeader('Vercel-CDN-Cache-Control', cacheControl);

    return res.status(200).json({ projects: sanitizedProjects });
  } catch (error) {
    console.error('Public projects API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
