import { getProjectModel } from '../../_lib/projects';
import { verifyAccessToken } from '../../_lib/auth';

async function authenticateRequest(req, res) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return false;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    return true;
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
    return false;
  }
}

export default async function handler(req, res) {
  const isAuthenticated = await authenticateRequest(req, res);
  if (!isAuthenticated) {
    return;
  }

  try {
    const ProjectModel = await getProjectModel();
    const { id } = req.query;

    switch (req.method) {
      case 'PUT': {
        const { title, description, path, component } = req.body;

        const updatedProject = await ProjectModel.findByIdAndUpdate(
          id,
          {
            title,
            description,
            path,
            component,
            updatedAt: Date.now(),
          },
          { new: true, runValidators: true }
        );

        if (!updatedProject) {
          res.status(404).json({ error: 'Project not found' });
          break;
        }

        res.status(200).json({
          message: 'Project updated successfully',
          project: updatedProject,
        });
        break;
      }
      case 'DELETE': {
        const deletedProject = await ProjectModel.findByIdAndDelete(id);

        if (!deletedProject) {
          res.status(404).json({ error: 'Project not found' });
          break;
        }

        res.status(200).json({
          message: 'Project deleted successfully',
          project: deletedProject,
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
}
