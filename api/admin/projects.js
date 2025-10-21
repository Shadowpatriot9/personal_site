import {
  connectToDatabase,
  ProjectModel,
  ensureAuthenticated,
  normalizeProjectInput,
  buildBulkDeleteQuery,
} from '../../lib/adminProjects';

const sortProjects = () => ({ order: 1, dateCreated: -1, createdAt: -1 });

export default async function handler(req, res) {
  if (!ensureAuthenticated(req, res)) {
    return;
  }

  try {
    await connectToDatabase();
  } catch (error) {
    console.error('Admin projects connection error:', error);
    return res.status(500).json({ error: 'Failed to connect to database' });
  }

  switch (req.method) {
    case 'GET': {
      try {
        const projects = await ProjectModel.find().sort(sortProjects());
        return res.status(200).json({ projects });
      } catch (error) {
        console.error('Failed to load projects:', error);
        return res.status(500).json({ error: 'Unable to load projects' });
      }
    }

    case 'POST': {
      try {
        const payload = normalizeProjectInput(req.body);
        if (!payload.id || !payload.title || !payload.description || !payload.path || !payload.component) {
          return res.status(400).json({ error: 'id, title, description, path, and component are required' });
        }

        const existing = await ProjectModel.findOne({ id: payload.id });
        if (existing) {
          return res.status(409).json({ error: 'A project with this id already exists' });
        }

        const project = await ProjectModel.create(payload);
        return res.status(201).json({ project });
      } catch (error) {
        console.error('Failed to create project:', error);
        return res.status(500).json({ error: 'Unable to create project' });
      }
    }

    case 'PATCH': {
      const updates = Array.isArray(req.body) ? req.body : [];
      if (updates.length === 0) {
        return res.status(400).json({ error: 'No updates provided' });
      }

      const operations = updates
        .filter((item) => item && item._id)
        .map((item) => ({
          updateOne: {
            filter: { _id: item._id },
            update: { $set: { order: Number.isFinite(Number(item.order)) ? Number(item.order) : 0 } },
          },
        }));

      if (operations.length === 0) {
        return res.status(400).json({ error: 'No valid updates provided' });
      }

      try {
        await ProjectModel.bulkWrite(operations);
        const projects = await ProjectModel.find().sort(sortProjects());
        return res.status(200).json({ projects });
      } catch (error) {
        console.error('Failed to reorder projects:', error);
        return res.status(500).json({ error: 'Unable to reorder projects' });
      }
    }

    case 'DELETE': {
      const query = buildBulkDeleteQuery(req.body);
      if (!query) {
        return res.status(400).json({ error: 'No project identifiers provided' });
      }

      try {
        const result = await ProjectModel.deleteMany(query);
        return res.status(200).json({ deletedCount: result.deletedCount });
      } catch (error) {
        console.error('Failed to delete projects:', error);
        return res.status(500).json({ error: 'Unable to delete projects' });
      }
    }

    default: {
      res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
      return res.status(405).json({ error: 'Method not allowed' });
    }
  }
}
