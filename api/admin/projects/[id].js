import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

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