import { getProjectModel } from '../_lib/projects';
import { verifyAccessToken } from '../_lib/auth';

async function authenticateRequest(req, res) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return false;
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../_lib/db.js';
import { ProjectModel } from '../_lib/models.js';
import { logProjectMutation } from '../_lib/audit.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

import ProjectModel, { sanitizeProjectPayload, validateProjectPayload } from './projectModel.js';
import { connectToDatabase, ProjectModel } from '../_lib/projects';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

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
  published: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

const ProjectModel = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

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
  buildBulkDeleteQuery,
} from '../../lib/adminProjects';

function collectIdentifiers(body) {
  if (!body) {
    return [];
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return true;
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
    return false;
    return res.status(401).json({ error: 'Invalid token' });
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
  verifyToken(req, res, async () => {
    try {
      await connectToDatabase();

      switch (req.method) {
        case 'GET': {
          const projects = await ProjectModel.find().sort({ createdAt: -1 });
        case 'GET':
          // Get all projects ordered by display order first then creation time
          const projects = await ProjectModel.find().sort({ displayOrder: 1, createdAt: -1 });
          // Get all projects
          const projects = await ProjectModel.find().sort({ order: 1, createdAt: -1 });
          // Get all projects, newest first by project date
          const projects = await ProjectModel.find().sort({ dateCreated: -1 });
          res.status(200).json({ projects });
          break;
        }

        case 'POST': {
          const { id, title, description, path, component, published } = req.body;

          const existingProject = await ProjectModel.findOne({ id });
        case 'POST':
          // Create new project
          const { id, title, description, path, component, displayOrder, published } = req.body;
          const { id, title, description, path, component, published = true, order } = req.body;
          let sanitizedProject;
          try {
            sanitizedProject = sanitizeProjectPayload(req.body, { applyDefaults: true });
          } catch (validationError) {
            return res.status(400).json({ error: validationError.message });
          }

          const validationErrors = validateProjectPayload(sanitizedProject, { requireAllFields: true });
          if (validationErrors.length > 0) {
            return res.status(400).json({ error: validationErrors.join(', ') });
          }

          // Check if project with same ID already exists
          const existingProject = await ProjectModel.findOne({ id: sanitizedProject.id });
          if (existingProject) {
            return res.status(400).json({ error: 'Project with this ID already exists' });
          }

          const newProject = await ProjectModel.create({
          const projectCount = await ProjectModel.countDocuments();
          const parsedOrder = Number(displayOrder);
          const normalizedOrder = Number.isFinite(parsedOrder) ? parsedOrder : projectCount;

          const normalizedPublished = published === false || published === 'false' ? false : true;
          const highestOrder = await ProjectModel.findOne().sort({ order: -1 });
          const parsedOrder = Number(order);
          const nextOrder = Number.isFinite(parsedOrder)
            ? parsedOrder
            : highestOrder
              ? highestOrder.order + 1
              : 0;

          const newProject = new ProjectModel({
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
            displayOrder: normalizedOrder,
            published: normalizedPublished
            published,
            order: nextOrder,
          const newProject = new ProjectModel(sanitizedProject);
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

          res.status(201).json({ message: 'Project created successfully', project: newProject });
          break;
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
  });
  } catch (error) {
    console.error('Projects API error:', error);
    if (error && error.code === 11000) {
      return res.status(409).json({ error: 'Project with this ID already exists' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
