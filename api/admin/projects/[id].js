import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../../_lib/db.js';
import { ProjectModel } from '../../_lib/models.js';
import { logProjectMutation } from '../../_lib/audit.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

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

function normalizePublishedValue(value, fallback) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }

  return typeof fallback === 'boolean' ? fallback : false;
}

export default async function handler(req, res) {
  verifyToken(req, res, async () => {
    try {
      await connectToDatabase();
      const { id } = req.query;

      switch (req.method) {
        case 'PUT': {
          const { title, description, path, component, published } = req.body;
          const project = await ProjectModel.findById(id);

          if (!project) {
            return res.status(404).json({ error: 'Project not found' });
          }

          const before = project.toObject();

          if (typeof title !== 'undefined') project.title = title;
          if (typeof description !== 'undefined') project.description = description;
          if (typeof path !== 'undefined') project.path = path;
          if (typeof component !== 'undefined') project.component = component;
          if (typeof published !== 'undefined') {
            project.published = normalizePublishedValue(published, project.published);
          }
          project.updatedAt = new Date();

          await project.save();

          const after = project.toObject();
          const publishedChanged = typeof published !== 'undefined' && before.published !== after.published;

          await logProjectMutation({
            projectId: project._id,
            projectIdentifier: project.id,
            action: 'update',
            actor: req.user?.username,
            before,
            after,
            summary: publishedChanged
              ? `Project "${project.title}" was ${project.published ? 'published' : 'unpublished'}`
              : `Project "${project.title}" was updated`,
          });

          res.status(200).json({
            message: 'Project updated successfully',
            project: after,
          });
          break;
        }

        case 'DELETE': {
          const project = await ProjectModel.findById(id);

          if (!project) {
            return res.status(404).json({ error: 'Project not found' });
          }

          const before = project.toObject();
          await project.deleteOne();

          await logProjectMutation({
            projectId: before._id,
            projectIdentifier: before.id,
            action: 'delete',
            actor: req.user?.username,
            before,
            summary: `Project "${before.title}" was deleted`,
          });

          res.status(200).json({
            message: 'Project deleted successfully',
            project: before,
          });
          break;
        }

        default:
          res.status(405).json({ error: 'Method not allowed' });
      }
    } catch (error) {
      console.error('Project API error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}
