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
  }

  const token = authHeader.split(' ')[1];
  console.log('Extracted token:', token ? `[${token.length} chars]` : 'MISSING');
  console.log('Token format check:', authHeader.startsWith('Bearer ') ? 'Valid Bearer format' : 'Invalid format');
  
  try {
    console.log('Attempting JWT verification with secret length:', JWT_SECRET?.length || 0);
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ TOKEN VERIFIED SUCCESSFULLY');
    console.log('Decoded payload:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.log('❌ TOKEN VERIFICATION FAILED');
    console.error('JWT error:', error.message);
    console.error('Error type:', error.name);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export default async function handler(req, res) {
  console.log('\n' + '='.repeat(50));
  console.log('📁 ADMIN PROJECTS API CALLED');
  console.log('Time:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('='.repeat(50));
  
  // Verify authentication for all operations
  verifyToken(req, res, async () => {
    console.log('\n💾 DATABASE CONNECTION:');
    try {
      console.log('Attempting to connect to database...');
      await connectToDatabase();
      console.log('✅ Database connected successfully');

      switch (req.method) {
        case 'GET':
          // Get all projects
          const projects = await ProjectModel.find().sort({ createdAt: -1 });
          res.status(200).json({ projects });
          break;

        case 'POST':
          // Create new project
          const { id, title, description, path, component } = req.body;
          
          // Check if project with same ID already exists
          const existingProject = await ProjectModel.findOne({ id });
          if (existingProject) {
            return res.status(400).json({ error: 'Project with this ID already exists' });
          }

          const newProject = new ProjectModel({
            id,
            title,
            description,
            path,
            component
          });

          await newProject.save();
          res.status(201).json({ message: 'Project created successfully', project: newProject });
          break;

        default:
          res.status(405).json({ error: 'Method not allowed' });
      }
    } catch (error) {
      console.error('Projects API error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
} 