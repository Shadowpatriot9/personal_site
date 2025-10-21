import jwt from 'jsonwebtoken';
import { connectToDatabase, ProjectModel } from '../../_lib/projects';

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

export default async function handler(req, res) {
  // Verify authentication for all operations
  verifyToken(req, res, async () => {
    try {
      await connectToDatabase();
      const { id } = req.query;

      switch (req.method) {
        case 'PUT':
          // Update project
          const { title, description, path, component } = req.body;
          
          const updatedProject = await ProjectModel.findByIdAndUpdate(
            id,
            {
              title,
              description,
              path,
              component,
              updatedAt: Date.now()
            },
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