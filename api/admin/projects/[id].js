import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import ProjectModel, { sanitizeProjectPayload, validateProjectPayload } from '../projectModel.js';

const MONGO_URI = process.env.MONGO_URI;
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

export default async function handler(req, res) {
  // Verify authentication for all operations
  verifyToken(req, res, async () => {
    try {
      await connectToDatabase();
      const { id } = req.query;

      switch (req.method) {
        case 'PUT':
          // Update project
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
      }
    } catch (error) {
      console.error('Project API error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
} 