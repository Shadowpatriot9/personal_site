import jwt from 'jsonwebtoken';
import { connectToDatabase, ProjectModel } from '../_lib/projects';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  console.log('\n' + '='.repeat(50));
  console.log('🛡️ TOKEN VERIFICATION STARTED');
  console.log('Time:', new Date().toISOString());
  
  const authHeader = req.headers.authorization;
  console.log('Authorization header:', authHeader ? `[${authHeader.length} chars]` : 'MISSING');
  
  if (!authHeader) {
    console.log('❌ TOKEN VERIFICATION FAILED: No authorization header');
    return res.status(401).json({ error: 'No token provided' });
import {
  connectToDatabase,
  ProjectModel,
  ensureAuthenticated,
  normalizeProjectInput,
  buildBulkDeleteQuery,
} from '../../lib/adminProjects';

function collectIdentifiers(body) {
  if (!body) {
    return [];
  }

  if (Array.isArray(body)) {
    return body;
  }

  if (typeof body === 'string' || typeof body === 'number') {
    return [body];
  }

  const identifiers = new Set();

  ['ids', 'projectIds', 'slugs', 'identifiers'].forEach((key) => {
    const value = body[key];
    if (Array.isArray(value)) {
      value.forEach((item) => identifiers.add(item));
    }
  });

  ['id', '_id', 'identifier'].forEach((key) => {
    if (body[key]) {
      identifiers.add(body[key]);
    }
  });

  return Array.from(identifiers);
}

export default async function handler(req, res) {
  if (!ensureAuthenticated(req, res)) {
    return;
  }

  try {
    await connectToDatabase();
  } catch (error) {
    console.error('Projects API connection error:', error);
    return res.status(500).json({ error: 'Failed to connect to database' });
  }

  try {
    switch (req.method) {
      case 'GET': {
        const projects = await ProjectModel.find().sort({ createdAt: -1 });
        return res.status(200).json({ projects });
      }

      case 'POST': {
        let payload;
        try {
          payload = normalizeProjectInput(req.body);
        } catch (error) {
          return res.status(400).json({ error: error.message });
        }

        const requiredFields = ['id', 'title', 'description'];
        const missingFields = requiredFields.filter((field) => !payload[field]);

        if (missingFields.length > 0) {
          return res.status(400).json({
            error: `Missing required fields: ${missingFields.join(', ')}`,
          });
        }

        if (!payload.component) {
          return res.status(400).json({ error: 'Missing required field: component' });
        }

        const existingProject = await ProjectModel.findOne({ id: payload.id });
        if (existingProject) {
          return res.status(400).json({ error: 'Project with this ID already exists' });
        }

        if (!payload.dateCreated) {
          payload.dateCreated = new Date();
        }

        payload.route = payload.route || payload.path || `/projects/${payload.id}`;
        payload.path = payload.path || payload.route;

        const newProject = await ProjectModel.create(payload);
        return res.status(201).json({
          message: 'Project created successfully',
          project: newProject,
        });
      }

      case 'PUT': {
        let payload;
        try {
          payload = normalizeProjectInput(req.body);
        } catch (error) {
          return res.status(400).json({ error: error.message });
        }

        const projectId = payload.id || (typeof req.body?.id === 'string' ? req.body.id.trim() : null);

        if (!projectId) {
          return res.status(400).json({ error: 'Project id is required' });
        }

        payload.id = projectId;

        const existingProject = await ProjectModel.findOne({ id: projectId });
        const isUpdate = Boolean(existingProject);

        if (!isUpdate) {
          const requiredFields = ['title', 'description', 'component'];
          const missingFields = requiredFields.filter((field) => !payload[field]);

          if (missingFields.length > 0) {
            return res.status(400).json({
              error: `Missing required fields for creation: ${missingFields.join(', ')}`,
            });
          }

          if (!payload.dateCreated) {
            payload.dateCreated = new Date();
          }
        }

        payload.route = payload.route || payload.path || `/projects/${payload.id}`;
        payload.path = payload.path || payload.route;

        const updatedProject = await ProjectModel.findOneAndUpdate(
          { id: projectId },
          { $set: payload },
          {
            new: true,
            runValidators: true,
            upsert: !isUpdate,
            setDefaultsOnInsert: true,
          },
        );

        return res.status(isUpdate ? 200 : 201).json({
          message: isUpdate ? 'Project updated successfully' : 'Project created successfully',
          project: updatedProject,
        });
      }

      case 'DELETE': {
        const identifiers = collectIdentifiers(req.body);
        const query = buildBulkDeleteQuery(identifiers);

        if (!query) {
          return res.status(400).json({ error: 'No valid project identifiers provided' });
        }

        const result = await ProjectModel.deleteMany(query);

        if (result.deletedCount === 0) {
          return res.status(404).json({ error: 'No matching projects found to delete' });
        }

        return res.status(200).json({
          message: `Deleted ${result.deletedCount} project(s)`,
          deletedCount: result.deletedCount,
        });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Projects API error:', error);
    if (error && error.code === 11000) {
      return res.status(409).json({ error: 'Project with this ID already exists' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
