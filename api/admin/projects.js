import { getProjectModel } from '../_lib/projects';
import { verifyAccessToken } from '../_lib/auth';

async function authenticateRequest(req, res) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return false;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    return true;
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
    return false;
  }
}

export default async function handler(req, res) {
  const isAuthenticated = await authenticateRequest(req, res);
  if (!isAuthenticated) {
    return;
  }

  try {
    const ProjectModel = await getProjectModel();

    switch (req.method) {
      case 'GET': {
        const projects = await ProjectModel.find().sort({ createdAt: -1 });
        res.status(200).json({ projects });
        break;
      }
      case 'POST': {
        const { id, title, description, path, component } = req.body;

        const existingProject = await ProjectModel.findOne({ id });
        if (existingProject) {
          res.status(400).json({ error: 'Project with this ID already exists' });
          break;
        }

        const newProject = new ProjectModel({
          id,
          title,
          description,
          path,
          component,
        });

        await newProject.save();
        res.status(201).json({ message: 'Project created successfully', project: newProject });
        break;
      }
      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Projects API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
