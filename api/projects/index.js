import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  const client = await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  cachedDb = client;
  return client;
}

const ProjectSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  path: { type: String, required: true },
  component: { type: String, required: true },
  displayOrder: { type: Number, default: 0 },
  published: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ProjectModel = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
import { connectToDatabase, ProjectModel } from '../_lib/projects';

function sanitizeProject(projectDoc) {
  const project = projectDoc.toObject({ getters: false, virtuals: false });
  const normalizedPath = project.path?.startsWith('/') ? project.path : `/projects/${project.id}`;

  return {
    id: project.id,
    title: project.title,
    description: project.description,
    route: normalizedPath || `/projects/${project.id}`,
    category: project.category || 'General',
    status: project.status || 'Active',
    technology: Array.isArray(project.technology) ? project.technology : [],
    tags: Array.isArray(project.tags) ? project.tags : [],
    dateCreated: project.dateCreated || project.createdAt || project.updatedAt,
    updatedAt: project.updatedAt,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    const projects = await ProjectModel.find({ published: { $ne: false } })
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    const sanitizedProjects = projects.map(({ _id, __v, ...rest }) => rest);

    res.status(200).json({ projects: sanitizedProjects });
  } catch (error) {
    console.error('Public projects API error:', error);
    res.status(500).json({ error: 'Internal server error' });
    const projects = await ProjectModel.find().sort({ createdAt: -1 });
    const sanitizedProjects = projects.map((project) => sanitizeProject(project));

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
