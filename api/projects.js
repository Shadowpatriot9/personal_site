import { getProjectModel } from './_lib/projects';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const ProjectModel = await getProjectModel();
    const projects = await ProjectModel.find().sort({ createdAt: -1 });
    res.status(200).json({ projects });
  } catch (error) {
    console.error('Public projects API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
