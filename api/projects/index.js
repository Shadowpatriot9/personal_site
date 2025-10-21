import { connectToDatabase } from '../_lib/db.js';
import { ProjectModel } from '../_lib/models.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    const projects = await ProjectModel.find({ published: true }).sort({ createdAt: -1 });
    res.status(200).json({ projects });
  } catch (error) {
    console.error('Public projects API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
