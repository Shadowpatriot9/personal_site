import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

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

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    const projects = await ProjectModel.find({ published: { $ne: false } })
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    const sanitizedProjects = projects.map(({ _id, __v, ...rest }) => rest);

    res.status(200).json({ projects: sanitizedProjects });
  } catch (error) {
    console.error('Public projects API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
