import jwt from 'jsonwebtoken';
import { connectToDatabase, ProjectModel } from '../../_lib/projects';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
import {
  connectToDatabase,
  ProjectModel,
  ensureAuthenticated,
  normalizeProjectInput,
  buildProjectLookup,
} from '../../../lib/adminProjects';

function getIdentifier(param) {
  if (Array.isArray(param)) {
    return param[0];
  }
  return param;
}

export default async function handler(req, res) {
  if (!ensureAuthenticated(req, res)) {
    return;
  }

  const identifier = getIdentifier(req.query?.id);
  const lookup = buildProjectLookup(identifier);

  if (!lookup) {
    return res.status(400).json({ error: 'Project identifier is required' });
  }

  try {
    await connectToDatabase();
  } catch (error) {
    console.error('Project API connection error:', error);
    return res.status(500).json({ error: 'Failed to connect to database' });
  }

  try {
    switch (req.method) {
      case 'GET': {
        const project = await ProjectModel.findOne(lookup);
        if (!project) {
          return res.status(404).json({ error: 'Project not found' });
        }
        return res.status(200).json({ project });
      }

      case 'PUT': {
        let payload;
        try {
          payload = normalizeProjectInput(req.body);
        } catch (error) {
          return res.status(400).json({ error: error.message });
        }

        if (!payload || Object.keys(payload).length === 0) {
          return res.status(400).json({ error: 'No update fields provided' });
        }

        payload.route = payload.route || payload.path;
        if (payload.id) {
          payload.route = payload.route || `/projects/${payload.id}`;
          payload.path = payload.path || payload.route;
        } else if (payload.route && !payload.path) {
          payload.path = payload.route;
        }

        const updatedProject = await ProjectModel.findOneAndUpdate(
          lookup,
          { $set: payload },
          { new: true, runValidators: true },
        );

        if (!updatedProject) {
          return res.status(404).json({ error: 'Project not found' });
        }

        return res.status(200).json({
          message: 'Project updated successfully',
          project: updatedProject,
        });
      }

      case 'DELETE': {
        const deletedProject = await ProjectModel.findOneAndDelete(lookup);

        if (!deletedProject) {
          return res.status(404).json({ error: 'Project not found' });
        }

        return res.status(200).json({
          message: 'Project deleted successfully',
          project: deletedProject,
        });
      }

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Project API error:', error);
    if (error && error.code === 11000) {
      return res.status(409).json({ error: 'Project with this ID already exists' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
