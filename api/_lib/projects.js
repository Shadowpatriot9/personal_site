import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

const cached = global.mongoose || { conn: null, promise: null };
if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    if (!MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not defined');
    }

    cached.promise = mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then((mongooseInstance) => mongooseInstance);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

const ProjectSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  path: { type: String, required: true },
  component: { type: String, required: true },
  category: { type: String, default: 'General' },
  status: { type: String, default: 'Active' },
  technology: { type: [String], default: [] },
  tags: { type: [String], default: [] },
  dateCreated: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { minimize: false });

export const ProjectModel = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
