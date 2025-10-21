import jwt from 'jsonwebtoken';
import ProjectModel, { sanitizeProjectPayload, validateProjectPayload } from '../projectModel.js';
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

// Project Schema
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

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
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

export default async function handler(req, res) {
  // Verify authentication for all operations
  verifyToken(req, res, async () => {
    try {
      await connectToDatabase();
      const { id } = req.query;

      switch (req.method) {
        case 'PUT':
          // Update project
          const allowedFields = ['id', 'title', 'description', 'path', 'component', 'displayOrder', 'published'];
          const updateData = { updatedAt: Date.now() };

          allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
              if (field === 'displayOrder') {
                const parsedOrder = Number(req.body[field]);
                if (Number.isFinite(parsedOrder)) {
                  updateData.displayOrder = parsedOrder;
                }
              } else if (field === 'published') {
                const value = req.body[field];
                updateData.published = value === false || value === 'false' ? false : true;
              } else {
                updateData[field] = req.body[field];
              }
            }
          });

          const updatedProject = await ProjectModel.findByIdAndUpdate(
            id,
            updateData,
          let sanitizedUpdate;
          try {
            sanitizedUpdate = sanitizeProjectPayload(req.body, { applyDefaults: false });
          } catch (validationError) {
            return res.status(400).json({ error: validationError.message });
          }

          const validationErrors = validateProjectPayload(sanitizedUpdate, { requireAllFields: true });
          if (validationErrors.length > 0) {
            return res.status(400).json({ error: validationErrors.join(', ') });
          }

          if (sanitizedUpdate.id) {
            const duplicate = await ProjectModel.findOne({ id: sanitizedUpdate.id, _id: { $ne: id } });
            if (duplicate) {
              return res.status(400).json({ error: 'Another project with this ID already exists' });
            }
          }

          const updatedProject = await ProjectModel.findByIdAndUpdate(
            id,
            sanitizedUpdate,
            { new: true, runValidators: true }
          );

          if (!updatedProject) {
            return res.status(404).json({ error: 'Project not found' });
          }

          res.status(200).json({ 
            message: 'Project updated successfully', 
            project: updatedProject 
          });
          break;

        case 'DELETE':
          // Delete project
          const deletedProject = await ProjectModel.findByIdAndDelete(id);
          
          if (!deletedProject) {
            return res.status(404).json({ error: 'Project not found' });
          }

          res.status(200).json({ 
            message: 'Project deleted successfully', 
            project: deletedProject 
          });
          break;

        default:
          res.status(405).json({ error: 'Method not allowed' });
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
