import {
  connectToDatabase,
  ProjectModel,
  ensureAuthenticated,
  normalizeProjectInput,
  buildProjectLookup,
} from '../../../lib/adminProjects';

const getIdentifier = (param) => (Array.isArray(param) ? param[0] : param);

export default async function handler(req, res) {
  if (!ensureAuthenticated(req, res)) {
    return;
  }

  const identifier = getIdentifier(req.query?.id);
  const lookup = buildProjectLookup(identifier);

  if (!lookup) {
    return res.status(400).json({ error: 'Project identifier is required' });
  }

  try {
    await connectToDatabase();
  } catch (error) {
    console.error('Admin project connection error:', error);
    return res.status(500).json({ error: 'Failed to connect to database' });
  }

  switch (req.method) {
    case 'GET': {
      try {
        const project = await ProjectModel.findOne(lookup);
        if (!project) {
          return res.status(404).json({ error: 'Project not found' });
        }
        return res.status(200).json({ project });
      } catch (error) {
        console.error('Failed to load project:', error);
        return res.status(500).json({ error: 'Unable to load project' });
      }
    }

    case 'PUT': {
      try {
        const payload = normalizeProjectInput(req.body);
        if (payload.id) {
          const duplicateFilter = { id: payload.id };
          if (lookup._id) {
            duplicateFilter._id = { $ne: lookup._id };
          }

          const duplicate = await ProjectModel.findOne(duplicateFilter);
          if (duplicate) {
            return res.status(409).json({ error: 'Another project with this id already exists' });
          }
        }

        const updated = await ProjectModel.findOneAndUpdate(
          lookup,
          { $set: { ...payload, updatedAt: new Date() } },
          { new: true, runValidators: true },
        );

        if (!updated) {
          return res.status(404).json({ error: 'Project not found' });
        }

        return res.status(200).json({ project: updated });
      } catch (error) {
        console.error('Failed to update project:', error);
        return res.status(500).json({ error: 'Unable to update project' });
      }
    }

    case 'DELETE': {
      try {
        const result = await ProjectModel.findOneAndDelete(lookup);
        if (!result) {
          return res.status(404).json({ error: 'Project not found' });
        }
        return res.status(204).end();
      } catch (error) {
        console.error('Failed to delete project:', error);
        return res.status(500).json({ error: 'Unable to delete project' });
      }
    }

    default: {
      res.setHeader('Allow', 'GET, PUT, DELETE');
      return res.status(405).json({ error: 'Method not allowed' });
    }
  }
}
