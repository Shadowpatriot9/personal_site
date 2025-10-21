import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../_lib/db.js';
import { ProjectModel } from '../_lib/models.js';
import { logProjectMutation } from '../_lib/audit.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function normalizePublishedValue(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }

  return false;
}

export default async function handler(req, res) {
  verifyToken(req, res, async () => {
    try {
      await connectToDatabase();

      switch (req.method) {
        case 'GET': {
          const projects = await ProjectModel.find().sort({ createdAt: -1 });
          res.status(200).json({ projects });
          break;
        }

        case 'POST': {
          const { id, title, description, path, component, published } = req.body;

          const existingProject = await ProjectModel.findOne({ id });
          if (existingProject) {
            return res.status(400).json({ error: 'Project with this ID already exists' });
          }

          const newProject = await ProjectModel.create({
            id,
            title,
            description,
            path,
            component,
            published: normalizePublishedValue(published),
          });

          await logProjectMutation({
            projectId: newProject._id,
            projectIdentifier: newProject.id,
            action: 'create',
            actor: req.user?.username,
            after: newProject.toObject(),
            summary: `Project "${newProject.title}" was created`,
          });

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
  });
}
